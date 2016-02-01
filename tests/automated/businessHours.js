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
		expect(queryNonBusinessSegsInCol(0).length).toBe(1);
		expect(queryNonBusinessSegsInCol(1).length).toBe(2);
		expect(queryNonBusinessSegsInCol(2).length).toBe(2);
		expect(queryNonBusinessSegsInCol(3).length).toBe(2);
		expect(queryNonBusinessSegsInCol(4).length).toBe(2);
		expect(queryNonBusinessSegsInCol(5).length).toBe(2);
		expect(queryNonBusinessSegsInCol(6).length).toBe(1);
	});


	function queryNonBusinessSegsInCol(col) {
		return $('.fc-time-grid .fc-content-skeleton td:not(.fc-axis):eq(' + col + ') .fc-nonbusiness');
	}

});