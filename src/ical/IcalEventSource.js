
var IcalEventSource = EventSource.extend({
	
	icalSource: null,
	ajaxSettings: null,

	fetch: function(start, end, timezone) {
		var _this = this;
		var url = this.icalSource;
		var ajaxSettings = this.ajaxSettings;
		var onSuccess = ajaxSettings.success;

		return Promise.construct(function(onResolve, onReject) {
			$.ajax($.extend(
				{}, // destination
				IcalEventSource.AJAX_DEFAULTS,
				ajaxSettings,
				{
					url: url,
					success: function(responseData) {
						rawEventDefs = _this.icalItemsToRawEventDefs(responseData, start, end, timezone);

						successRes = applyAll(
							onSuccess,
							this, // forward `this`
							// call the success handler(s) and allow it to return a new events array
							[ rawEventDefs ].concat(Array.prototype.slice.call(arguments, 1))
						);

						if ($.isArray(successRes)) {
							rawEventDefs = successRes;
						}

						onResolve(_this.parseEventDefs(rawEventDefs));
					}
				}
			));
		});
	},

	icalItemsToRawEventDefs: function(icalString, start, end, timezone) {
		var _this = this;

		var icalExpander = new IcalExpander({ics: icalString});
		
		// adjust start and end date to ensure that we will really include all
		// relevant events even if we're in a timezone far away
		var startJsDate = start.toDate();
		startJsDate.setDate(startJsDate.getDate()-1);
		var endJsDate = end.toDate();
		endJsDate.setDate(endJsDate.getDate()+1);
		
		var theExpanse = icalExpander.between(startJsDate, endJsDate);
		
		const mappedEvents = theExpanse.events.map(function (e) {return _this.expandedEventAndTimeToRawEvent(e, e.startDate, e.endDate, timezone);});
		const mappedOccurrences = theExpanse.occurrences.map(function (o) {return _this.expandedEventAndTimeToRawEvent(o.item, o.startDate, o.endDate, timezone);});
		return [].concat(mappedEvents, mappedOccurrences);
	},
	
	expandedEventAndTimeToRawEvent: function(expandedEvent, startIcalMoment, endIcalMoment, timezone) {
		return {
			id: expandedEvent.uid,
			title: expandedEvent.summary,
			//url: url, // TODO: handle URL
			location: expandedEvent.location,
			description: expandedEvent.description,
			start: this.icalMomentToString(startIcalMoment, timezone), // TODO: handle all-day events properly
			end: this.icalMomentToString(endIcalMoment, timezone) // TODO: handle all-day events properly
		};
	},
	
	icalMomentToString: function(icalMoment, timezone) {
		switch(timezone) {
			case 'local':
				return icalMoment.convertToZone(ICAL.Timezone.localTimezone).toString();
			case 'UTC':
				return icalMoment.convertToZone(ICAL.Timezone.utcTimezone).toString();
			default:
				var tz = ICAL.TimezoneService.get(timezone);
				if(tz)
				{
					return icalMoment.convertToZone(tz).toString()
				}
				//else: fall through
			case false:
				return icalMoment.toString();
		}
	},

	getPrimitive: function() {
		return this.icalSource;
	},
	
	applyManualRawProps: function(rawProps) {
		var superSuccess = EventSource.prototype.applyManualRawProps.apply(this, arguments);
		var icalSource = rawProps.icalSource;

		if (icalSource != null) {
			this.icalSource = icalSource;

			return superSuccess;
		}

		return false;
	},

	applyOtherRawProps: function(rawProps) {
		this.ajaxSettings = rawProps;
	}

});

IcalEventSource.AJAX_DEFAULTS = {
	// cache: false, // not disabling the cache; we trust in the browser to make the right decision when to refetch the ics file from the server
	dataType: 'text'
};

IcalEventSource.allowRawProps({
	// manually process...
	icalSource: false
});

IcalEventSource.parse = function(rawInput, calendar) {
	var rawProps;

	if (typeof rawInput === 'object') { // long form. might fail in applyManualRawProps
		if(!("icalSource" in rawInput)) {
			return false;
		}
		rawProps = rawInput;
	}
	else if (typeof rawInput === 'string') { // short form
		rawProps = { icalSource: rawInput };
	}

	if (rawProps) {
		return EventSource.parse.call(this, rawProps, calendar);
	}

	return false;
};

/*
// Injects a string like "arg=value" into the querystring of a URL
function injectQsComponent(url, component) {
	// inject it after the querystring but before the fragment
	return url.replace(/(\?.*?)?(#|$)/, function(whole, qs, hash) {
		return (qs ? qs + '&' : '?') + component + hash;
	});
}*/

// expose

EventSourceParser.registerClass(IcalEventSource);

FC.IcalEventSource = IcalEventSource;
