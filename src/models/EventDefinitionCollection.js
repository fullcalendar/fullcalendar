
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
		var eventDef;

		if (isEventInputRecurring(eventInput)) {
			eventDef = RecurringEventDefinition.parse(eventInput);
		}
		else {
			eventDef = SingleEventDefinition.parse(eventInput, this.calendar);
		}

		if (source) {
			eventDef.source = source;
		}

		this.add(eventDef);
	},

	add: function(eventDef) {
		var eventDefsById = this.eventDefsById;

		this.eventDefs.push(eventDef);

		(eventDefsById[eventDef.id] || (eventDefsById[eventDef.id] = []))
			.push(eventDef);
	},

	getById: function(id) { // TODO: getArrayById
		return this.eventDefsById[id];
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

	buildRenderRanges: function(start, end, calendar) {
		var renderRanges = [];
		var instanceGroups = this.buildInstanceGroups(start, end);
		var constraintRange = new UnzonedRange(start, end);
		var i;

		for (i = 0; i < instanceGroups.length; i++) {
			renderRanges.push.apply(renderRanges, // append
				instanceGroups[i].buildRenderRanges(constraintRange, calendar)
			);
		}

		return renderRanges;
	},

	buildInstanceGroups: function(start, end) {
		var eventInstanceGroups = [];
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

			eventInstanceGroups.push(
				new EventInstanceGroup(relatedEventInstances)
			);
		}

		return eventInstanceGroups;
	}

});


function isEventInputRecurring(eventInput) {
	var start = eventInput.start || eventInput.date;
	var end = eventInput.end;

	return eventInput.dow ||
		(isTimeString(start) || moment.isDuration(start)) ||
		(end && (isTimeString(start) || moment.isDuration(start)));
}
