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

		expect($('.fc-nonbusiness').length).toBe(12);
		expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(0) .fc-nonbusiness').length).toBe(1); // column 0
		expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(1) .fc-nonbusiness').length).toBe(2); // column 1
		expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(2) .fc-nonbusiness').length).toBe(2); // column 2
		expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(3) .fc-nonbusiness').length).toBe(2); // column 3
		expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(4) .fc-nonbusiness').length).toBe(2); // column 4
		expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(5) .fc-nonbusiness').length).toBe(2); // column 5
		expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(6) .fc-nonbusiness').length).toBe(1); // column 6
	});
});