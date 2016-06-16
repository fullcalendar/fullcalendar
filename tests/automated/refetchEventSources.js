describe('refetchEventSources', function() {
	var calendarEl;
	var eventCount;
	var options;

	beforeEach(function() {
		affix('#cal');
		calendarEl = $('#cal');
		eventCount = 1;
		options = {
			now: '2015-08-07',
			defaultView: 'agendaWeek',
			eventSources: [
				{
					events: createEventGenerator('source1', 'A'),
					color: 'green',
					id: 'source1'
				},
				{
					events: createEventGenerator('source2', 'B'),
					color: 'blue',
					id: 'source2'
				},
				{
					events: createEventGenerator('source3', 'C'),
					color: 'green',
					rendering: 'background',
					id: 'source3'
				}
			]
		};
	});

	describe('with a single event source passed in', function() {
		it('only refetches events for the specified event source', function(done) {
			calendarEl.fullCalendar(options);

			expect($('.source1').length).toEqual(1);
			expect($('.source2').length).toEqual(1);
			expect($('.source3').length).toEqual(1);

			var eventSources = $.grep(calendarEl.fullCalendar('getEventSources'), function(eventSource) {
				return eventSource.color === 'blue';
			});

			// increase the number of events for the refetched source
			eventCount = 2;

			calendarEl.fullCalendar('refetchEventSources', eventSources[0]);

			// ensure events have been updated
			expect($('.source1').length).toEqual(1);
			expect($('.source2').length).toEqual(2);
			expect($('.source3').length).toEqual(1);

			done();			
		});
	});

	describe('with an array of multiple event sources passed in', function() {
		it('only refetches events for the specified event sources', function(done) {
			calendarEl.fullCalendar(options);

			expect($('.source1').length).toEqual(1);
			expect($('.source2').length).toEqual(1);
			expect($('.source3').length).toEqual(1);

			var eventSources = $.grep(calendarEl.fullCalendar('getEventSources'), function(eventSource) {
				return eventSource.color === 'green';
			});

			// increase the number of events for the refetched sources
			eventCount = 2;

			calendarEl.fullCalendar('refetchEventSources', eventSources);

			// ensure events have been updated
			expect($('.source1').length).toEqual(2);
			expect($('.source2').length).toEqual(1);
			expect($('.source3').length).toEqual(2);

			done();			
		});
	});

	function createEventGenerator(sourceId, eventId) {
		return function(start, end, timezone, callback) {
			var events = [];

			for (var i = 0; i < eventCount; i++) {
				events.push({
					id: eventId + i,
					start: '2015-08-07T02:00:00',
					end: '2015-08-07T03:00:00',
					title: 'event ' + eventId,
					className: sourceId
				});
			}

			callback(events);
		};
	}
});