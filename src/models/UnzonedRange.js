
var UnzonedRange = Class.extend({

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


function compareUnzonedRanges(range1, range2) {
	return range1.startMs - range2.startMs; // earlier ranges go first
}
