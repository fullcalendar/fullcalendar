describe('addEventSource', function() {

	var options;
	var eventArray = [
		{ id: 0, title: 'event zero', start: '2014-06-24', className: 'event-zero' },
		{ id: 1, title: 'event one', start: '2014-06-24', className: 'event-non-zero event-one' },
		{ id: 2, title: 'event two', start: '2014-06-24', className: 'event-non-zero event-two' }
	];

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-06-24',
			defaultView: 'month'
		};
	});

	it('correctly adds an array source', function(done) {
		go(
			function() {
				$('#cal').fullCalendar('addEventSource', eventArray);
			},
			null,
			done
		);
	});

	it('correctly adds a function source', function(done) {
		go(
			function() {
				$('#cal').fullCalendar('addEventSource', function(start, end, timezone, callback) {
					callback(eventArray);
				});
			},
			null,
			done
		);
	});

	it('correctly adds an extended array source', function(done) {
		go(
			function() {
				$('#cal').fullCalendar('addEventSource', {
					className: 'arraysource',
					events: eventArray
				});
			},
			function() {
				expect($('.arraysource').length).toEqual(3);
			},
			done
		);
	});

	it('correctly adds an extended array source', function(done) {
		go(
			function() {
				$('#cal').fullCalendar('addEventSource', {
					className: 'funcsource',
					events: function(start, end, timezone, callback) {
						callback(eventArray);
					}
				});
			},
			function() {
				expect($('.funcsource').length).toEqual(3);
			},
			done
		);
	});


	function go(addFunc, extraTestFunc, doneFunc) {
		var callCnt = 0;
		options.eventAfterAllRender = function() {
			callCnt++;
			if (callCnt == 2) { // once for initial render. second time for addEventSource
				called = true;

				checkAllEvents();
				if (extraTestFunc) {
					extraTestFunc();
				}

				// move the calendar back out of view, then back in (for issue 2191)
				$('#cal').fullCalendar('next');
				$('#cal').fullCalendar('prev');

				checkAllEvents();
				if (extraTestFunc) {
					extraTestFunc();
				}

				doneFunc();
			}
		};
		$('#cal').fullCalendar(options);
		addFunc();
	}

	// Checks to make sure all events have been rendered and that the calendar
	// has internal info on all the events.
	function checkAllEvents() {
		expect($('#cal').fullCalendar('clientEvents').length).toEqual(3);
		expect($('.fc-event').length).toEqual(3);
	}

});