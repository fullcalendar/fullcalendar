
var UnzonedRange = FC.UnzonedRange = Class.extend({

	startMs: null,
	endMs: null,
	isStart: true,
	isEnd: true,

	constructor: function(startInput, endInput) {

		if (moment.isMoment(startInput)) {
			startInput = startInput.clone().stripZone();
		}

		if (moment.isMoment(endInput)) {
			endInput = endInput.clone().stripZone();
		}

		this.startMs = startInput.valueOf();
		this.endMs = endInput.valueOf();
	},

	constrainTo: function(constraintRange) {
		var startMs = Math.max(this.startMs, constraintRange.startMs);
		var endMs = Math.min(this.endMs, constraintRange.endMs);
		var newRange = null;

		if (startMs < endMs) {
			newRange = new UnzonedRange(startMs, endMs);
			newRange.isStart = this.isStart && startMs === this.startMs;
			newRange.isEnd = this.isEnd && endMs === this.endMs;
		}

		return newRange;
	},

	// hopefully we'll remove these...

	getStart: function() {
		return FC.moment.utc(this.startMs).stripZone();
	},

	getEnd: function() {
		return FC.moment.utc(this.endMs).stripZone();
	},

	getRange: function() {
		return { start: this.getStart(), end: this.getEnd() };
	}

});


/*
SIDEEFFECT: will mutate eventRanges.
Will return a new array result.
*/
function invertUnzonedRanges(ranges, constraintRange) {
	var invertedRanges = [];
	var startMs = constraintRange.startMs; // the end of the previous range. the start of the new range
	var i;
	var dateRange;

	// ranges need to be in order. required for our date-walking algorithm
	ranges.sort(compareUnzonedRanges);

	for (i = 0; i < ranges.length; i++) {
		dateRange = ranges[i];

		// add the span of time before the event (if there is any)
		if (dateRange.startMs > startMs) { // compare millisecond time (skip any ambig logic)
			invertedRanges.push(
				new UnzonedRange(startMs, dateRange.startMs)
			);
		}

		if (dateRange.endMs > startMs) {
			startMs = dateRange.endMs;
		}
	}

	// add the span of time after the last event (if there is any)
	if (startMs < constraintRange.endMs) { // compare millisecond time (skip any ambig logic)
		invertedRanges.push(
			new UnzonedRange(startMs, constraintRange.endMs)
		);
	}

	return invertedRanges;
}


function compareUnzonedRanges(range1, range2) {
	return range1.startMs - range2.startMs; // earlier ranges go first
}
