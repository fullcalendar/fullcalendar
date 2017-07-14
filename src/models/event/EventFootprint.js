
var EventFootprint = FC.EventFootprint = Class.extend({

	componentFootprint: null,
	eventDef: null,
	eventInstance: null, // optional


	constructor: function(componentFootprint, eventDef, eventInstance) {
		this.componentFootprint = componentFootprint;
		this.eventDef = eventDef;

		if (eventInstance) {
			this.eventInstance = eventInstance;
		}
	},


	getEventLegacy: function() {
		return (this.eventInstance || this.eventDef).toLegacy();
	}

});
