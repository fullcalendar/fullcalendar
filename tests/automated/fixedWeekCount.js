
describe('fixedWeekCount', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultView: 'month',
			defaultDate: '2014-07-01' // has 5 weeks
		};
	});

	describe('when true', function() {
		beforeEach(function() {
			options.fixedWeekCount = true;
		});
		it('renders a 5-week month with 6 rows', function() {
			$('#cal').fullCalendar(options);
			var weeks = $('.fc-week');
			expect(weeks.length).toBe(6);
		});
	});

	describe('when false', function() {
		beforeEach(function() {
			options.fixedWeekCount = false;
		});
		it('renders a 5-week month with 5 rows', function() {
			$('#cal').fullCalendar(options);
			var weeks = $('.fc-week');
			expect(weeks.length).toBe(5);
		});
	});

	[ true, false ].forEach(function(bool) {
		describe('regardless of value (' + bool + ')', function() {
			beforeEach(function() {
				options.fixedWeekCount = bool;
				options.defaultDate = '2014-08-01'; // has 6 weeks
			});
			it('should render a 6-week month consistently', function() {
				$('#cal').fullCalendar(options);
				var weeks = $('.fc-week');
				expect(weeks.length).toBe(6);
			});
		});
	});
});