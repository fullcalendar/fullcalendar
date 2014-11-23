
(function() {

	var momentTypeSuffixes = {
		'ambiguously-timed': '',
		'ambiguously-zoned': 'T00:30:00',
		timed: 'T00:30:00-0500'
	};

	describe('isSame', function() {

		describe('when no units provided', function() {

			it('returns false when the dates are different', function() {
				var m1 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00');
				var m2 = $.fullCalendar.moment.parseZone('2014-08-25T07:00:00');
				expect(m1.isSame(m2)).toBe(false);
			});

			it('returns false when the dates are the same, but different zone-ambiguation', function() {
				var m1 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00');
				var m2 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00+00:00');
				expect(m1.isSame(m2)).toBe(false);
			});

			it('returns false when the dates are the same, but different hasTime', function() {
				var m1 = $.fullCalendar.moment.parseZone('2014-08-25');
				var m2 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00');
				expect(m1.isSame(m2)).toBe(false);
			});

			it('returns true when the dates are exactly the same', function() {
				var m1 = $.fullCalendar.moment.parseZone('2014-08-25');
				var m2 = $.fullCalendar.moment.parseZone('2014-08-25');
				expect(m1.isSame(m2)).toBe(true);
				m1 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00');
				m2 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00');
				expect(m1.isSame(m2)).toBe(true);
				m1 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00+05:00');
				m2 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00+05:00');
				expect(m1.isSame(m2)).toBe(true);
			});

			describe('when called on a native moment', function() {
				it('returns true when the dates are the same, but different zone-ambiguation', function() {
					var m1 = moment.parseZone('2014-08-25T06:00:00+00:00');
					var m2 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00');
					expect(m1.isSame(m2)).toBe(true);
				});
			});
		});

		describe('when units are provided', function() {

			it('returns true when dates are the same day but different zone-ambiguation', function() {
				var m1 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00');
				var m2 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00-11:00');
				expect(m1.isSame(m2, 'day')).toBe(true);
			});

			it('returns true when dates are the same day but different hasTime', function() {
				var m1 = $.fullCalendar.moment.parseZone('2014-08-25');
				var m2 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00-11:00');
				expect(m1.isSame(m2, 'day')).toBe(true);
			});

			it('returns false when dates are a different day', function() {
				var m1 = $.fullCalendar.moment.parseZone('2014-08-24T00:00:00');
				var m2 = $.fullCalendar.moment.parseZone('2014-08-25T06:00:00');
				expect(m1.isSame(m2, 'day')).toBe(false);
			});
		});
	});

	describe('isWithin', function() {
		$.each(momentTypeSuffixes, function(thisType, thisSuffix) {
			describe('when the moment is ' + thisType, function() {
				$.each(momentTypeSuffixes, function(otherType, otherSuffix) {
					describe('and other moments are ' + otherType, function() {

						it('is clearly within', function() {
							var mom = $.fullCalendar.moment.parseZone('2014-06-15' + thisSuffix);
							var other1 = $.fullCalendar.moment.parseZone('2014-06-01' + otherSuffix);
							var other2 = $.fullCalendar.moment.parseZone('2014-07-01' + otherSuffix);
							var res = mom.isWithin(other1, other2);
							expect(res).toBe(true);
						});

						it('is clearly not within', function() {
							var mom = $.fullCalendar.moment.parseZone('2014-06-15' + thisSuffix);
							var other1 = $.fullCalendar.moment.parseZone('2014-09-01' + otherSuffix);
							var other2 = $.fullCalendar.moment.parseZone('2014-10-01' + otherSuffix);
							var res = mom.isWithin(other1, other2);
							expect(res).toBe(false);
						});

						it('is within when equal to start', function() {
							var mom = $.fullCalendar.moment.parseZone('2014-06-15' + thisSuffix);
							var other1 = $.fullCalendar.moment.parseZone('2014-06-15' + otherSuffix);
							var other2 = $.fullCalendar.moment.parseZone('2014-07-01' + otherSuffix);
							var res = mom.isWithin(other1, other2);
							expect(res).toBe(true);
						});

						it('is not within when equal to end', function() {
							var mom = $.fullCalendar.moment.parseZone('2014-06-15' + thisSuffix);
							var other1 = $.fullCalendar.moment.parseZone('2014-06-01' + otherSuffix);
							var other2 = $.fullCalendar.moment.parseZone('2014-06-15' + otherSuffix);
							var res = mom.isWithin(other1, other2);
							expect(res).toBe(false);
						});

					});
				});
			});
		});
	});

	describe('isBefore', function() {
		$.each(momentTypeSuffixes, function(thisType, thisSuffix) {
			describe('when the moment is ' + thisType, function() {
				$.each(momentTypeSuffixes, function(otherType, otherSuffix) {
					describe('and other moment is ' + otherType, function() {

						it('is clearly before', function() {
							var mom = $.fullCalendar.moment.parseZone('2014-06-15' + thisSuffix);
							var other = $.fullCalendar.moment.parseZone('2015-01-01' + otherSuffix);
							var res = mom.isBefore(other);
							expect(res).toBe(true);
						});

						it('is clearly not before', function() {
							var mom = $.fullCalendar.moment.parseZone('2014-06-15' + thisSuffix);
							var other = $.fullCalendar.moment.parseZone('2013-01-01' + otherSuffix);
							var res = mom.isBefore(other);
							expect(res).toBe(false);
						});

						it('is equal', function() {
							var mom = $.fullCalendar.moment.parseZone('2014-06-15' + thisSuffix);
							var other = $.fullCalendar.moment.parseZone('2014-06-15' + otherSuffix);
							var res = mom.isBefore(other);
							expect(res).toBe(false);
						});

					});
				});
			});
		});
	});

	describe('isAfter', function() {
		$.each(momentTypeSuffixes, function(thisType, thisSuffix) {
			describe('when the moment is ' + thisType, function() {
				$.each(momentTypeSuffixes, function(otherType, otherSuffix) {
					describe('and other moment is ' + otherType, function() {

						it('is clearly after', function() {
							var mom = $.fullCalendar.moment.parseZone('2014-06-15' + thisSuffix);
							var other = $.fullCalendar.moment.parseZone('2013-01-01' + otherSuffix);
							var res = mom.isAfter(other);
							expect(res).toBe(true);
						});

						it('is clearly not after', function() {
							var mom = $.fullCalendar.moment.parseZone('2014-06-15' + thisSuffix);
							var other = $.fullCalendar.moment.parseZone('2015-01-01' + otherSuffix);
							var res = mom.isAfter(other);
							expect(res).toBe(false);
						});

						it('is equal', function() {
							var mom = $.fullCalendar.moment.parseZone('2014-06-15' + thisSuffix);
							var other = $.fullCalendar.moment.parseZone('2014-06-15' + otherSuffix);
							var res = mom.isAfter(other);
							expect(res).toBe(false);
						});

					});
				});
			});
		});

		it('returns false when on same ambiguous day', function() {
			var mom = $.fullCalendar.moment.parseZone('2014-11-11T12:00:00+00:00');
			var other = $.fullCalendar.moment.parseZone('2014-11-11');
			var res = mom.isAfter(other);
			expect(res).toBe(false);
		});
		describe('when called on a native moment', function() {
			it('returns true, even when an ambiguous day would make it false', function() {
				var mom = moment.parseZone('2014-11-11T12:00:00+00:00');
				var other = $.fullCalendar.moment.parseZone('2014-11-11');
				var res = mom.isAfter(other);
				expect(res).toBe(true);
			});
		});
	});

})();
