
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
		var slicedDateRange;
		var slicedEventRanges = [];

		for (i = 0; i < eventInstances.length; i++) {
			eventInstance = eventInstances[i];

			slicedDateRange = eventInstance.dateProfile.unzonedRange.constrainTo(constraintRange);

			if (slicedDateRange) {
				slicedEventRanges.push(
					new EventRange(
						slicedDateRange,
						eventInstance.def,
						eventInstance
					)
				);
			}
		}

		return slicedEventRanges;
	},


	sliceInverseRenderRanges: function(constraintRange) {
		var dateRanges = eventInstancesToDateRanges(this.eventInstances);
		var ownerDef = this.getEventDef();

		dateRanges = invertDateRanges(dateRanges, constraintRange);

		return dateRanges.map(function(dateRange) {
			return new EventRange(dateRange, ownerDef);
		});
	},


	isInverse: function() {
		return this.getEventDef().hasInverseRendering();
	},


	getEventDef: function() {
		return this.explicitEventDef || this.eventInstances[0].def;
	}

});
