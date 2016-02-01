
describe('scroll state', function() {
	var options;

	beforeEach(function() {
		options = {
			defaultDate: '2015-02-20',
			contentHeight: 200
		};
		affix('#cal');
		$('#cal').width(800);
	});

	describe('when in month view', function() {
		beforeEach(function() {
			options.defaultView = 'month';
		});
		defineTests();
	});

	describe('when in agendaWeek view', function() {
		beforeEach(function() {
			options.defaultView = 'agendaWeek';
			options.scrollTime = '00:00';
		});
		defineTests();
	});

	function defineTests() {

		it('should be maintained when moving resizing window', function(done) {
			var scrollEl;
			var scroll0;

			options.windowResize = function() {
				setTimeout(function() { // wait until all other tasks are finished
					expect(scrollEl.scrollTop()).toBe(scroll0);
					done();
				}, 0);
			};

			$('#cal').fullCalendar(options);
			scrollEl = $('#cal .fc-scroller');

			setTimeout(function() { // wait until after browser's scroll state is applied
				scrollEl.scrollTop(9999); // all the way
				scroll0 = scrollEl.scrollTop();
				$(window).trigger('resize');
			}, 0);
		});

		it('should be maintained when after rerendering events', function(done) {
			var calls = 0;
			var eventEl0;
			var eventEl1;
			var scrollEl;
			var scroll0;

			options.events = [ {
				start: '2015-02-20'
			} ];
			options.eventAfterAllRender = function() {
				if (++calls === 1) {
					eventEl0 = $('#cal .fc-event');
					expect(eventEl0.length).toBe(1);

					setTimeout(function() { // wait until after browser's scroll state is applied
						scrollEl.scrollTop(9999); // all the way
						scroll0 = scrollEl.scrollTop();
						$('#cal').fullCalendar('rerenderEvents');
					}, 0);
				}
				else {
					eventEl1 = $('#cal .fc-event');
					expect(eventEl1.length).toBe(1);
					expect(eventEl1[0]).not.toBe(eventEl0[0]); // ensure it a rerender
					expect(scrollEl.scrollTop()).toBe(scroll0);
					done();
				}
			};

			$('#cal').fullCalendar(options);
			scrollEl = $('#cal .fc-scroller');
		});
	}
});