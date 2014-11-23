
describe('basic view rendering', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('when isRTL is false', function() {

		beforeEach(function() {
			$('#cal').fullCalendar({
				defaultView: 'month',
				isRTL: false
			});
		});

		it('should have have days ordered sun to sat', function() {
			var fc = $('#cal').find('.fc-day-header');
			expect(fc[0]).toHaveClass('fc-sun');
			expect(fc[1]).toHaveClass('fc-mon');
			expect(fc[2]).toHaveClass('fc-tue');
			expect(fc[3]).toHaveClass('fc-wed');
			expect(fc[4]).toHaveClass('fc-thu');
			expect(fc[5]).toHaveClass('fc-fri');
			expect(fc[6]).toHaveClass('fc-sat');
		});
	});

	describe('when isRTL is true', function() {

		beforeEach(function() {
			$('#cal').fullCalendar({
				defaultView: 'month',
				isRTL: true
			});
		});

		it('should have have days ordered sat to sun', function() {
			var fc = $('#cal').find('.fc-day-header');
			expect(fc[0]).toHaveClass('fc-sat');
			expect(fc[1]).toHaveClass('fc-fri');
			expect(fc[2]).toHaveClass('fc-thu');
			expect(fc[3]).toHaveClass('fc-wed');
			expect(fc[4]).toHaveClass('fc-tue');
			expect(fc[5]).toHaveClass('fc-mon');
			expect(fc[6]).toHaveClass('fc-sun');
		});
	});

});