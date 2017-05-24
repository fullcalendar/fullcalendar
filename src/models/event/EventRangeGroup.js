
var EventRangeGroup = Class.extend({

	eventRanges: null,


	constructor: function(eventRanges) {
		this.eventRanges = eventRanges;
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
						eventRange.eventInstance,
						slicedDateRange
					)
				);
			}
		}

		return slicedEventRanges;
	},


	sliceInverseRenderRanges: function(constraintRange) {
		var dateRanges = collectDateRangesFromEventRanges(this.eventRanges);
		var ownerInstance = this.eventRanges[0].eventInstance;

		dateRanges = invertDateRanges(dateRanges, constraintRange);

		return dateRanges.map(function(dateRange) {
			return new EventRange(ownerInstance, dateRange);
		});
	},


	isInverse: function() {
		return this.getEventDef().hasInverseRendering();
	},


	getEventDef: function() {
		return this.getEventInstance().def;
	},


	getEventInstance: function() {
		return this.eventRanges[0].eventInstance;
	}

});
