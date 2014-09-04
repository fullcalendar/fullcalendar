
beforeEach(function() {
	jasmine.addMatchers({
		toEqualMoment: function() {
			return {
				compare: function(actual, expected) {
					return {
						pass: $.fullCalendar.moment.parseZone(actual).format() ===
							$.fullCalendar.moment.parseZone(expected).format()
					};
				}
			};
		},
		toEqualNow: function() {
			return {
				compare: function(actual) {
					return {
						pass: Math.abs(
								$.fullCalendar.moment.parseZone(actual) -
								new Date()
							) < 1000 // within a second of current datetime
					};
				}
			};
		}
	});
});