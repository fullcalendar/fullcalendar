
describe('header navigation', function() {

	beforeEach(function() {
		affix('#calendar');
		var options = {
			header: {
				left: 'next,prev,prevYear,nextYear today',
				center: '',
				right: 'title'
			}
		};
		$('#calendar').fullCalendar(options);
	});

	describe('and click next', function() {
		it('should change view to next month', function() {
			$('#calendar').fullCalendar('gotoDate', '2010-02-01');
			$('.fc-next-button').simulate('click');
			var newDate = $('#calendar').fullCalendar('getDate');
			expect(newDate).toEqualMoment('2010-03-01');
		});
	});

	describe('and click prev', function() {
		it('should change view to prev month', function() {
			$('#calendar').fullCalendar('gotoDate', '2010-02-01');
			$('.fc-prev-button').simulate('click');
			var newDate = $('#calendar').fullCalendar('getDate');
			expect(newDate).toEqualMoment('2010-01-01');
		});
	});

	describe('and click prevYear', function() {
		it('should change view to prev month', function() {
			$('#calendar').fullCalendar('gotoDate', '2010-02-01');
			$('.fc-prevYear-button').simulate('click');
			var newDate = $('#calendar').fullCalendar('getDate');
			expect(newDate).toEqualMoment('2009-02-01');
		});
	});

	describe('and click nextYear', function() {
		it('should change view to prev month', function() {
			$('#calendar').fullCalendar('gotoDate', '2010-02-01');
			$('.fc-nextYear-button').simulate('click');
			var newDate = $('#calendar').fullCalendar('getDate');
			expect(newDate).toEqualMoment('2011-02-01');
		});
	});

	describe('and click today', function() {
		it('should change view to prev month', function() {
			$('#calendar').fullCalendar('gotoDate', '2010-02-01');
			$('.fc-today-button').simulate('click');
			var newDate = $('#calendar').fullCalendar('getDate');
			expect(newDate).toEqualNow();
		});
	});
});