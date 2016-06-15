describe('getEventSource', function() {
	var options;
	var calendarEl;

	beforeEach(function() {
		affix('#cal');
		calendarEl = $('#cal');
		options = {
			now: '2015-08-07',
			defaultView: 'agendaWeek',
			eventSources: [
				{
					events: [
						{ id: 1, start: '2015-08-07T02:00:00', end: '2015-08-07T03:00:00', title: 'event A' }
					],
					id: 'source1'
				},
				{
					events: [
						{ id: 2, start: '2015-08-07T03:00:00', end: '2015-08-07T04:00:00', title: 'event B' }
					],
					id: 'source2'
				},
				{
					events: [
						{ id: 3, start: '2015-08-07T04:00:00', end: '2015-08-07T05:00:00', title: 'event C' }
					],
					id: 'source3'
				}
			]
		};
	});

	it('does not mutate when removeEventSource is called', function(done) {
		var eventSource;

		calendarEl.fullCalendar(options);

		eventSource = calendarEl.fullCalendar('getEventSource', 'source1');
		expect(typeof eventSource).toBe('object');

		calendarEl.fullCalendar('removeEventSource', eventSource);
		expect(typeof eventSource).toBe('object'); // instead of 'undefined'

		done();
	});
});