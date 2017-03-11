/*
SEE ALSO:
- defaultDate (for core of date setting and contraining)
*/
describe('gotoDate', function() {
	pushOptions({
		defaultView: 'month',
		defaultDate: '2017-06-01'
	});

	var hasRerendered;
	beforeEach(function() {
		hasRerendered = false;
	});
	pushOptions({
		viewRender: function() { // TODO: opportunity to spy
			hasRerendered = true;
		}
	});

	describeValues({
		'when forceFreshRange is undefined': undefined,
		'when forceFreshRange is false': false
	}, function(forceFreshRange) {

		describe('when given date is within current range', function() {
			var dateVal = '2017-06-05';

			xit('should not navigate or rerender', function() {
				initCalendar();
				currentCalendar.gotoDate(dateVal, forceFreshRange);
				expect(hasRerendered).toBe(false);
			});
		});

		describe('when given date is outside current range, but still in view', function() {
			var dateVal = '2017-07-01';

			xit('should not navigate or rerender', function() {
				initCalendar();
				currentCalendar.gotoDate(dateVal, forceFreshRange);
				expect(hasRerendered).toBe(false);
			});
		});
	});

	describe('when forceFreshRange is true', function() {

		describe('when given date is within current range', function() {
			var dateVal = '2017-06-05';

			xit('should not navigate or rerender', function() {
				initCalendar();
				currentCalendar.gotoDate(dateVal, true);
				expect(hasRerendered).toBe(false);
			});
		});

		describe('when given date is outside current range, but still in view', function() {
			var dateVal = '2017-07-01';

			xit('should navigate to a new range', function() {
				initCalendar();
				currentCalendar.gotoDate(dateVal, true);
				expect(hasRerendered).toBe(true);
				expectViewRange('2017-06-25', '2017-08-06');
			});
		});
	})

	describe('when visibleRange function\'s range is same as current', function() {

		pushOptions({
			defaultView: 'agenda',
			defaultDate: '2017-07-01',
			visibleRange: function() {
				return {
					start: '2017-07-01',
					end: '2017-07-05'
				};
			}
		})

		xit('does not rerender', function() {
			initCalendar();
			currentCalendar.gotoDate('2017-12-01'); // visibleRange won't consider this
			expect(hasRerendered).toBe(false);
		});
	});
});
