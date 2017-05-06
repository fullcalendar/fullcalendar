
var EventDateProfile = Class.extend({

	start: null,
	end: null,

	constructor: function(start, end) {
		this.start = start;
		this.end = end;
	},

	isAllDay: function() {
		return !(this.start.hasTime() || (this.end && this.end.hasTime()));
	},

	// calendar object needed to compute missing end dates
	buildRange: function(calendar) {
		var startMs = this.start.clone().stripZone().valueOf();
		var endMs = (
				this.end ?
					this.end.clone() :
					// derive the end from the start and allDay. compute allDay if necessary
					calendar.getDefaultEventEnd(
						this.isAllDay()
						this.start
					)
			).stripZone().valueOf();

		return new UnzonedRange(startMs, endMs);
	}

});
