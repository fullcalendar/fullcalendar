
var ArrayEventSource = EventSource.extend({

	rawEventDefs: null, // unparsed
	eventDefs: null,
	currentTimezone: null,


	constructor: function(calendar) {
		EventSource.apply(this, arguments); // super-constructor
		this.eventDefs = []; // for if setRawEventDefs is never called
	},


	setRawEventDefs: function(rawEventDefs) {
		this.rawEventDefs = rawEventDefs;
		this.eventDefs = this.parseEventDefs(rawEventDefs);
	},


	fetch: function(start, end, timezone) {
		var eventDefs = this.eventDefs;
		var i;

		if (
			this.currentTimezone !== null &&
			this.currentTimezone !== timezone
		) {
			for (i = 0; i < eventDefs.length; i++) {
				if (eventDefs[i] instanceof SingleEventDef) {
					eventDefs[i].rezone();
				}
			}
		}

		this.currentTimezone = timezone;

		return Promise.resolve(eventDefs);
	},


	addEventDef: function(eventDef) {
		this.eventDefs.push(eventDef);
	},


	/*
	eventDefId already normalized to a string
	*/
	removeEventDefsById: function(eventDefId) {
		return removeMatching(this.eventDefs, function(eventDef) {
			return eventDef.id === eventDefId;
		});
	},


	getPrimitive: function() {
		return this.rawEventDefs;
	}

});


ArrayEventSource.parse = function(rawInput, calendar) {
	var rawEventDefs;
	var rawOtherProps;
	var source;

	if ($.isArray(rawInput)) {
		rawEventDefs = rawInput;
		rawOtherProps = {};
	}
	else if ($.isArray(rawInput.events)) {
		rawOtherProps = $.extend({}, rawInput); // copy
		rawEventDefs = pluckProp(rawOtherProps, 'events');
	}

	if (rawEventDefs) {
		source = EventSource.parseAndPluck.call(this, rawOtherProps, calendar);
		source.setRawEventDefs(rawEventDefs);

		return source;
	}
};


EventSourceParser.registerClass(ArrayEventSource);

FC.ArrayEventSource = ArrayEventSource;
