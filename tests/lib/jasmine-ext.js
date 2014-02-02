
beforeEach(function() {
	this.addMatchers({
		toEqualMoment: function(expected) {
			return $.fullCalendar.moment(this.actual).format() ===
				$.fullCalendar.moment(expected).format();
		},
		toEqualNow: function() {
			return Math.abs(
				$.fullCalendar.moment(this.actual) -
				new Date()
			) < 1000; // within a second of current datetime
		}
	});
});