describe('firstDay', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('when first day is set to mon and isRTL is true', function() {
		beforeEach(function() {
			var options = {
				firstDay: 2,
				isRTL: true
			};
			$('#cal').fullCalendar(options);
		});
		it('should put days mon, sun, sat ...', function() {
			var daysOfWeek = $('.fc-day-header');
			expect(daysOfWeek[0]).toHaveClass('fc-mon');
			expect(daysOfWeek[1]).toHaveClass('fc-sun');
			expect(daysOfWeek[2]).toHaveClass('fc-sat');
			expect(daysOfWeek[3]).toHaveClass('fc-fri');
			expect(daysOfWeek[4]).toHaveClass('fc-thu');
			expect(daysOfWeek[5]).toHaveClass('fc-wed');
			expect(daysOfWeek[6]).toHaveClass('fc-tue');
		});
	});
});