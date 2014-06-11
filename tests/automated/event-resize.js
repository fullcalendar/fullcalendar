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

		describe('when resizing an all-day event', function() {
			it('should have correct arguments with a whole-day delta', function(done) {
				options.events = [ {
					title: 'all-day event',
					start: '2014-06-11',
					allDay: true
				} ];
				var called = false;
				options.eventAfterAllRender = function() {
					if (!called) { // because event rerendering will happen when resize is over
						$('.fc-event .ui-resizable-handle')
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
				options.eventResize = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
					expect(typeof event).toBe('object'); // TODO: discriminate more
					expect(moment.isDuration(delta)).toBe(true);
					expect(typeof revertFunc).toBe('function');
					expect(typeof jsEvent).toBe('object'); // TODO: discriminate more
					expect(typeof view).toBe('object'); // "
					////expect(typeof uiEvent).toBe('object'); // we actually don't even leverage jqui here

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
				};
				$('#cal').fullCalendar(options);
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
				var called = false;
				options.eventAfterAllRender = function() {
					if (!called) { // because event rerendering will happen when resize is over
						$('.fc-event .ui-resizable-handle')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag-n-drop', {
								dx: $('th.fc-wed').width() * 1.5, // two days
								interpolation: {
									stepCount: 10,
									duration: 100
								}
							});
						called = true;
					}
				};
				options.eventResize = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
					expect(typeof event).toBe('object'); // TODO: discriminate more
					expect(moment.isDuration(delta)).toBe(true);
					expect(typeof revertFunc).toBe('function');
					expect(typeof jsEvent).toBe('object'); // TODO: discriminate more
					expect(typeof view).toBe('object'); // "
					////expect(typeof uiEvent).toBe('object'); // we actually don't even leverage jqui here

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
				};
				setTimeout(function() { // idk
					$('#cal').fullCalendar(options);
				}, 0);
			});
		});

		describe('when resizing a timed event', function() {
			it('should have correct arguments with a timed delta', function(done) {
				options.events = [ {
					title: 'timed event event',
					start: '2014-06-11T05:00:00',
					end: '2014-06-11T07:00:00',
					allDay: false
				} ];
				var called = false;
				options.eventAfterAllRender = function() {
					if (!called) { // because event rerendering will happen when resize is over
						$('.fc-event .ui-resizable-handle')
							.simulate('mouseover') // for our dumb optimization
							.simulate('drag-n-drop', {
								dy: $('tr.fc-slot1').height() * 4.5, // 5 slots, so 2.5 hours
								interpolation: {
									stepCount: 10,
									duration: 100
								}
							});
						called = true;
					}
				};
				options.eventResize = function(event, delta, revertFunc, jsEvent, uiEvent, view) {
					expect(typeof event).toBe('object'); // TODO: discriminate more
					expect(moment.isDuration(delta)).toBe(true);
					expect(typeof revertFunc).toBe('function');
					expect(typeof jsEvent).toBe('object'); // TODO: discriminate more
					expect(typeof uiEvent).toBe('object'); // "
					expect(typeof view).toBe('object'); // "

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
				};
				setTimeout(function() { // idk
					$('#cal').fullCalendar(options);
				}, 0);
			});
		});
	});
});