
(function() {

	var momentTypeSuffixes = {
		'ambiguously-timed': '',
		'ambiguously-zoned': 'T00:30:00',
		timed: 'T00:30:00-0500'
	};

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
	});

})();
