describe('eventDrop', function() {

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

		describe('when dragging an all-day event to another day', function() {
			it('should be given correct arguments, with whole-day delta', function(done) {
				options.events = [ {
					title: 'all-day event',
					start: '2014-06-11',
					allDay: true
				} ];
				var called = false;
				options.eventAfterAllRender = function() {
					if (!called) { // because event rerendering will happen upon drop
						$('.fc-event')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag-n-drop', {
								dx: $('.fc-day').width() * 2,
								dy: $('.fc-day').height(),
								interpolation: {
									stepCount: 10,
									duration: 100
								}
							});
						called = true;
					}
				};
				options.eventDrop = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
					// only type-check arguments for basic view once here
					expect(typeof event).toBe('object'); // TODO: discriminate more
					expect(moment.isDuration(delta)).toBe(true);
					expect(typeof revertFunc).toBe('function');
					expect(typeof jsEvent).toBe('object'); // TODO: discriminate more
					expect(typeof uiEvent).toBe('object'); // "
					expect(typeof view).toBe('object'); // "

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
				};
				$('#cal').fullCalendar(options);
			});
		});

		describe('when gragging a timed event to another day', function() {
			it('should be given correct arguments, with whole-day delta', function(done) {
				options.events = [ {
					title: 'timed event',
					start: '2014-06-11T06:00:00',
					allDay: false
				} ];
				var called = false;
				options.eventAfterAllRender = function() {
					if (!called) { // because event rerendering will happen upon drop
						$('.fc-event')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag-n-drop', {
								dx: $('.fc-day').width() * -2,
								dy: $('.fc-day').height(),
								interpolation: {
									stepCount: 10,
									duration: 100
								}
							});
						called = true;
					}
				};
				options.eventDrop = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
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
				};
				$('#cal').fullCalendar(options);
			});
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
				var called = false;
				options.eventAfterAllRender = function() {
					if (!called) { // because event rerendering will happen upon drop
						$('.fc-event')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag-n-drop', {
								dx: $('th.fc-wed').width(), // 1 day
								dy: $('tr.fc-slot1').height() * 3, // 1.5 hours
								interpolation: {
									stepCount: 10,
									duration: 100
								}
							});
						called = true;
					}
				};
				options.eventDrop = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
					// only type-check arguments for agenda view once here
					expect(typeof event).toBe('object'); // TODO: discriminate more
					expect(moment.isDuration(delta)).toBe(true);
					expect(typeof revertFunc).toBe('function');
					expect(typeof jsEvent).toBe('object'); // TODO: discriminate more
					expect(typeof uiEvent).toBe('object'); // "
					expect(typeof view).toBe('object'); // "

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
				};
				$('#cal').fullCalendar(options);
			});
		});

		describe('when dragging an all-day event to another all-day', function() {
			it('should be given correct arguments, with whole-day delta', function(done) {
				options.events = [ {
					title: 'all-day event',
					start: '2014-06-11',
					allDay: true
				} ];
				var called = false;
				options.eventAfterAllRender = function() {
					if (!called) { // because event rerendering will happen upon drop
						$('.fc-event')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag-n-drop', {
								dx: $('th.fc-wed').width() * 2, // 2 days
								interpolation: {
									stepCount: 10,
									duration: 100
								}
							});
						called = true;
					}
				};
				options.eventDrop = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
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
				};
				$('#cal').fullCalendar(options);
			});
		});

		describe('when dragging an all-day event to a time slot on a different day', function() {
			it('should be given correct arguments and delta with days/time', function(done) {
				options.scrollTime = '01:00:00';
				options.events = [ {
					title: 'all-day event',
					start: '2014-06-11',
					allDay: true
				} ];
				var called = false;
				options.eventAfterAllRender = function() {
					if (!called) { // because event rerendering will happen upon drop
						$('.fc-event')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag-n-drop', {
								dx: $('th.fc-wed').width() * -1,
								dy: $('.fc-agenda-allday').outerHeight() + $('.fc-agenda-divider').outerHeight(),
								interpolation: {
									stepCount: 10,
									duration: 100
								}
							});
						called = true;
					}
				};
				options.eventDrop = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
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
				};
				setTimeout(function() { // hack. scroll state was messed up or something
					$('#cal').fullCalendar(options);
				},0);
			});
		});

		describe('when dragging a timed event to an all-day slot on a different day', function() {
			it('should be given correct arguments, with whole-day delta', function(done) {
				options.scrollTime = '01:00:00';
				options.events = [ {
					title: 'timed event',
					start: '2014-06-11T01:00:00',
					allDay: false
				} ];
				var called = false;
				var eventElm;
				options.eventAfterAllRender = function() {
					if (!called) { // because event rerendering will happen upon drop
						eventElm = $('.fc-event')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag', {
								dx: $('th.fc-wed').width() * -1,
								dy: -$('.fc-agenda-allday').outerHeight(),
								interpolation: {
									stepCount: 10,
									duration: 100
								},
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
						called = true;
					}
				};
				options.eventDrop = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
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
				};
				setTimeout(function() { // hack. scroll state was messed up or something
					$('#cal').fullCalendar(options);
				},0);
			});
		});
	});
});