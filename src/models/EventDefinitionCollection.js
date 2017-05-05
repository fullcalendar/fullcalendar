
var EventDefinitionCollection = Class.extend({

	calendar: null,
	models: null,

	constructor: function(calendar) {
		this.calendar = calendar;
		this.models = [];
	},

	addRaw: function(eventInput, source) {
		var eventDef;

		if (isEventInputRecurring(eventInput)) {
			eventDef = new RecurringEventDefinition(eventInput, source, this.calendar);
		}
		else {
			eventDef = new SingleEventDefinition(eventInput, source, this.calendar);
		}

		this.models.push(eventDef);
	},

	clear: function() {
		this.models = [];
	},

	clearBySource: function() {

	},

	clearByFilter: function() {

	}

});
