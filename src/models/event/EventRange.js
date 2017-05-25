
var EventRange = Class.extend({

	dateRange: null,
	eventDef: null,
	eventInstance: null, // optional


	constructor: function(dateRange, eventDef, eventInstance) {
		this.dateRange = dateRange;
		this.eventDef = eventDef;

		if (eventInstance) {
			this.eventInstance = eventInstance;
		}
	}

});
