
var EventDefinitionCollection = Class.extend({

	calendar: null,
	eventDefs: null,
	eventDefsById: null,

	constructor: function(calendar) {
		this.calendar = calendar;
		this.eventDefs = [];
		this.eventDefsById = {};
	},

	addRaw: function(eventInput, source) {
		var eventDefsById = this.eventDefsById;
		var eventDef;

		if (isEventInputRecurring(eventInput)) {
			eventDef = new RecurringEventDefinition(eventInput, source, this.calendar);
		}
		else {
			eventDef = new SingleEventDefinition(eventInput, source, this.calendar);
		}

		this.eventDefs.push(eventDef);

		(eventDefsById[eventDef.id] || (eventDefsById[eventDef.id] = []))
			.push(eventDef);
	},

	clear: function() {
		this.eventDefs = [];
		this.eventDefsById = {};
	},

	clearBySource: function() {
		// TODO
	},

	clearByFilter: function() {
		// TODO
	},

	buildPeriods: function(start, end) {
		var eventPeriods = [];
		var eventDefsById = this.eventDefsById;
		var eventId;
		var relatedEventDefs;
		var relatedEventInstances;
		var i, eventDef;

		for (eventId in eventDefsById) {
			relatedEventDefs = eventDefsById[eventId];
			relatedEventInstances = [];

			for (i = 0; i < relatedEventDefs.length; i++) {
				eventDef = relatedEventDefs[i];

				relatedEventInstances.push.apply( // append
					relatedEventInstances,
					eventDef.buildInstances(start, end)
				);
			}

			eventPeriods.push(
				new EventPeriod(
					relatedEventInstances,
					new UnzonedRange(start, end),
					this.calendar // for computing event ends
				)
			);
		}

		return eventPeriods;
	}

});


function isEventInputRecurring(eventInput) {
	var start = eventInput.start || eventInput.date;
	var end = eventInput.end;

	return eventInput.dow ||
		(isTimeString(start) || moment.isDuration(start)) ||
		(end && (isTimeString(start) || moment.isDuration(start)));
}
