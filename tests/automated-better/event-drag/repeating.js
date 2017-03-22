
describe('event dragging on repeating events', function() {

	// bug where offscreen instance of a repeating event was being incorrectly dragged
	pit('drags correct instance of event', function() {

		initCalendar({
			defaultView: 'month',
			defaultDate: '2017-02-12',
			editable: true,
			events: [
				{
					id: 999,
					title: 'Repeating Event',
					start: '2017-02-09T16:00:00'
				},
				{
					id: 999,
					title: 'Repeating Event',
					start: '2017-02-16T16:00:00'
				}
			]
		});

		// event range needs out large (month) then scope down (agendaWeek)
		// so that the new view receives out-of-range events.
		currentCalendar.changeView('agendaWeek');

		return TimeGridEventDragUtils.drag('2017-02-16T16:00:00', '2017-02-16T12:00:00')
			.then(function(res) {
				expect(res.isSuccess).toBe(true);
			});
	});

});
