
var EventInstanceGroup = Class.extend({

	eventInstances: null,

	constructor: function(eventInstances) {
		this.eventInstances = eventInstances;
	},

	isInverse: function() {
		var eventInstances = this.eventInstances;

		// TODO: ask the source/calendar
		return eventInstances.length && eventInstances[0].eventDefinition.rendering === 'inverse-background';
	},

	buildRenderRanges: function(constraintRange, calendar) { // TODO: buildRenderableEventRanges ?
		if (this.isInverse()) {
			return this.buildInverseEventRanges(constraintRange, calendar);
		}
		else {
			return this.buildEventRanges(constraintRange, calendar);
		}
	},

	buildEventRanges: function(constraintRange, calendar) { // TODO: use this.source.calendar
		var eventInstances = this.eventInstances;
		var i, eventInstance;
		var dateRange;
		var eventRanges = [];

		for (i = 0; i < eventInstances.length; i++) {
			eventInstance = eventInstances[i];

			dateRange = eventInstance.eventDateProfile.buildRange(calendar);
			dateRange = dateRange.constrainTo(constraintRange);

			if (dateRange) {
				eventRanges.push(
					new EventRange(eventInstance, dateRange)
				);
			}
		}

		return eventRanges;
	},

	buildInverseEventRanges: function(constraintRange, calendar) {
		var dateRanges = this.buildDateRanges(constraintRange, calendar);
		var ownerEventInstance = this.eventInstances[0];
		var i;
		var eventRanges = [];

		dateRanges = invertDateRanges(dateRanges, constraintRange);

		for (i = 0; i < dateRanges.length; i++) {
			eventRanges.push(
				new EventRange(ownerEventInstance, dateRanges[i])
			);
		}

		return eventRanges;
	},

	buildDateRanges: function(constraintRange, calendar) {
		var eventInstances = this.eventInstances;
		var i, eventInstance;
		var dateRange;
		var dateRanges = [];

		for (i = 0; i < eventInstances.length; i++) {
			eventInstance = eventInstances[i];

			dateRange = eventInstance.eventDateProfile.buildRange(calendar);
			dateRange = dateRange.constrainTo(constraintRange);

			if (dateRange) {
				dateRanges.push(dateRange);
			}
		}

		return dateRanges;
	}

});


// will sort eventRanges in place
function invertDateRanges(dateRanges, constraintRange) {
	var invertedRanges = [];
	var startMs = constraintRange.startMs; // the end of the previous range. the start of the new range
	var i;
	var dateRange;

	// ranges need to be in order. required for our date-walking algorithm
	dateRanges.sort(compareUnzonedRanges);

	for (i = 0; i < dateRanges.length; i++) {
		dateRange = dateRanges[i];

		// add the span of time before the event (if there is any)
		if (dateRange.startMs > startMs) { // compare millisecond time (skip any ambig logic)
			invertedRanges.push(new UnzonedRange(startMs, dateRange.startMs));
		}

		if (dateRange.endMs > startMs) {
			startMs = dateRange.endMs;
		}
	}

	// add the span of time after the last event (if there is any)
	if (startMs < constraintRange.endMs) { // compare millisecond time (skip any ambig logic)
		invertedRanges.push(new UnzonedRange(startMs, constraintRange.endMs));
	}

	return invertedRanges;
}
