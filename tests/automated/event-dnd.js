describe('eventDrop', function() {
	var options;

	beforeEach(function() {
		options = {
			defaultDate: '2014-06-11',
			editable: true,
			dragScroll: false
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

		describe('when dragging an all-day event to another day', function() {
			it('should be given correct arguments, with whole-day delta', function(done) {
				options.events = [ {
					title: 'all-day event',
					start: '2014-06-11',
					allDay: true
				} ];

				init(
					function() {
						$('.fc-event').simulate('drag-n-drop', {
							dx: $('.fc-day').width() * 2,
							dy: $('.fc-day').height()
						});
					},
					function(event, delta, revertFunc) {
						expect(delta.asDays()).toBe(9);
						expect(delta.hours()).toBe(0);
						expect(delta.minutes()).toBe(0);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment('2014-06-20');
						expect(event.end).toBeNull();
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11');
						expect(event.end).toBeNull();

						done();
					}
				);
			});
		});

		describe('when gragging a timed event to another day', function() {
			it('should be given correct arguments, with whole-day delta', function(done) {
				options.events = [ {
					title: 'timed event',
					start: '2014-06-11T06:00:00',
					allDay: false
				} ];

				init(
					function() {
						$('.fc-event').simulate('drag-n-drop', {
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

						expect(event.start).toEqualMoment('2014-06-16T06:00:00');
						expect(event.end).toBeNull();
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11T06:00:00');
						expect(event.end).toBeNull();

						done();
					}
				);
			});
		});

		// TODO: tests for eventMouseover/eventMouseout firing correctly when no dragging
		it('should not fire any eventMouseover/eventMouseout events while dragging', function(done) { // issue 1297
			options.events = [
				{
					title: 'all-day event',
					start: '2014-06-11',
					allDay: true,
					className: 'event1'
				},
				{
					title: 'event2',
					start: '2014-06-10',
					allDay: true,
					className: 'event2'
				}
			];
			options.eventMouseover = function() { };
			options.eventMouseout = function() { };
			spyOn(options, 'eventMouseover');
			spyOn(options, 'eventMouseout');

			init(
				function() {
					$('.event1').simulate('drag-n-drop', {
						dx: $('.fc-day').width() * 2,
						dy: $('.fc-day').height(),
						interpolation: {
							stepCount: 10,
							duration: 1000
						}
					});
					setTimeout(function() { // wait until half way through drag
						$('.event2')
							.simulate('mouseover')
							.simulate('mouseenter')
							.simulate('mouseout')
							.simulate('mouseleave');
					}, 500);
				},
				function(event, delta, revertFunc) {
					expect(options.eventMouseover).not.toHaveBeenCalled();
					expect(options.eventMouseout).not.toHaveBeenCalled();
					done();
				}
			);
		});
	});

	describe('when in agenda view', function() {
		beforeEach(function() {
			options.defaultView = 'agendaWeek';
		});

		describe('when dragging a timed event to another time on a different day', function() {
			it('should be given correct arguments and delta with days/time', function(done) {
				options.events = [ {
					title: 'timed event',
					start: '2014-06-11T06:00:00',
					allDay: false
				} ];

				init(
					function() {
						$('.fc-event .fc-time').simulate('drag-n-drop', {
							dx: $('th.fc-wed').width(), // 1 day
							dy: $('.fc-slats tr:eq(1)').outerHeight() * 2.9 // 1.5 hours
						});
					},
					function(event, delta, revertFunc) {
						expect(delta.days()).toBe(1);
						expect(delta.hours()).toBe(1);
						expect(delta.minutes()).toBe(30);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment('2014-06-12T07:30:00');
						expect(event.end).toBeNull();
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11T06:00:00');
						expect(event.end).toBeNull();

						done();
					}
				);
			});
		});

		describe('when dragging an all-day event to another all-day', function() {
			it('should be given correct arguments, with whole-day delta', function(done) {
				options.events = [ {
					title: 'all-day event',
					start: '2014-06-11',
					allDay: true
				} ];

				init(
					function() {
						$('.fc-event').simulate('drag-n-drop', {
							dx: $('th.fc-wed').width() * 2 // 2 days
						});
					},
					function(event, delta, revertFunc) {
						expect(delta.days()).toBe(2);
						expect(delta.hours()).toBe(0);
						expect(delta.minutes()).toBe(0);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment('2014-06-13');
						expect(event.end).toBeNull();
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11');
						expect(event.end).toBeNull();

						done();
					}
				);
			});
		});

		describe('when dragging an all-day event to a time slot on a different day', function() {
			it('should be given correct arguments and delta with days/time', function(done) {
				options.scrollTime = '01:00:00';
				options.height = 400; // short enough to make scrolling happen
				options.events = [ {
					title: 'all-day event',
					start: '2014-06-11',
					allDay: true
				} ];

				init(
					function() {
						var allDayGrid = $('.fc-agenda-view .fc-day-grid');
						var hr = allDayGrid.next('hr');
						$('.fc-event').simulate('drag-n-drop', {
							dx: $('th.fc-wed').width() * -1,
							dy: allDayGrid.outerHeight() + hr.outerHeight()
						});
					},
					function(event, delta, revertFunc) {
						expect(delta.days()).toBe(-1);
						expect(delta.hours()).toBe(1);
						expect(delta.minutes()).toBe(0);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment('2014-06-10T01:00:00');
						expect(event.end).toBeNull();
						expect(event.allDay).toBe(false);
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11');
						expect(event.end).toBeNull();
						expect(event.allDay).toBe(true);

						done();
					}
				);
			});
		});

		describe('when dragging a timed event to an all-day slot on a different day', function() {
			it('should be given correct arguments, with whole-day delta', function(done) {
				var eventElm;

				options.scrollTime = '01:00:00';
				options.height = 400; // short enough to make scrolling happen
				options.events = [ {
					title: 'timed event',
					start: '2014-06-11T01:00:00',
					allDay: false
				} ];

				init(
					function() {
						eventElm = $('.fc-event .fc-time').simulate('drag', { // grabs the top of the event
							dx: $('th.fc-wed').width() * -1,
							dy: -$('.fc-agenda-view .fc-day-grid').outerHeight(),
							callback: function() {
								// the all day slot works off of mouse-moving coordinates
								var offset = eventElm.offset();
								$('.fc-agenda-allday .fc-day-content')
									.simulate('mouseover', {
										clientX: offset.left + 10,
										clientY: offset.top + 10
									})
									.simulate('mousemove', {
										clientX: offset.left + 10,
										clientY: offset.top + 10
									});
								setTimeout(function() {
									eventElm.simulate('drop');
								}, 100);
							}
						});
					},
					function(event, delta, revertFunc) {
						expect(delta.days()).toBe(-1);
						expect(delta.hours()).toBe(0);
						expect(delta.minutes()).toBe(0);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment('2014-06-10');
						expect(event.end).toBeNull();
						expect(event.allDay).toBe(true);
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11T01:00:00');
						expect(event.end).toBeNull();
						expect(event.allDay).toBe(false);

						done();
					}
				);
			});
		});

		describe('when dragging a timed event with no end time', function() {
			it('should continue to only show the updated start time', function(done) {
				var dragged = false;
				var eventElm;

				options.scrollTime = '01:00:00';
				options.height = 400; // short enough to make scrolling happen
				options.events = [ {
					title: 'timed event',
					start: '2014-06-11T01:00:00',
					allDay: false
				} ];

				init(
					function() {
						eventElm = $('.fc-event .fc-time').simulate('drag', {
							dy: $('.fc-slats tr:eq(1)').height() * 2.9, // 1.5 hours
							callback: function() {
								dragged = true;
								expect($('.fc-event.fc-helper .fc-time')).toHaveText('2:30');
								eventElm.simulate('drop');
							}
						});
					},
					function() {
						expect(dragged).toBe(true);
						done();
					}
				);
			});
		});

		describe('when dragging a timed event with an end time', function() {
			it('should continue to show the updated start and end time', function(done) {
				var dragged = false;
				var eventElm;

				options.scrollTime = '01:00:00';
				options.height = 400; // short enough to make scrolling happen
				options.events = [ {
					title: 'timed event',
					start: '2014-06-11T01:00:00',
					end: '2014-06-11T02:00:00',
					allDay: false
				} ];

				init(
					function() {
						eventElm = $('.fc-event .fc-time').simulate('drag', {
							dy: $('.fc-slats tr:eq(1)').height() * 2.9, // 1.5 hours
							callback: function() {
								dragged = true;
								expect($('.fc-event.fc-helper .fc-time')).toHaveText('2:30 - 3:30');
								eventElm.simulate('drop');
							}
						});
					},
					function() {
						expect(dragged).toBe(true);
						done();
					}
				);
			});
		});
	});

	// Initialize a calendar, run a drag, and do type-checking of all arguments for all handlers.
	// TODO: more descrimination instead of just checking for 'object'
	function init(dragFunc, dropHandler) {
		var eventsRendered = false;

		options.eventAfterAllRender = function() {
			if (!eventsRendered) { // because event rerendering will happen upon drop
				dragFunc();
				eventsRendered = true;
			}
		};
		options.eventDragStart = function(event, jsEvent, uiEvent, view) {
			expect(this instanceof Element).toBe(true);
			expect(this).toHaveClass('fc-event');
			expect(typeof event).toBe('object');
			expect(typeof jsEvent).toBe('object');
			expect(typeof uiEvent).toBe('object');
			expect(typeof view).toBe('object');
		};
		options.eventDragStop = function(event, jsEvent, uiEvent, view) {
			expect(options.eventDragStart).toHaveBeenCalled();

			expect(this instanceof Element).toBe(true);
			expect(this).toHaveClass('fc-event');
			expect(typeof event).toBe('object');
			expect(typeof jsEvent).toBe('object');
			expect(typeof uiEvent).toBe('object');
			expect(typeof view).toBe('object');
		};
		options.eventDrop = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
			expect(options.eventDragStop).toHaveBeenCalled();

			expect(this instanceof Element).toBe(true);
			expect(this).toHaveClass('fc-event');
			expect(typeof event).toBe('object');
			expect(moment.isDuration(delta)).toBe(true);
			expect(typeof revertFunc).toBe('function');
			expect(typeof jsEvent).toBe('object');
			expect(typeof uiEvent).toBe('object');
			expect(typeof view).toBe('object');

			dropHandler.apply(this, arguments);
		};

		spyOn(options, 'eventDragStart').and.callThrough();
		spyOn(options, 'eventDragStop').and.callThrough();

		setTimeout(function() { // hack. agenda view scroll state would get messed up between tests
			$('#cal').fullCalendar(options);
		}, 0);
	}
});