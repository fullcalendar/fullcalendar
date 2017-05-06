
var UnzonedRange = Class.extend({

	startMs: null,
	endMs: null,

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

		if (startMs < endMs) {
			return new UnzonedRange(startMs, endMs);
		}
	},

	getStart: function() {
		return FC.moment.utc(this.startMs).stripZone();
	},

	getEnd: function() {
		return FC.moment.utc(this.endMs).stripZone();
	}

});


function compareUnzonedRanges(range1, range2) {
	return range1.startMs - range2.startMs; // earlier ranges go first
}
