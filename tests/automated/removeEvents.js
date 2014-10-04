describe('removeEvents', function() {

	var options;
	var eventArray = [
		{ id: 0, title: 'event zero', start: '2014-06-24', className: 'event-zero' },
		{ id: 1, title: 'event one', start: '2014-06-24', className: 'event-non-zero event-one' },
		{ id: 2, title: 'event two', start: '2014-06-24', className: 'event-non-zero event-two' }
	];
	var eventFunc = function(start, end, timezone, callback) {
		callback(eventArray);
	};

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-06-24',
			defaultView: 'month'
		};
	});

	$.each({
		'with an array of events': eventArray,
		'with an event function': eventFunc
	}, function(description, events) {

		describe(description, function() {

			it('can remove all events if no args specified', function(done) {
				go(
					events,
					function() {
						$('#cal').fullCalendar('removeEvents');
					},
					function() {
						expect($('#cal').fullCalendar('clientEvents').length).toEqual(0);
						expect($('.fc-event').length).toEqual(0);
					},
					done
				);
			});

			it('can remove events with a numeric ID', function(done) {
				go(
					events,
					function() {
						$('#cal').fullCalendar('removeEvents', 1);
					},
					function() {
						expect($('#cal').fullCalendar('clientEvents').length).toEqual(2);
						expect($('.fc-event').length).toEqual(2);
						expect($('.event-zero').length).toEqual(1);
						expect($('.event-two').length).toEqual(1);
					},
					done
				);
			});

			it('can remove events with a string ID', function(done) {
				go(
					events,
					function() {
						$('#cal').fullCalendar('removeEvents', '1');
					},
					function() {
						expect($('#cal').fullCalendar('clientEvents').length).toEqual(2);
						expect($('.fc-event').length).toEqual(2);
						expect($('.event-zero').length).toEqual(1);
						expect($('.event-two').length).toEqual(1);
					},
					done
				);
			});

			it('can remove events with a filter function', function(done) {
				go(
					events,
					function() {
						$('#cal').fullCalendar('removeEvents', function(event) {
							return $.inArray('event-one', event.className) !== -1;
						});
					},
					function() {
						expect($('#cal').fullCalendar('clientEvents').length).toEqual(2);
						expect($('.fc-event').length).toEqual(2);
						expect($('.event-zero').length).toEqual(1);
						expect($('.event-two').length).toEqual(1);
					},
					done
				);
			});

			it('can remove an event with ID 0', function(done) { // for issue 2082
				go(
					events,
					function() {
						$('#cal').fullCalendar('removeEvents', 0);
					},
					function() {
						expect($('#cal').fullCalendar('clientEvents').length).toEqual(2);
						expect($('.fc-event').length).toEqual(2);
						expect($('.event-zero').length).toEqual(0);
						expect($('.event-non-zero').length).toEqual(2);
					},
					done
				);
			});
		});
	});


	// Verifies the actions in removeFunc executed correctly by calling checkFunc.
	function go(events, removeFunc, checkFunc, doneFunc) {
		var called = false;
		options.events = events;
		options.eventAfterAllRender = function() {
			if (!called) { // don't execute on subsequent removeEvents/next/prev
				called = true;

				checkAllEvents(); // make sure all events initially rendered correctly
				removeFunc(); // remove the events
				checkFunc(); // check correctness

				// move the calendar back out of view, then back in
				$('#cal').fullCalendar('next');
				$('#cal').fullCalendar('prev');

				// array event sources should maintain the same state
				// whereas "dynamic" event sources should refetch and reset the state
				if ($.isArray(events)) {
					checkFunc(); // for issue 2187
				}
				else {
					checkAllEvents();
				}

				doneFunc();
			}
		};
		$('#cal').fullCalendar(options);
	}


	// Checks to make sure all events have been rendered and that the calendar
	// has internal info on all the events.
	function checkAllEvents() {
		expect($('#cal').fullCalendar('clientEvents').length).toEqual(3);
		expect($('.fc-event').length).toEqual(3);
	}

});