
var JsonFeedEventSource = EventSource.extend({

	// these props must all be manually set before calling fetch
	startParam: null,
	endParam: null,
	timezoneParam: null,
	ajaxSettings: null,


	fetch: function(start, end, timezone) {
		var _this = this;
		var ajaxSettings = this.ajaxSettings;
		var onSuccess = ajaxSettings.success;
		var onError = ajaxSettings.error;
		var requestParams = this.buildRequestParams(start, end, timezone);

		// todo: eventually handle the promise's then,
		// don't intercept success/error
		// tho will be a breaking API change

		return Promise.construct(function(onResolve, onReject) {
			$.ajax($.extend(
				{}, // avoid mutation
				JsonFeedEventSource.AJAX_DEFAULTS,
				ajaxSettings, // should have a `url`
				{
					data: requestParams,
					success: function(rawEventDefs) {
						var callbackRes;

						if (rawEventDefs) {
							callbackRes = applyAll(onSuccess, this, arguments); // redirect `this`

							if ($.isArray(callbackRes)) {
								rawEventDefs = callbackRes;
							}

							onResolve(_this.parseEventDefs(rawEventDefs));
						}
						else {
							onReject();
						}
					},
					error: function() {
						applyAll(onError, this, arguments); // redirect `this`
						onReject();
					}
				}
			));
		});
	},


	buildRequestParams: function(start, end, timezone) {
		var calendar = this.calendar;
		var ajaxSettings = this.ajaxSettings;
		var startParam, endParam, timezoneParam;
		var customRequestParams;
		var params = {};

		startParam = this.startParam;
		if (startParam == null) {
			startParam = calendar.opt('startParam');
		}

		endParam = this.endParam;
		if (endParam == null) {
			endParam = calendar.opt('endParam');
		}

		timezoneParam = this.timezoneParam;
		if (timezoneParam == null) {
			timezoneParam = calendar.opt('timezoneParam');
		}

		// retrieve any outbound GET/POST $.ajax data from the options
		if ($.isFunction(ajaxSettings.data)) {
			// supplied as a function that returns a key/value object
			customRequestParams = ajaxSettings.data();
		}
		else {
			// probably supplied as a straight key/value object
			customRequestParams = ajaxSettings.data || {};
		}

		$.extend(params, customRequestParams);

		params[startParam] = start.format();
		params[endParam] = end.format();

		if (timezone && timezone !== 'local') {
			params[timezoneParam] = timezone;
		}

		return params;
	},


	getPrimitive: function() {
		return this.ajaxSettings.url;
	}

});


JsonFeedEventSource.AJAX_DEFAULTS = {
	dataType: 'json',
	cache: false
};


JsonFeedEventSource.parse = function(rawInput, calendar) {
	var rawProps;
	var source;

	if (typeof rawInput === 'string') {
		rawProps =  { url: rawInput };
	}
	else if (typeof rawInput.url === 'string') {
		rawProps = $.extend({}, rawInput); // copy
	}

	if (rawProps) {
		source = EventSource.parseAndPluck.call(this, rawProps, calendar);

		source.startParam = pluckProp(rawProps, 'startParam');
		source.endParam = pluckProp(rawProps, 'endParam');
		source.timezoneParam = pluckProp(rawProps, 'timezoneParam');
		source.ajaxSettings = rawProps; // remainder

		return source;
	}
};


EventSourceParser.registerClass(JsonFeedEventSource);

FC.JsonFeedEventSource = JsonFeedEventSource;
