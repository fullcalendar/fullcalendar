
describe('weekMode', function() {

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
			$('#cal').fullCalendar('gotoDate', '2013-10-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should show 6 weeks for a 4 week month', function() {
			$('#cal').fullCalendar('gotoDate', '2009-03-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should show 6 weeks for a 6 week month', function() {
			$('#cal').fullCalendar('gotoDate', '2013-06-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should not change height whether 4,5 or weeks', function() {
			$('#cal').fullCalendar('gotoDate', '2009-02-01');
			var fourWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			$('#cal').fullCalendar('gotoDate', '2013-10-01');
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			$('#cal').fullCalendar('gotoDate', '2013-06-01');
			var sixWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
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
			$('#cal').fullCalendar('gotoDate', '2013-10-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should show 6 weeks for a 4 week month', function() {
			$('#cal').fullCalendar('gotoDate', '2009-03-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should show 6 weeks for a 6 week month', function() {
			$('#cal').fullCalendar('gotoDate', '2013-06-01');
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
			$('#cal').fullCalendar('gotoDate', '2013-10-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(5);
		});
		it('should show 4 weeks for a 4 week month', function() {
			$('#cal').fullCalendar('gotoDate', '2009-02-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(4);
		});
		it('should show 6 weeks for a 6 week month', function() {
			$('#cal').fullCalendar('gotoDate', '2013-06-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should increase height when moving from 6 week to 5 weeks', function() {
			$('#cal').fullCalendar('gotoDate', '2013-10-01');
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			$('#cal').fullCalendar('gotoDate', '2013-06-01');
			var sixWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			expect(fiveWeekHeight).toBeGreaterThan(sixWeekHeight);
		});
		it('should reduce height when moving from 5 weeks to 6 weeks', function() {
			$('#cal').fullCalendar('gotoDate', '2013-06-01');
			var sixWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			$('#cal').fullCalendar('gotoDate', '2013-10-01');
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			expect(fiveWeekHeight).toBeGreaterThan(sixWeekHeight);
		});
		it('should increase height when moving from 5 weeks to 4 weeks', function() {
			$('#cal').fullCalendar('gotoDate', '2013-05-01');
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			$('#cal').fullCalendar('gotoDate', '2009-02-01');
			var fourWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			expect(fourWeekHeight).toBeGreaterThan(fiveWeekHeight);
		});
		it('should reduce height when moving from 4 weeks to 5 weeks', function() {
			$('#cal').fullCalendar('gotoDate', '2009-02-01');
			var fourWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			$('#cal').fullCalendar('gotoDate', '2013-05-01');
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			expect(fourWeekHeight).toBeGreaterThan(fiveWeekHeight);
		});
	});

	it('should not display an empty week when no visible days and weekMode is set to liquid', function() {
		$('#cal').fullCalendar({
			defaultDate: '2013-06-01', // June 2013 has first day as Saturday, and last as Sunday!
			weekMode: 'liquid',
			weekends: false
		});
		expect($('.fc-week').length).toBe(4);
	});

	describe('when weekMode is set to variable', function() {
		beforeEach(function() {
			$('#cal').fullCalendar({
				weekMode: 'variable'
			});
		});
		it('should show 5 weeks for a 5 week month', function() {
			$('#cal').fullCalendar('gotoDate', '2013-10-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(5);
		});
		it('should show 4 weeks for a 4 week month', function() {
			$('#cal').fullCalendar('gotoDate', '2009-02-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(4);
		});
		it('should show 6 weeks for a 6 week month', function() {
			$('#cal').fullCalendar('gotoDate', '2013-06-01');
			var weekCount = $('.fc-week').length;
			expect(weekCount).toEqual(6);
		});
		it('should not change height whether 4,5 or weeks', function() {
			$('#cal').fullCalendar('gotoDate', '2009-02-01');
			var fourWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			$('#cal').fullCalendar('gotoDate', '2013-10-01');
			var fiveWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			$('#cal').fullCalendar('gotoDate', '2013-06-01');
			var sixWeekHeight = parseInt($('.fc-week.fc-first .fc-first.fc-day div').css('min-height'), 10);
			expect(fourWeekHeight).toEqual(fiveWeekHeight);
			expect(fiveWeekHeight).toEqual(sixWeekHeight);
		});
	});

	it('should not display an empty week when no visible days and weekMode is set to variable', function() {
		$('#cal').fullCalendar({
			defaultDate: '2013-06-01', // June 2013 has first day as Saturday, and last as Sunday!
			weekMode: 'variable',
			weekends: false
		});
		expect($('.fc-week').length).toBe(4);
	});
});