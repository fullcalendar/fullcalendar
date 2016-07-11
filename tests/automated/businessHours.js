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


	describe('when used as a dynamic option', function() {
		[ 'agendaWeek', 'month' ].forEach(function(viewName) {

			it('allows dynamic turning on', function() {
				$('#cal').fullCalendar({
					defaultView: viewName,
					businessHours: false
				});
				var rootEl = $('.fc-view > *:first');
				expect(rootEl.length).toBe(1);

				expect(queryNonBusinessSegs().length).toBe(0);
				$('#cal').fullCalendar('option', 'businessHours', true);
				expect(queryNonBusinessSegs().length).toBeGreaterThan(0);

				expect($('.fc-view > *:first')[0]).toBe(rootEl[0]); // same element. didn't completely rerender
			});

			it('allows dynamic turning off', function() {
				$('#cal').fullCalendar({
					defaultView: viewName,
					businessHours: true
				});
				var rootEl = $('.fc-view > *:first');
				expect(rootEl.length).toBe(1);

				expect(queryNonBusinessSegs().length).toBeGreaterThan(0);
				$('#cal').fullCalendar('option', 'businessHours', false);
				expect(queryNonBusinessSegs().length).toBe(0);

				expect($('.fc-view > *:first')[0]).toBe(rootEl[0]); // same element. didn't completely rerender
			});
		});
	});


	function queryNonBusinessSegsInCol(col) {
		return $('.fc-time-grid .fc-content-skeleton td:not(.fc-axis):eq(' + col + ') .fc-nonbusiness');
	}

	function queryNonBusinessSegs() {
		return $('.fc-nonbusiness');
	}

});