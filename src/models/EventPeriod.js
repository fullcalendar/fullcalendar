
var EventPeriod = Class.extend({

	eventInstances: null,
	constraintRange: null,
	calendar: null,

	constructor: function(eventInstances, constraintRange, calendar) {
		this.eventInstances = eventInstances;
		this.constraintRange = constraintRange;
		this.calendar = calendar;
	},

	buildRanges: function() {
		var eventRanges = [];
		var eventInstances = this.eventInstances;
		var i, eventInstance;
		var eventRange;

		for (i = 0; i < eventInstances.length; i++) {
			eventInstance = eventInstances[i];

			eventRange = eventInstance.eventDateProfile.buildRange(this.calendar); // merely UnzonedRange here
			eventRange = new EventRange(eventInstance, range.startMs, range.endMs);
			eventRange = eventRange.constrainTo(this.constraintRange);

			if (eventRange) {
				eventRanges.push(eventRange);
			}
		}

		return eventRanges;
	},

	buildRenderRanges: function() {
		var eventInstances = this.eventInstances;
		var ranges = this.buildRanges();

		if (eventInstances.length && eventInstances[0].rendering === 'inverse-background') {
			ranges = invertEventRanges(ranges, this.constraintRange, eventInstances[0]);
		}

		return ranges;
	}

});


function invertEventRanges(eventRanges, constraintRange, ownerEventInstance) {
	var inverseRanges = [];
	var startMs = constraintRange.startMs; // the end of the previous range. the start of the new range
	var i, eventRange;

	// ranges need to be in order. required for our date-walking algorithm
	eventRanges.sort(compareUnzonedRanges);

	for (i = 0; i < eventRanges.length; i++) {
		eventRange = eventRanges[i];

		// add the span of time before the event (if there is any)
		if (eventRange.startMs > startMs) { // compare millisecond time (skip any ambig logic)
			inverseRanges.push(
				new EventRange(
					ownerEventInstance,
					startMs,
					eventRange.startMs
				)
			);
		}

		if (eventRange.endMs > startMs) {
			startMs = eventRange.endMs;
		}
	}

	// add the span of time after the last event (if there is any)
	if (startMs < constraintRange.endMs) { // compare millisecond time (skip any ambig logic)
		inverseRanges.push(
			new EventRange(
				ownerEventInstance,
				startMs,
				constraintRange.endMs
			)
		);
	}

	return inverseRanges;
}
