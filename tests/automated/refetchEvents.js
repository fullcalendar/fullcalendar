
describe('when agenda events are rerendered', function() {
	beforeEach(function() {
		affix('#cal');
	});

	it('keeps scroll after refetchEvents', function(done) {
		var renderCalls = 0;

		$('#cal').fullCalendar({
			now: '2015-08-07',
			scrollTime: '00:00',
			height: 400, // makes this test more consistent across viewports
			defaultView: 'agendaDay',
			events: function(start, end, timezone, callback) {
				setTimeout(function() {
					callback([
						{ id: '1', resourceId: 'b', start: '2015-08-07T02:00:00', end: '2015-08-07T07:00:00', title: 'event 1' },
						{ id: '2', resourceId: 'c', start: '2015-08-07T05:00:00', end: '2015-08-07T22:00:00', title: 'event 2' },
						{ id: '3', resourceId: 'd', start: '2015-08-06', end: '2015-08-08', title: 'event 3' },
						{ id: '4', resourceId: 'e', start: '2015-08-07T03:00:00', end: '2015-08-07T08:00:00', title: 'event 4' },
						{ id: '5', resourceId: 'f', start: '2015-08-07T00:30:00', end: '2015-08-07T02:30:00', title: 'event 5' }
					]);
				}, 100);
			},
			eventAfterAllRender: function() {
				var scrollEl = $('.fc-time-grid-container.fc-scroller');
				renderCalls++;
				if (renderCalls == 1) {
					setTimeout(function() {
						scrollEl.scrollTop(100);
						setTimeout(function() {
							$('#cal').fullCalendar('refetchEvents');
						}, 100);
					}, 100);
				}
				else if (renderCalls == 2) {
					expect(scrollEl.scrollTop()).toBe(100);
					done();
				}
			}
		});
	});

});
