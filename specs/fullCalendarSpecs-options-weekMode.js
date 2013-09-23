'use strict';
describe('weekMode:', function() {

	beforeEach(function() {
		affix('#cal');
	});

	//
	// Remember gotoDate uses month base 0
	//
	describe('when weekMode is default', function() {
		beforeEach(function() {
			$('#cal').fullCalendar();
		});
		it('should show 6 weeks for a 5 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 9);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should show 6 weeks for a 4 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2009, 2);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should show 6 weeks for a 6 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 5);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should not change height whether 4,5 or weeks', function() {
			$('#cal').fullCalendar('gotoDate', 2009, 1);
			var fourWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			$('#cal').fullCalendar('gotoDate', 2013, 9);
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			$('#cal').fullCalendar('gotoDate', 2013, 5);
			var sixWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			expect(fourWeekHeight).toEqual(fiveWeekHeight);
			expect(fiveWeekHeight).toEqual(sixWeekHeight);
		});
	});

	describe('when weekMode is set to fixed', function() {
		beforeEach(function() {
			$('#cal').fullCalendar({
				weekMode: 'fixed'
			});
		});
		it('should show 6 weeks for a 5 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 9);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should show 6 weeks for a 4 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2009, 2);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should show 6 weeks for a 6 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 5);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
	});

	describe('when weekMode is set to liquid', function() {
		beforeEach(function() {
			$('#cal').fullCalendar({
				weekMode: 'liquid'
			});
		});
		it('should show 5 weeks for a 5 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 9);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(5);
		});
		it('should show 4 weeks for a 4 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2009, 1);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(4);
		});
		it('should show 6 weeks for a 6 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 5);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should increase height when moving from 6 week to 5 weeks', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 9);
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			$('#cal').fullCalendar('gotoDate', 2013, 5);
			var sixWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			expect(fiveWeekHeight).toBeGreaterThan(sixWeekHeight);
		});
		it('should reduce height when moving from 5 weeks to 6 weeks', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 5);
			var sixWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			$('#cal').fullCalendar('gotoDate', 2013, 9);
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			expect(fiveWeekHeight).toBeGreaterThan(sixWeekHeight);
		});
		it('should increase height when moving from 5 weeks to 4 weeks', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 4);
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			$('#cal').fullCalendar('gotoDate', 2009, 1);
			var fourWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			expect(fourWeekHeight).toBeGreaterThan(fiveWeekHeight);
		});
		it('should reduce height when moving from 4 weeks to 5 weeks', function() {
			$('#cal').fullCalendar('gotoDate', 2009, 1);
			var fourWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			$('#cal').fullCalendar('gotoDate', 2013, 4);
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			expect(fourWeekHeight).toBeGreaterThan(fiveWeekHeight);
		});
	});

	describe('when weekMode is set to variable', function() {
		beforeEach(function() {
			$('#cal').fullCalendar({
				weekMode: 'variable'
			});
		});
		it('should show 5 weeks for a 5 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 9);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(5);
		});
		it('should show 4 weeks for a 4 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2009, 1);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(4);
		});
		it('should show 6 weeks for a 6 week month', function() {
			$('#cal').fullCalendar('gotoDate', 2013, 5);
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should not change height whether 4,5 or weeks', function() {
			$('#cal').fullCalendar('gotoDate', 2009, 1);
			var fourWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			$('#cal').fullCalendar('gotoDate', 2013, 9);
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			$('#cal').fullCalendar('gotoDate', 2013, 5);
			var sixWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'));
			expect(fourWeekHeight).toEqual(fiveWeekHeight);
			expect(fiveWeekHeight).toEqual(sixWeekHeight);
		});
	});
});