// most other businessHours tests are in background-events.js

describe('businessHours', function() {
	var options;

	beforeEach(function() {
		options = {
			defaultDate: '2014-11-25',
			defaultView: 'month',
			businessHours: true
		};
		affix('#cal');
	});

	it('doesn\'t break when starting out in a larger month time range', function() {
		$('#cal').fullCalendar(options); // start out in the month range
		$('#cal').fullCalendar('changeView', 'agendaWeek');
		$('#cal').fullCalendar('next'); // move out of the original month range...
		$('#cal').fullCalendar('next'); // ... out. should render correctly.

		// whole days
		expect($('.fc-day-grid .fc-nonbusiness').length).toBe(2); // each multi-day stretch is one element

		// timed area
		expect($('.fc-time-grid .fc-nonbusiness').length).toBe(12);
		var containerEls = $('.fc-time-grid .fc-bgevent-skeleton td:not(.fc-axis)'); // background columns
		expect(containerEls.eq(0).find('.fc-nonbusiness').length).toBe(1);
		expect(containerEls.eq(1).find('.fc-nonbusiness').length).toBe(2);
		expect(containerEls.eq(2).find('.fc-nonbusiness').length).toBe(2);
		expect(containerEls.eq(3).find('.fc-nonbusiness').length).toBe(2);
		expect(containerEls.eq(4).find('.fc-nonbusiness').length).toBe(2);
		expect(containerEls.eq(5).find('.fc-nonbusiness').length).toBe(2);
		expect(containerEls.eq(6).find('.fc-nonbusiness').length).toBe(1);
	});
});