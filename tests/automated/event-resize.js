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
						$('.fc-event .fc-resizer').simulate('drag-n-drop', {
							dx: $('.fc-day').width() * -2.5, // guarantee 2 days to left
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
					expect($('.fc-event .fc-resizer').length).toBe(0);
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
						$('.fc-event .fc-resizer').simulate('drag-n-drop', {
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
						$('.fc-event .fc-resizer').simulate('drag-n-drop', {
							dy: $('.fc-slats tr:eq(1)').height() * 4.5 // 5 slots, so 2.5 hours
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

			// TODO: test RTL
			it('should have correct arguments with a timed delta when resized to a different day', function(done) {
				init(
					function() {
						$('.fc-event .fc-resizer').simulate('drag-n-drop', {
							dx: $('.fc-day-header:first').width() * .9, // one day
							dy: $('.fc-slats tr:eq(1)').height() * 4.5 // 5 slots, so 2.5 hours
						});
					},
					function(event, delta, revertFunc) {
						expect(delta.days()).toBe(1);
						expect(delta.hours()).toBe(2);
						expect(delta.minutes()).toBe(30);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment('2014-06-11T05:00:00');
						expect(event.end).toEqualMoment('2014-06-12T09:30:00');
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11T05:00:00');
						expect(event.end).toEqualMoment('2014-06-11T07:00:00');

						done();
					}
				);
			});

			it('should have correct arguments with a timed delta, when timezone is local', function(done) {
				options.timezone = 'local';
				init(
					function() {
						$('.fc-event .fc-resizer').simulate('drag-n-drop', {
							dy: $('.fc-slats tr:eq(1)').height() * 4.5 // 5 slots, so 2.5 hours
						});
					},
					function(event, delta, revertFunc) {
						expect(delta.days()).toBe(0);
						expect(delta.hours()).toBe(2);
						expect(delta.minutes()).toBe(30);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment(moment('2014-06-11T05:00:00')); // compate to local moment
						expect(event.end).toEqualMoment(moment('2014-06-11T09:30:00'));
						revertFunc();
						expect(event.start).toEqualMoment(moment('2014-06-11T05:00:00'));
						expect(event.end).toEqualMoment(moment('2014-06-11T07:00:00'));

						done();
					}
				);
			});

			it('should have correct arguments with a timed delta, when timezone is UTC', function(done) {
				options.timezone = 'UTC';
				init(
					function() {
						$('.fc-event .fc-resizer').simulate('drag-n-drop', {
							dy: $('.fc-slats tr:eq(1)').height() * 4.5 // 5 slots, so 2.5 hours
						});
					},
					function(event, delta, revertFunc) {
						expect(delta.days()).toBe(0);
						expect(delta.hours()).toBe(2);
						expect(delta.minutes()).toBe(30);
						expect(delta.seconds()).toBe(0);
						expect(delta.milliseconds()).toBe(0);

						expect(event.start).toEqualMoment('2014-06-11T05:00:00+00:00');
						expect(event.end).toEqualMoment('2014-06-11T09:30:00+00:00');
						revertFunc();
						expect(event.start).toEqualMoment('2014-06-11T05:00:00+00:00');
						expect(event.end).toEqualMoment('2014-06-11T07:00:00+00:00');

						done();
					}
				);
			});

			it('should display the correct time text while resizing', function(done) {
				var dy;
				var handle;

				init(
					function() {
						dy = $('.fc-slats tr:eq(1)').height() * 4.5; // 5 slots, so 2.5 hours
						handle = $('.fc-event .fc-resizer').simulate('drag', {
							dy: dy,
							callback: function() {
								expect($('.fc-event.fc-helper .fc-time')).toHaveText('5:00 - 9:30');
								handle.simulate('drag', {
									// BUG with jquery-simulate-ext
									// I guess the delta is still relative to the original position, so should be zero.
									// But zero causes nothing to happen, so make it a tiny non-zero delta.
									dy: -1,

									callback: function() {
										expect($('.fc-event.fc-helper')).not.toExist();
										expect($('.fc-event')).toBeVisible();
										expect($('.fc-event .fc-time')).toHaveText('5:00 - 7:00');
										handle.simulate('drop', {
											callback: function() {
												done();
											}
										});
									}
								});
							}
						});
					},
					function() {
						// this wasn't firing for some reason. do it in the drop callback instead
						//done();
					}
				);
			});

			it('should run the temporarily rendered event through eventRender', function(done) {
				var dy;
				var handle;

				options.eventRender = function(event, element) {
					element.addClass('didEventRender');
				};

				init(
					function() {
						dy = $('.fc-slats tr:eq(1)').height() * 4.5; // 5 slots, so 2.5 hours
						handle = $('.fc-event .fc-resizer').simulate('drag', {
							dy: dy,
							callback: function() {
								expect($('.fc-event.fc-helper')).toHaveClass('didEventRender');
								handle.simulate('drag', {
									// BUG with jquery-simulate-ext
									// I guess the delta is still relative to the original position, so should be zero.
									// But zero causes nothing to happen, so make it a tiny non-zero delta.
									dy: -1,

									callback: function() {
										expect($('.fc-event.fc-helper')).not.toExist();
										handle.simulate('drop', {
											callback: function() {
												done();
											}
										});
									}
								});
							}
						});
					},
					function() {
						// this wasn't firing for some reason. do it in the drop callback instead
						//done();
					}
				);
			});

			it('should not fire the windowResize handler', function(done) { // bug 1116

				// has to do this crap because PhantomJS was trigger false window resizes unrelated to the fc-event resize
				var isDragging = false;
				var calledWhileDragging = false;

				options.windowResizeDelay = 0;
				options.windowResize = function(ev) {
					if (isDragging) {
						calledWhileDragging = true;
					}
				};

				init(
					function() {
						setTimeout(function() {
							isDragging = true;
							$('.fc-event .fc-resizer').simulate('drag-n-drop', {
								dy: 100
							});
						}, 100); // hack for PhantomJS. after any initial false window resizes
					},
					function() {
						expect(calledWhileDragging).toBe(false);
						done();
					}
				);
			});
		});

		describe('when resizing a timed event without an end', function() {
			beforeEach(function() {
				options.events = [ {
					title: 'timed event event',
					start: '2014-06-11T05:00:00',
					allDay: false
				} ];
			});

			it('should display the correct time text while resizing', function(done) {
				var dy;
				var handle;

				init(
					function() {
						dy = $('.fc-slats tr:eq(1)').height() * 4.5; // 5 slots, so 2.5 hours
						handle = $('.fc-event .fc-resizer').simulate('drag', {
							dy: dy,
							callback: function() {
								expect($('.fc-event.fc-helper .fc-time')).toHaveText('5:00 - 9:30');
								handle.simulate('drag', {
									// BUG with jquery-simulate-ext
									// I guess the delta is still relative to the original position, so should be zero.
									// But zero causes nothing to happen, so make it a tiny non-zero delta.
									dy: -1,

									callback: function() {
										expect($('.fc-event.fc-helper')).not.toExist();
										expect($('.fc-event')).toBeVisible();
										expect($('.fc-event .fc-time')).toHaveText('5:00');
										handle.simulate('drop', {
											callback: function() {
												done();
											}
										});
									}
								});
							}
						});
					},
					function() {
						// this wasn't firing for some reason. do it in the drop callback instead
						//done();
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