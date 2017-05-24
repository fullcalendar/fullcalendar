
var EventDateProfile = Class.extend(EventStartEndMixin, {


	constructor: function(start, end) {
		this.start = start;
		this.end = end;
	},


	/*
	Needs a Calendar object
	*/
	buildRange: function(calendar) {
		var startMs = this.start.clone().stripZone().valueOf();
		var endMs = this.getEnd(calendar).stripZone().valueOf();

		return new UnzonedRange(startMs, endMs);
	},


	/*
	Needs a Calendar object
	*/
	getEnd: function(calendar) {
		return this.end ?
			this.end.clone() :
			// derive the end from the start and allDay. compute allDay if necessary
			calendar.getDefaultEventEnd(
				this.isAllDay(),
				this.start
			);
	}

});


/*
Needs a Calendar object
*/
EventDateProfile.parse = function(rawProps, calendar) {
	return new EventDateProfile(
		calendar.moment(rawProps.start),
		rawProps.end ? calendar.moment(rawProps.end) : null
	);
};
