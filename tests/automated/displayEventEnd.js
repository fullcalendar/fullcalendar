describe('displayEventEnd', function() {

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-06-13',
			timeFormat: 'H:mm'
		};
	});

	afterEach(function() {
		$('#cal').fullCalendar('destroy');
	});

	[ 'month', 'agendaWeek' ].forEach(function(viewName) {
		describe('when in ' + viewName + ' view', function() {
			beforeEach(function() {
				options.defaultView = viewName;
			});

			describe('when off', function() {
				beforeEach(function() {
					options.displayEventEnd = false;
				});

				describe('with an all-day event', function() {
					beforeEach(function() {
						options.events = [ {
							title: 'timed event',
							start: '2014-06-13',
							end: '2014-06-13',
							allDay: true
						} ];
					});
					it('displays no time text', function(done) {
						options.eventAfterAllRender = function() {
							expect($('.fc-event .fc-time').length).toBe(0);
							done();
						};
						$('#cal').fullCalendar(options);
					});
				});

				describe('with a timed event with no end time', function(done) {
					beforeEach(function() {
						options.events = [ {
							title: 'timed event',
							start: '2014-06-13T01:00:00',
							allDay: false
						} ];
					});
					it('displays only the start time text', function(done) {
						options.eventAfterAllRender = function() {
							expect($('.fc-event .fc-time')).toHaveText('1:00');
							done();
						};
						$('#cal').fullCalendar(options);
					});
				});

				describe('with a timed event with an end time', function() {
					beforeEach(function() {
						options.events = [ {
							title: 'timed event',
							start: '2014-06-13T01:00:00',
							end: '2014-06-13T02:00:00',
							allDay: false
						} ];
					});
					it('displays only the start time text', function(done) {
						options.eventAfterAllRender = function() {
							expect($('.fc-event .fc-time')).toHaveText('1:00');
							done();
						};
						$('#cal').fullCalendar(options);
					});
				});
			});

			describe('when on', function() {
				beforeEach(function() {
					options.displayEventEnd = true;
				});

				describe('with an all-day event', function() {
					beforeEach(function() {
						options.events = [ {
							title: 'timed event',
							start: '2014-06-13',
							end: '2014-06-13',
							allDay: true
						} ];
					});
					it('displays no time text', function(done) {
						options.eventAfterAllRender = function() {
							expect($('.fc-event .fc-time').length).toBe(0);
							done();
						};
						$('#cal').fullCalendar(options);
					});
				});

				describe('with a timed event with no end time', function(done) {
					beforeEach(function() {
						options.events = [ {
							title: 'timed event',
							start: '2014-06-13T01:00:00',
							allDay: false
						} ];
					});
					it('displays only the start time text', function(done) {
						options.eventAfterAllRender = function() {
							expect($('.fc-event .fc-time')).toHaveText('1:00');
							done();
						};
						$('#cal').fullCalendar(options);
					});
				});

				describe('with a timed event given an invalid end time', function(done) {
					beforeEach(function() {
						options.events = [ {
							title: 'timed event',
							start: '2014-06-13T01:00:00',
							end: '2014-06-13T01:00:00',
							allDay: false
						} ];
					});
					it('displays only the start time text', function(done) {
						options.eventAfterAllRender = function() {
							expect($('.fc-event .fc-time')).toHaveText('1:00');
							done();
						};
						$('#cal').fullCalendar(options);
					});
				});

				describe('with a timed event with an end time', function() {
					beforeEach(function() {
						options.events = [ {
							title: 'timed event',
							start: '2014-06-13T01:00:00',
							end: '2014-06-13T02:00:00',
							allDay: false
						} ];
					});
					it('displays both the start and end time text', function(done) {
						options.eventAfterAllRender = function() {
							expect($('.fc-event .fc-time')).toHaveText('1:00 - 2:00');
							done();
						};
						$('#cal').fullCalendar(options);
					});
				});
			});
		});
	});
});