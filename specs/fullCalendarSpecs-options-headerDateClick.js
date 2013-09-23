'use strict';
describe('when header options set with next|prev|prevYear|nextYear|today', function() {

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
			$('#calendar').fullCalendar('gotoDate', 2010, 1, 1);
			$('.fc-button-next').simulate('click');
			var newDate = $('#calendar').fullCalendar('getDate');
			expect(newDate).toEqual(new Date(2010, 2, 1));
		});
	});

	describe('and click prev', function() {
		it('should change view to prev month', function() {
			$('#calendar').fullCalendar('gotoDate', 2010, 1, 1);
			$('.fc-button-prev').simulate('click');
			var newDate = $('#calendar').fullCalendar('getDate');
			expect(newDate).toEqual(new Date(2009, 12, 1));
		});
	});

	describe('and click prevYear', function() {
		it('should change view to prev month', function() {
			$('#calendar').fullCalendar('gotoDate', 2010, 1, 1);
			$('.fc-button-prevYear').simulate('click');
			var newDate = $('#calendar').fullCalendar('getDate');
			expect(newDate).toEqual(new Date(2009, 1, 1));
		});
	});

	describe('and click nextYear', function() {
		it('should change view to prev month', function() {
			$('#calendar').fullCalendar('gotoDate', 2010, 1, 1);
			$('.fc-button-nextYear').simulate('click');
			var newDate = $('#calendar').fullCalendar('getDate');
			expect(newDate).toEqual(new Date(2011, 1, 1));
		});
	});

	describe('and click today', function() {
		it('should change view to prev month', function() {
			$('#calendar').fullCalendar('gotoDate', 2010, 1, 1);
			$('.fc-button-today').simulate('click');
			var newDate = $('#calendar').fullCalendar('getDate');
			expect(newDate.toDateString()).toEqual(new Date().toDateString());
		});
	});
});