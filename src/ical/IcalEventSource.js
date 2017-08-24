
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
						rawEventDefs = _this.icalItemsToRawEventDefs(responseData, start, end);

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

	icalItemsToRawEventDefs: function(icalString, start, end) {
		var _this = this;

		var jcalData;
		try {
			jcalData = ICAL.parse(icalString);
		} catch (icalerr) {
			FC.warn.apply(null, icalerr);
			return false;
		}
		
		var comp = new ICAL.Component(jcalData);
		var vevents = comp.getAllSubcomponents("vevent");
		
		var rawEvents = [];
		
		vevents.forEach(function (vevent) {
			var veventRawEvents = _this.generateRawEventsFromVevent(vevent, start, end);
			veventRawEvents.forEach(function (rawEvent) { this.push(rawEvent); }, rawEvents);			
		});
		
		return rawEvents;
	},


	generateRawEventsFromVevent: function(vevent, start, end) {
		/*
		var url = item.htmlLink || null;

		// make the URLs for each event show times in the correct timezone
		if (url && gcalTimezone) {
			url = injectQsComponent(url, 'ctz=' + gcalTimezone);
		}
		*/
		
		var veventComp = new ICAL.Event(vevent);
		
		if(!veventComp.isRecurring()) {
			return [this.veventAndTimeToRawEvent(veventComp, veventComp.startDate, veventComp.endDate)];
		}
		
		var requestedStartIcalMoment = ICAL.Time.fromJSDate(start.toDate());
		var earliestEventIcalMoment = veventComp.startDate;
		
		var iterationStartIcalMoment;
		if(requestedStartIcalMoment.compare(earliestEventIcalMoment) < 0) {
			iterationStartIcalMoment = earliestEventIcalMoment;
		} else {
			iterationStartIcalMoment = requestedStartIcalMoment;
		}
		
		var iterator = veventComp.iterator(iterationStartIcalMoment);
		
		var result = [];
		
		var startIcalMoment;
		while(startIcalMoment = iterator.next()) {
			if(startIcalMoment.toJSDate() > end.toDate())
				break;

			var endIcalMoment = startIcalMoment.clone();
			endIcalMoment.addDuration(veventComp.duration);
			result.push(this.veventAndTimeToRawEvent(veventComp, startIcalMoment, endIcalMoment));
		}
		
		return result
	},
	
	veventAndTimeToRawEvent: function(veventComp, startIcalMoment, endIcalMoment) {
		return {
			id: veventComp.uid,
			title: veventComp.summary,
			//url: url, // TODO: handle URL
			location: veventComp.location,
			description: veventComp.description,
			start: this.icalMomentToString(startIcalMoment), // TODO: handle all-day events properly
			end: this.icalMomentToString(endIcalMoment) // TODO: handle all-day events properly
		};
	},
	
	icalMomentToString: function(icalMoment) {
		return icalMoment.toString();
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
