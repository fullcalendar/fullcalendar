
/*
It's expected that there will be at least one EventInstance,
OR that an explicitEventDef is assigned.
*/
var EventInstanceGroup = Class.extend({

	eventInstances: null,
	explicitEventDef: null, // optional


	constructor: function(eventInstances) {
		this.eventInstances = eventInstances || [];
	},


	getAllEventRanges: function() {
		return eventInstancesToEventRanges(this.eventInstances);
	},


	sliceRenderRanges: function(constraintRange) {
		if (this.isInverse()) {
			return this.sliceInverseRenderRanges(constraintRange);
		}
		else {
			return this.sliceNormalRenderRanges(constraintRange);
		}
	},


	sliceNormalRenderRanges: function(constraintRange) {
		var eventInstances = this.eventInstances;
		var i, eventInstance;
		var slicedRange;
		var slicedEventRanges = [];

		for (i = 0; i < eventInstances.length; i++) {
			eventInstance = eventInstances[i];

			slicedRange = eventInstance.dateProfile.unzonedRange.intersect(constraintRange);

			if (slicedRange) {
				slicedEventRanges.push(
					new EventRange(
						slicedRange,
						eventInstance.def,
						eventInstance
					)
				);
			}
		}

		return slicedEventRanges;
	},


	sliceInverseRenderRanges: function(constraintRange) {
		var unzonedRanges = eventInstancesToUnzonedRanges(this.eventInstances);
		var ownerDef = this.getEventDef();

		unzonedRanges = invertUnzonedRanges(unzonedRanges, constraintRange);

		return unzonedRanges.map(function(unzonedRange) {
			return new EventRange(unzonedRange, ownerDef); // don't give an EventDef
		});
	},


	isInverse: function() {
		return this.getEventDef().hasInverseRendering();
	},


	getEventDef: function() {
		return this.explicitEventDef || this.eventInstances[0].def;
	}

});
