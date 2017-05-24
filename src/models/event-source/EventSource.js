
var EventSource = Class.extend({

	calendar: null,

	id: null,
	color: null,
	backgroundColor: null,
	borderColor: null,
	textColor: null,
	className: null, // array
	editable: null,
	startEditable: null,
	durationEditable: null,
	resourceEditable: null,
	rendering: null,
	overlap: null,
	constraint: null,
	allDayDefault: null,
	eventDataTransform: null, // optional function


	constructor: function(calendar) {
		this.calendar = calendar;
		this.className = [];
	},


	fetch: function(start, end, timezone) {
		// subclasses must implement. must return a promise.
	},


	removeEventsById: function(eventDefId) {
		// optional for subclasses to implement
	},


	/*
	For compairing/matching
	*/
	getPrimitive: function(otherSource) {
		// subclasses must implement
	},


	parseEventDefs: function(rawEventDefs) {
		var i;
		var eventDef;
		var eventDefs = [];

		for (i = 0; i < rawEventDefs.length; i++) {
			eventDef = EventDefParser.parse(
				rawEventDefs[i],
				this // source
			);

			if (eventDef) {
				eventDefs.push(eventDef);
			}
		}

		return eventDefs;
	}

});


EventSource.normalizeId = function(id) {
	if (id) {
		return String(id);
	}

	return null;
};


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


EventSource.parse = function(rawInput, calendar) {
	// subclasses must implement
};


EventSource.parseAndPluck = function(rawProps, calendar) {
	var source = new this(calendar);
	var members = pluckProps(rawProps, [
		'id',
		'color',
		'backgroundColor',
		'borderColor',
		'textColor',
		'className',
		'editable',
		'startEditable',
		'durationEditable',
		'resourceEditable',
		'rendering',
		'overlap',
		'constraint',
		'allDayDefault',
		'eventDataTransform'
	]);

	// post-process some soon-to-be member variables
	if (typeof members.className === 'string') {
		members.className = members.className.split(/\s+/);
	}
	else if (!members.className) {
		delete members.className; // don't overwrite the empty array
	}
	members.id = EventSource.normalizeId(members.id);

	// apply the member variables
	$.extend(source, members);

	return source;
};


FC.EventSource = EventSource;
