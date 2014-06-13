describe('eventResize', function() {
	var options;

	beforeEach(function() {
		options = {
			defaultDate: '2014-06-11',
			editable: true
		};
		affix('#cal');
	});

	afterEach(function() {
		$('#cal').fullCalendar('destroy');
	});

	describe('when in month view', function() {
		beforeEach(function() {
			options.defaultView = 'month';
		});

		describe('when resizing an all-day event', function() {
			it('should have correct arguments with a whole-day delta', function(done) {
				options.events = [ {
					title: 'all-day event',
					start: '2014-06-11',
					allDay: true
				} ];

				init(
					function() {
						$('.fc-event .ui-resizable-handle')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag-n-drop', {
								dx: $('.fc-day').width() * -2,
								dy: $('.fc-day').height()
							});
					},
					function(event, delta, revertFunc) {
						expect(delta.asDays()).toBe(5);
						expect(delta.hours()).toBe(0);
						expect(delta.minutes()).toBe(0);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment('2014-06-11');
						expect(event.end).toEqualMoment('2014-06-17');
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11');
						expect(event.end).toBeNull();

						done();
					}
				);
			});
		});

		describe('when rendering a timed event', function() {
			it('should not have resize capabilities', function(done) {
				options.events = [ {
					title: 'timed event',
					start: '2014-06-11T08:00:00',
					allDay: false
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-event .ui-resizable-handle').length).toBe(0);
					done();
				};
				$('#cal').fullCalendar(options);
			});
		});
	});

	describe('when in agenda view', function() {
		beforeEach(function() {
			options.defaultView = 'agendaWeek';
		});

		describe('when resizing an all-day event', function() {
			it('should have correct arguments with a whole-day delta', function(done) {
				options.events = [ {
					title: 'all-day event',
					start: '2014-06-11',
					allDay: true
				} ];

				init(
					function() {
						$('.fc-event .ui-resizable-handle')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag-n-drop', {
								dx: $('th.fc-wed').width() * 1.5 // two days
							});
					},
					function(event, delta, revertFunc) {
						expect(delta.asDays()).toBe(2);
						expect(delta.hours()).toBe(0);
						expect(delta.minutes()).toBe(0);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment('2014-06-11');
						expect(event.end).toEqualMoment('2014-06-14');
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11');
						expect(event.end).toBeNull();

						done();
					}
				);
			});
		});

		describe('when resizing a timed event with an end', function() {
			beforeEach(function() {
				options.events = [ {
					title: 'timed event event',
					start: '2014-06-11T05:00:00',
					end: '2014-06-11T07:00:00',
					allDay: false
				} ];
			});

			it('should have correct arguments with a timed delta', function(done) {
				init(
					function() {
						$('.fc-event .ui-resizable-handle')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag-n-drop', {
								dy: $('tr.fc-slot1').height() * 4.5 // 5 slots, so 2.5 hours
							});
					},
					function(event, delta, revertFunc) {
						expect(delta.days()).toBe(0);
						expect(delta.hours()).toBe(2);
						expect(delta.minutes()).toBe(30);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment('2014-06-11T05:00:00');
						expect(event.end).toEqualMoment('2014-06-11T09:30:00');
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11T05:00:00');
						expect(event.end).toEqualMoment('2014-06-11T07:00:00');

						done();
					}
				);
			});
		});
	});

	// Initialize a calendar, run a resize, and do type-checking of all arguments for all handlers.
	// TODO: more descrimination instead of just checking for 'object'
	function init(resizeStartFunc, resizeDoneFunc) {
		var eventsRendered = false;

		options.eventAfterAllRender = function() {
			if (!eventsRendered) { // because event rerendering will happen when resize is over
				resizeStartFunc();
				eventsRendered = true;
			}
		};
		options.eventResizeStart = function(event, jsEvent, uiEvent, view) {
			expect(this instanceof Element).toBe(true);
			expect(this).toHaveClass('fc-event');
			expect(typeof event).toBe('object');
			expect(typeof jsEvent).toBe('object');
			expect(typeof uiEvent).toBe('object');
			expect(typeof view).toBe('object');
		};
		options.eventResizeStop = function(event, jsEvent, uiEvent, view) {
			expect(options.eventResizeStart).toHaveBeenCalled();

			expect(this instanceof Element).toBe(true);
			expect(this).toHaveClass('fc-event');
			expect(typeof event).toBe('object');
			expect(typeof jsEvent).toBe('object');
			expect(typeof uiEvent).toBe('object');
			expect(typeof view).toBe('object');
		};
		options.eventResize = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
			expect(options.eventResizeStop).toHaveBeenCalled();

			expect(this instanceof Element).toBe(true);
			expect(this).toHaveClass('fc-event');
			expect(typeof event).toBe('object');
			expect(moment.isDuration(delta)).toBe(true);
			expect(typeof revertFunc).toBe('function');
			expect(typeof jsEvent).toBe('object');
			expect(typeof uiEvent).toBe('object'); // might be a non-jqui dummy object
			expect(typeof view).toBe('object');

			resizeDoneFunc.apply(this, arguments);
		};

		spyOn(options, 'eventResizeStart').and.callThrough();
		spyOn(options, 'eventResizeStop').and.callThrough();

		setTimeout(function() { // hack. agenda view scroll state would get messed up between tests
			$('#cal').fullCalendar(options);
		}, 0);
	}
});