
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


	removeAllEventDefs: function() {
		this.eventDefs = [];
	},


	getPrimitive: function() {
		return this.rawEventDefs;
	},


	applyManualRawProps: function(rawProps) {
		var superSuccess = EventSource.prototype.applyManualRawProps.apply(this, arguments);

		this.setRawEventDefs(rawProps.events);

		return superSuccess;
	}

});


ArrayEventSource.allowRawProps({
	events: false // don't automatically transfer
});


ArrayEventSource.parse = function(rawInput, calendar) {
	var rawProps;

	// normalize raw input
	if ($.isArray(rawInput.events)) { // extended form
		rawProps = rawInput;
	}
	else if ($.isArray(rawInput)) { // short form
		rawProps = { events: rawInput };
	}

	if (rawProps) {
		return EventSource.parse.call(this, rawProps, calendar);
	}

	return false;
};


EventSourceParser.registerClass(ArrayEventSource);

FC.ArrayEventSource = ArrayEventSource;
