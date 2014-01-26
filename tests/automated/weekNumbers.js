
describe('weekNumbers', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('when using default weekNumbers in default view', function() {
		it('should not display weekNumbers', function() {
			$('#cal').fullCalendar();
			var weekNumbersCount = $('.fc-week-number').length;
			expect(weekNumbersCount).toEqual(0);
		});
	});

	describe('when setting weekNumbers to false in default view', function() {
		it('should not display weekNumbers', function() {
			$('#cal').fullCalendar({
				weekNumbers: false
			});
			var weekNumbersCount = $('.fc-week-number').length;
			expect(weekNumbersCount).toEqual(0);
		});
	});

	describe('when setting weekNumbers to true in default view', function() {
		it('should not display weekNumbers', function() {
			$('#cal').fullCalendar({
				weekNumbers: true
			});
			$('#cal').fullCalendar('gotoDate', 2013, 10);
			var weekNumbersCount = $('.fc-week-number').length;
			// 1 row is header
			// 6 rows are week numbers
			expect(weekNumbersCount).toEqual(7);
		});
	});
});