import * as $ from 'jquery'
import { applyAll } from '../../util'
import Promise from '../../common/Promise'
import EventSource from './EventSource'


export default class JsonFeedEventSource extends EventSource {

	static AJAX_DEFAULTS = {
		dataType: 'json',
		cache: false
	}

	// these props must all be manually set before calling fetch
	url: any
	startParam: any
	endParam: any
	timezoneParam: any
	ajaxSettings: any // does not include url


	fetch(start, end, timezone) {
		var ajaxSettings = this.ajaxSettings;
		var onSuccess = ajaxSettings.success;
		var onError = ajaxSettings.error;
		var requestParams = this.buildRequestParams(start, end, timezone);

		// todo: eventually handle the promise's then,
		// don't intercept success/error
		// tho will be a breaking API change

		this.calendar.pushLoading();

		return Promise.construct((onResolve, onReject) => {
			$.ajax($.extend(
				{}, // destination
				JsonFeedEventSource.AJAX_DEFAULTS,
				ajaxSettings,
				{
					url: this.url,
					data: requestParams,
					success: (rawEventDefs, status, xhr) => {
						var callbackRes;

						this.calendar.popLoading();

						if (rawEventDefs) {
							callbackRes = applyAll(onSuccess, this, [ rawEventDefs, status, xhr ]); // redirect `this`

							if ($.isArray(callbackRes)) {
								rawEventDefs = callbackRes;
							}

							onResolve(this.parseEventDefs(rawEventDefs));
						}
						else {
							onReject();
						}
					},
					error: (data, status, xhr) => {
						this.calendar.popLoading();

						applyAll(onError, this, [ data, status, xhr ]); // redirect `this`
						onReject();
					}
				}
			));
		});
	}


	buildRequestParams(start, end, timezone) {
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
	}


	getPrimitive() {
		return this.url;
	}


	applyMiscProps(rawProps) {
		this.ajaxSettings = rawProps;
	}


	static parse(rawInput, calendar) {
		var rawProps;

		// normalize raw input
		if (typeof rawInput.url === 'string') { // extended form
			rawProps = rawInput;
		}
		else if (typeof rawInput === 'string') { // short form
			rawProps = { url: rawInput };
		}

		if (rawProps) {
			return EventSource.parse.call(this, rawProps, calendar);
		}

		return false;
	}

}


JsonFeedEventSource.defineStandardProps({
	// automatically transfer (true)...
	url: true,
	startParam: true,
	endParam: true,
	timezoneParam: true
});
