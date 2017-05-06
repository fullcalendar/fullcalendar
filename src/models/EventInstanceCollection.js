
var EventInstanceCollection = Class.extend({

	eventInstances: null,

	constructor: function(eventInstances) {
		this.eventInstances = eventInstances;
	},

	buildRanges: function(constraintRange, calendar) {
		var eventRanges = [];
		var eventInstances = this.eventInstances;
		var i, eventInstance;
		var eventRange;

		for (i = 0; i < eventInstances.length; i++) {
			eventInstance = eventInstances[i];

			eventRange = eventInstance.eventDateProfile.buildRange(calendar);
			eventRange = new EventRange(eventInstance, eventRange.startMs, eventRange.endMs);
			eventRange = eventRange.constrainTo(constraintRange);

			if (eventRange) {
				eventRanges.push(eventRange);
			}
		}

		return eventRanges;
	},

	buildRenderRanges: function(constraintRange, calendar) {
		var eventInstances = this.eventInstances;
		var ranges = this.buildRanges(constraintRange, calendar);

		if (eventInstances.length && eventInstances[0].rendering === 'inverse-background') {
			ranges = invertEventRanges(ranges, constraintRange, eventInstances[0]);
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
