describe('eventMouseover', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-01',
			scrollTime: '00:00:00'
		};
	});

	[ 'month', 'agendaWeek' ].forEach(function(viewName) {
		describe('for ' + viewName + ' view', function() {
			beforeEach(function() {
				options.defaultView = viewName;
			});
			it('will trigger a eventMouseout with updateEvent', function(done) {
				options.events = [ {
					title: 'event',
					start: '2014-08-02T01:00:00',
					className: 'event'
				} ];
				options.eventMouseover = function(event, ev) {
					expect(typeof event).toBe('object');
					expect(typeof ev).toBe('object');
					event.title = 'YO';
					$('#cal').fullCalendar('updateEvent', event);
				};
				options.eventMouseout = function(event, ev) {
					expect(typeof event).toBe('object');
					expect(typeof ev).toBe('object');
					done();
				};
				spyOn(options, 'eventMouseout').and.callThrough();
				$('#cal').fullCalendar(options);
				$('.event').simulate('mouseover');
			});
		});
	});
});