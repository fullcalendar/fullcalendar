
/*
It's expected that there will be at least one EventRange,
OR that an explicitEventDef is assigned.
*/
var EventRangeGroup = Class.extend({

	eventRanges: null,
	explicitEventDef: null, // optional


	constructor: function(eventRanges) {
		this.eventRanges = eventRanges || [];
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
		var wholeEventRanges = this.eventRanges;
		var i, eventRange;
		var slicedDateRange;
		var slicedEventRanges = [];

		for (i = 0; i < wholeEventRanges.length; i++) {
			eventRange = wholeEventRanges[i];

			slicedDateRange = eventRange.dateRange.constrainTo(constraintRange);

			if (slicedDateRange) {
				slicedEventRanges.push(
					new EventRange(
						slicedDateRange,
						eventRange.eventDef,
						eventRange.eventInstance
					)
				);
			}
		}

		return slicedEventRanges;
	},


	sliceInverseRenderRanges: function(constraintRange) {
		var dateRanges = collectDateRangesFromEventRanges(this.eventRanges);
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
		return this.explicitEventDef || this.eventRanges[0].eventDef;
	}

});
