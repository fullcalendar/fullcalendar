
/*
A group of related EventInstances. Assumed to all have the same ID.
*/
var EventInstanceGroup = Class.extend({

	eventInstances: null, // EventInstance[]


	constructor: function(eventInstances) {
		this.eventInstances = eventInstances;
	},


	buildRanges: function() {
		return this.eventInstances.map(function(instance) {
			return instance.buildEventRange();
		});
	},


	buildRangeGroup: function() {
		return new EventRangeGroup(this.buildRanges());
	}

});
