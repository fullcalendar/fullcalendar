
describe('events as a function', function() {
	pushOptions({
		defaultView: 'month'
	});

	it('requests the correct dates when days at the start/end of the month are hidden', function(done) {
		initCalendar({
			currentView: 'month',
			defaultDate: '2013-06-01', // June 2013 has first day as Saturday, and last as Sunday!
			weekends: false,
			fixedWeekCount: false,
			events: function(start, end, timezone, callback) {
				expect(start).toEqualMoment('2013-06-03');
				expect(end).toEqualMoment('2013-06-29');
				done();
			}
		});
	});

	it('does not request dates excluded by disableNonCurrentDates', function(done) {
		initCalendar({
			currentView: 'month',
			defaultDate: '2013-06-01',
			disableNonCurrentDates: true,
			events: function(start, end, timezone, callback) {
				expect(start).toEqualMoment('2013-06-01');
				expect(end).toEqualMoment('2013-07-01');
				done();
			}
		});
	});
});
