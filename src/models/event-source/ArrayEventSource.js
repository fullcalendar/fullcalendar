
var ArrayEventSource = EventSource.extend({

	rawEventDefs: null, // unparsed
	eventDefs: null,


	constructor: function(calendar) {
		EventSource.apply(this, arguments); // super-constructor
		this.eventDefs = []; // for if setRawEventDefs is never called
	},


	setRawEventDefs: function(rawEventDefs) {
		this.rawEventDefs = rawEventDefs;
		this.eventDefs = this.parseEventDefs(rawEventDefs);
	},


	/*
	disregards given start/end arguments
	*/
	fetch: function() {
		return Promise.resolve(this.eventDefs);
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
