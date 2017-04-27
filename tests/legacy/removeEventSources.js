describe('removeEventSources', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-01',
			defaultView: 'agendaDay',
			eventSources: [
				buildEventSource(1),
				buildEventSource(2),
				buildEventSource(3)
			]
		};
	});

	describe('when called with no arguments', function() {
		it('removes all sources', function() {

			$('#cal').fullCalendar(options);
			expect($('.fc-event').length).toBe(3);

			$('#cal').fullCalendar('removeEventSources');
			expect($('.fc-event').length).toBe(0);
		});
	});

	describe('when called with specific IDs', function() {
		it('removes only events with matching sources', function() {

			$('#cal').fullCalendar(options);
			expect($('.fc-event').length).toBe(3);

			$('#cal').fullCalendar('removeEventSources', [ 1, 3 ]);
			expect($('.fc-event').length).toBe(1);
			expect($('.event2').length).toBe(1);
		});
	});

	function buildEventSource(id) {
		return {
			id: id,
			events: function(start, end, timezone, callback) {
				callback([ {
					title: 'event' + id,
					className: 'event' + id,
					start: '2014-08-01T02:00:00'
				} ]);
			}
		};
	}
});
