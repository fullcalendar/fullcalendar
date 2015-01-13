
describe('updateEvent', function() {

	var options;
	var event;
	var relatedEvent;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-05-01',
			defaultView: 'month'
		};
		event = null;
		relatedEvent = null;
	});

	function init() {
		$('#cal').fullCalendar(options);
		var events = $('#cal').fullCalendar('clientEvents');
		event = events[0];
		relatedEvent = events[1];
	}

	describe('when moving an all-day event\'s start', function() {
		describe('when a related event doesn\'t have an end', function() {
			it('should move the start by the delta and leave the end as null', function() {
				options.events = [
					{ id: '1', start: '2014-05-01', allDay: true },
					{ id: '1', start: '2014-05-10', allDay: true }
				];
				init();
				event.start.add(2, 'days');
				$('#cal').fullCalendar('updateEvent', event);
				expect(event.start).toEqualMoment('2014-05-03');
				expect(event.end).toBeNull();
				expect(relatedEvent.start).toEqualMoment('2014-05-12');
				expect(relatedEvent.end).toBeNull();
			});
		});
		describe('when a related event has an end', function() {
			it('should move the start and end by the delta', function() {
				options.events = [
					{ id: '1', start: '2014-05-01', allDay: true },
					{ id: '1', start: '2014-05-10', end: '2014-05-12', allDay: true }
				];
				init();
				event.start.add(2, 'days');
				expect(event.start).toEqualMoment('2014-05-03');
				expect(event.end).toBeNull();
				$('#cal').fullCalendar('updateEvent', event);
				expect(relatedEvent.start).toEqualMoment('2014-05-12');
				expect(relatedEvent.end).toEqualMoment('2014-05-14');
			});
		});
	});

	describe('when moving an timed event\'s start', function() {
		describe('when a related event doesn\'t have an end', function() {
			it('should move the start by the delta and leave the end as null', function() {
				options.events = [
					{ id: '1', start: '2014-05-01T12:00:00', allDay: false },
					{ id: '1', start: '2014-05-10T06:00:00', allDay: false }
				];
				init();
				event.start.add({ days: 2, hours: 2 });
				$('#cal').fullCalendar('updateEvent', event);
				expect(event.start).toEqualMoment('2014-05-03T14:00:00');
				expect(event.end).toBeNull();
				expect(relatedEvent.start).toEqualMoment('2014-05-12T08:00:00');
				expect(relatedEvent.end).toBeNull();
			});
		});
		describe('when a related event has an end', function() {
			it('should move the start and end by the delta', function() {
				options.events = [
					{ id: '1', start: '2014-05-01T12:00:00', allDay: false },
					{ id: '1', start: '2014-05-10T06:00:00', end: '2014-05-12T08:00:00', allDay: false }
				];
				init();
				event.start.add({ days: 2, hours: 2 });
				$('#cal').fullCalendar('updateEvent', event);
				expect(event.start).toEqualMoment('2014-05-03T14:00:00');
				expect(event.end).toBeNull();
				expect(relatedEvent.start).toEqualMoment('2014-05-12T08:00:00');
				expect(relatedEvent.end).toEqualMoment('2014-05-14T10:00:00');
			});
		});
	});

	describe('when moving an all-day event\'s end', function() {
		describe('when a related event doesn\'t have an end', function() {
			it('should give the end a default duration plus the delta', function() {
				options.defaultAllDayEventDuration = { days: 2 };
				options.events = [
					{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true },
					{ id: '1', start: '2014-05-10', allDay: true }
				];
				init();
				event.end.add(1, 'days');
				$('#cal').fullCalendar('updateEvent', event);
				expect(event.start).toEqualMoment('2014-05-01');
				expect(event.end).toEqualMoment('2014-05-04');
				expect(relatedEvent.start).toEqualMoment('2014-05-10');
				expect(relatedEvent.end).toEqualMoment('2014-05-13');
			});
		});
		describe('when a related event has an end', function() {
			it('should move the end by the delta', function() {
				options.events = [
					{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true },
					{ id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true }
				];
				init();
				event.end.add(1, 'days');
				$('#cal').fullCalendar('updateEvent', event);
				expect(event.start).toEqualMoment('2014-05-01');
				expect(event.end).toEqualMoment('2014-05-04');
				expect(relatedEvent.start).toEqualMoment('2014-05-10');
				expect(relatedEvent.end).toEqualMoment('2014-05-14');
			});
		});
	});

	describe('when moving a timed event\'s end', function() {
		describe('when a related event doesn\'t have an end', function() {
			describe('when forceEventDuration is off', function() {
				it('should give the end a default duration plus the delta', function() {
					options.forceEventDuration = false;
					options.defaultTimedEventDuration = { hours: 2 };
					options.events = [
						{ id: '1', start: '2014-05-01T12:00:00', end: '2014-05-01T15:00:00', allDay: false },
						{ id: '1', start: '2014-05-10T16:00:00', allDay: false }
					];
					init();
					event.end.add({ days: 1, hours: 1 });
					$('#cal').fullCalendar('updateEvent', event);
					expect(event.start).toEqualMoment('2014-05-01T12:00:00');
					expect(event.end).toEqualMoment('2014-05-02T16:00:00');
					expect(relatedEvent.start).toEqualMoment('2014-05-10T16:00:00');
					expect(relatedEvent.end).toEqualMoment('2014-05-11T19:00:00');
				});
			});
			describe('when forceEventDuration is on', function() {
				it('should give the end a default duration plus the delta', function() {
					options.forceEventDuration = true;
					options.defaultTimedEventDuration = { hours: 2 };
					options.events = [
						{ id: '1', start: '2014-05-01T12:00:00', end: '2014-05-01T15:00:00', allDay: false },
						{ id: '1', start: '2014-05-10T16:00:00', allDay: false }
					];
					init();
					event.end.add({ days: 1, hours: 1 });
					relatedEvent.end = null;
					$('#cal').fullCalendar('updateEvent', event);
					expect(event.start).toEqualMoment('2014-05-01T12:00:00');
					expect(event.end).toEqualMoment('2014-05-02T16:00:00');
					expect(relatedEvent.start).toEqualMoment('2014-05-10T16:00:00');
					expect(relatedEvent.end).toEqualMoment('2014-05-11T19:00:00');
				});
			});
		});
		describe('when a related event has an end', function() {
			it('should move the end by the delta', function() {
				options.events = [
					{ id: '1', start: '2014-05-01T12:00:00', end: '2014-05-01T14:00:00', allDay: false },
					{ id: '1', start: '2014-05-10T16:00:00', end: '2014-05-10T19:00:00', allDay: false }
				];
				init();
				event.end.add({ days: 1, hours: 1 });
				$('#cal').fullCalendar('updateEvent', event);
				expect(event.start).toEqualMoment('2014-05-01T12:00:00');
				expect(event.end).toEqualMoment('2014-05-02T15:00:00');
				expect(relatedEvent.start).toEqualMoment('2014-05-10T16:00:00');
				expect(relatedEvent.end).toEqualMoment('2014-05-11T20:00:00');
			});
		});
	});

	describe('when moving an all-day event\'s start and end', function() {
		it('should move the start and end of related events', function() {
			options.events = [
				{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true },
				{ id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true }
			];
			init();
			event.start.add(2, 'days');
			event.end.add(3, 'day');
			$('#cal').fullCalendar('updateEvent', event);
			expect(event.start).toEqualMoment('2014-05-03');
			expect(event.end).toEqualMoment('2014-05-06');
			expect(relatedEvent.start).toEqualMoment('2014-05-12');
			expect(relatedEvent.end).toEqualMoment('2014-05-16');
		});
	});

	describe('when moving a timed event\'s start and end', function() {
		it('should move the start and end of related events', function() {
			options.events = [
				{ id: '1', start: '2014-05-01T06:00:00', end: '2014-05-03T06:00:00', allDay: false },
				{ id: '1', start: '2014-05-10T06:00:00', end: '2014-05-13T06:00:00', allDay: false }
			];
			init();
			event.start.add({ days: 2, hours: 1 });
			event.end.add({ days: 3, hours: 2 });
			$('#cal').fullCalendar('updateEvent', event);
			expect(event.start).toEqualMoment('2014-05-03T07:00:00');
			expect(event.end).toEqualMoment('2014-05-06T08:00:00');
			expect(relatedEvent.start).toEqualMoment('2014-05-12T07:00:00');
			expect(relatedEvent.end).toEqualMoment('2014-05-16T08:00:00');
		});
	});

	describe('when giving a time to an all-day event\'s start', function() {
		it('should erase the start\'s time and keep the event all-day', function() {
			options.events = [
				{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true },
				{ id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true }
			];
			init();
			event.start.time('18:00');
			$('#cal').fullCalendar('updateEvent', event);
			expect(event.allDay).toEqual(true);
			expect(event.start).toEqualMoment('2014-05-01');
			expect(event.end).toEqualMoment('2014-05-03');
			expect(relatedEvent.allDay).toEqual(true);
			expect(relatedEvent.start).toEqualMoment('2014-05-10');
			expect(relatedEvent.end).toEqualMoment('2014-05-13');
		});
	});

	// issue 2194
	describe('when accidentally giving a time to an all-day event with moment()', function() {
		it('should erase the start and end\'s times and keep the event all-day', function() {
			options.events = [
				{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true }
			];
			init();
			event.start = moment('2014-05-01'); // won't have an ambig time
			event.end = moment('2014-05-03'); // "
			$('#cal').fullCalendar('updateEvent', event);
			expect(event.allDay).toEqual(true);
			expect(event.start).toEqualMoment('2014-05-01');
			expect(event.end).toEqualMoment('2014-05-03');
		});
	});

	describe('when changing an event from all-day to timed', function() {
		describe('when the event\'s dates remain all-day', function() {
			it('should make the event and related events allDay=false and 00:00', function() {
				options.events = [
					{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true },
					{ id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true }
				];
				init();
				event.allDay = false;
				$('#cal').fullCalendar('updateEvent', event);
				expect(event.allDay).toEqual(false);
				expect(event.start).toEqualMoment('2014-05-01T00:00:00');
				expect(event.end).toEqualMoment('2014-05-03T00:00:00');
				expect(relatedEvent.allDay).toEqual(false);
				expect(relatedEvent.start).toEqualMoment('2014-05-10T00:00:00');
				expect(relatedEvent.end).toEqualMoment('2014-05-13T00:00:00');
			});
		});
		describe('when the event\'s dates are set to a time', function() {
			it('should adjust the event and related event\'s allDay/start/end', function() {
				options.events = [
					{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true },
					{ id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true }
				];
				init();
				event.allDay = false;
				event.start.time('14:00');
				$('#cal').fullCalendar('updateEvent', event);
				expect(event.allDay).toEqual(false);
				expect(event.start).toEqualMoment('2014-05-01T14:00:00');
				expect(event.end).toEqualMoment('2014-05-03T00:00:00');
				expect(relatedEvent.allDay).toEqual(false);
				expect(relatedEvent.start).toEqualMoment('2014-05-10T14:00:00');
				expect(relatedEvent.end).toEqualMoment('2014-05-13T00:00:00');
			});
		});
		describe('when the event\'s start is also moved', function() {
			it('should adjust the event and related event\'s allDay/start/end', function() {
				options.events = [
					{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true },
					{ id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true }
				];
				init();
				event.allDay = false;
				event.start.add(1, 'days');
				$('#cal').fullCalendar('updateEvent', event);
				expect(event.allDay).toEqual(false);
				expect(event.start).toEqualMoment('2014-05-02T00:00:00');
				expect(event.end).toEqualMoment('2014-05-03T00:00:00');
				expect(relatedEvent.allDay).toEqual(false);
				expect(relatedEvent.start).toEqualMoment('2014-05-11T00:00:00');
				expect(relatedEvent.end).toEqualMoment('2014-05-13T00:00:00');
			});
		});
	});

	describe('when changing an event from timed to all-day', function() {
		it('should adjust the event and related event\'s allDay/start/end', function() {
			options.events = [
				{ id: '1', start: '2014-05-01T06:00:00', end: '2014-05-03T06:00:00', allDay: false },
				{ id: '1', start: '2014-05-10T06:00:00', end: '2014-05-13T06:00:00', allDay: false }
			];
			init();
			event.allDay = true;
			$('#cal').fullCalendar('updateEvent', event);
			expect(event.allDay).toEqual(true);
			expect(event.start).toEqualMoment('2014-05-01');
			expect(event.end).toEqualMoment('2014-05-03');
			expect(relatedEvent.allDay).toEqual(true);
			expect(relatedEvent.start).toEqualMoment('2014-05-10');
			expect(relatedEvent.end).toEqualMoment('2014-05-13');
		});
		it('should adjust the event and related event\'s allDay/start/end and account for a new start', function() {
			options.events = [
				{ id: '1', start: '2014-05-01T06:00:00', end: '2014-05-03T06:00:00', allDay: false },
				{ id: '1', start: '2014-05-10T06:00:00', end: '2014-05-13T06:00:00', allDay: false }
			];
			init();
			event.allDay = true;
			event.start.add(1, 'days');
			$('#cal').fullCalendar('updateEvent', event);
			expect(event.allDay).toEqual(true);
			expect(event.start).toEqualMoment('2014-05-02');
			expect(event.end).toEqualMoment('2014-05-03');
			expect(relatedEvent.allDay).toEqual(true);
			expect(relatedEvent.start).toEqualMoment('2014-05-11');
			expect(relatedEvent.end).toEqualMoment('2014-05-13');
		});
	});

	it('should accept moments that have unnormalized start/end', function() {
		options.events = [
			{ id: '1', start: '2014-05-01T06:00:00', end: '2014-05-03T06:00:00', allDay: false },
			{ id: '1', start: '2014-05-10T06:00:00', end: '2014-05-13T06:00:00', allDay: false }
		];
		init();
		event.start = '2014-05-02T06:00:00'; // move by 1 day
		event.end = '2014-05-05T06:00:00'; // increase duration by 1 day
		$('#cal').fullCalendar('updateEvent', event);
		expect(event.allDay).toEqual(false);
		expect(moment.isMoment(event.start)).toEqual(true);
		expect(event.start).toEqualMoment('2014-05-02T06:00:00');
		expect(moment.isMoment(event.end)).toEqual(true);
		expect(event.end).toEqualMoment('2014-05-05T06:00:00');
		expect(relatedEvent.allDay).toEqual(false);
		expect(moment.isMoment(relatedEvent.start)).toEqual(true);
		expect(relatedEvent.start).toEqualMoment('2014-05-11T06:00:00');
		expect(moment.isMoment(relatedEvent.end)).toEqual(true);
		expect(relatedEvent.end).toEqualMoment('2014-05-15T06:00:00');
	});

	it('should copy color-related properties to related events', function() {
		options.events = [
			{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true },
			{ id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true }
		];
		init();
		event.color = 'red';
		$('#cal').fullCalendar('updateEvent', event);
		expect(relatedEvent.color).toBe('red');
	});

	it('should non-standard properties to related events', function() {
		options.events = [
			{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true },
			{ id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true }
		];
		init();
		event.someForeignKey = '123';
		event.myObj = {};
		$('#cal').fullCalendar('updateEvent', event);
		expect(relatedEvent.someForeignKey).toBe('123');
		expect(relatedEvent.myObj).toBeUndefined();
	});

	function whenMovingStart(should) {
		describe('when moving an timed event\'s start', function() {
			beforeEach(function() {
				options.events = [
					{ id: '1', start: '2014-05-01T06:00:00+05:00', end: '2014-05-03T06:00:00+05:00', allDay: false },
					{ id: '1', start: '2014-05-11T06:00:00+05:00', end: '2014-05-13T06:00:00+05:00', allDay: false }
				];
				init();
				event.start.add(2, 'hours');
				$('#cal').fullCalendar('updateEvent', event);
			});
			should();
		});
	}

	function whenMovingEnd(should) {
		describe('when moving a timed event\'s end', function() {
			beforeEach(function() {
				options.events = [
					{ id: '1', start: '2014-05-01T06:00:00+05:00', end: '2014-05-03T06:00:00+05:00', allDay: false },
					{ id: '1', start: '2014-05-11T06:00:00+05:00', end: '2014-05-13T06:00:00+05:00', allDay: false }
				];
				init();
				event.end.add(2, 'hours');
				$('#cal').fullCalendar('updateEvent', event);
			});
			should();
		});
	}

	function whenMovingToTimed(should) {
		describe('when moving an all-day event to timed', function() {
			beforeEach(function() {
				options.events = [
					{ id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true },
					{ id: '1', start: '2014-05-11', end: '2014-05-13', allDay: true }
				];
				init();
				event.allDay = false;
				$('#cal').fullCalendar('updateEvent', event);
			});
			should();
		});
	}

	function whenReportingUnchanged(should) { // not used right now
		describe('when reporting an event that hasn\'t changed', function() {
			beforeEach(function() {
				options.events = [
					{ id: '1', start: '2014-05-01T06:00:00+05:00', end: '2014-05-03T06:00:00+05:00', allDay: false },
					{ id: '1', start: '2014-05-11T06:00:00+05:00', end: '2014-05-13T06:00:00+05:00', allDay: false }
				];
				init();
				$('#cal').fullCalendar('updateEvent', event);
			});
			should();
		});
	}

	function shouldBeAmbiguouslyZoned() {
		it('should make the events ambiguously zoned', function() {
			expect(event.start.hasZone()).toEqual(false);
			if (event.end) {
				expect(event.end.hasZone()).toEqual(false);
			}
			expect(relatedEvent.start.hasZone()).toEqual(false);
			if (relatedEvent.end) {
				expect(relatedEvent.end.hasZone()).toEqual(false);
			}
		});
	}

	function shouldBeLocal() {
		it('should make the events local', function() {
			expect(event.start.hasZone()).toEqual(true);
			expect(event.start._isUTC).toEqual(false);
			if (event.end) {
				expect(event.end.hasZone()).toEqual(true);
				expect(event.end._isUTC).toEqual(false);
			}
			expect(relatedEvent.start.hasZone()).toEqual(true);
			expect(relatedEvent.start._isUTC).toEqual(false);
			if (relatedEvent.end) {
				expect(relatedEvent.end.hasZone()).toEqual(true);
				expect(relatedEvent.end._isUTC).toEqual(false);
			}
		});
	}

	function shouldBeUTC() {
		it('should make the events UTC', function() {
			expect(event.start.hasZone()).toEqual(true);
			expect(event.start._isUTC).toEqual(true);
			if (event.end) {
				expect(event.end.hasZone()).toEqual(true);
				expect(event.end._isUTC).toEqual(true);
			}
			expect(event.start.hasZone()).toEqual(true);
			expect(event.start._isUTC).toEqual(true);
			if (relatedEvent.end) {
				expect(relatedEvent.end.hasZone()).toEqual(true);
				expect(relatedEvent.end._isUTC).toEqual(true);
			}
		});
	}

	describe('when calendar has no timezone', function() {
		beforeEach(function() {
			options.timezone = false;
		});
		whenMovingStart(shouldBeAmbiguouslyZoned);
		whenMovingEnd(shouldBeAmbiguouslyZoned);
		whenMovingToTimed(shouldBeAmbiguouslyZoned);
	});

	describe('when calendar has a local timezone', function() {
		beforeEach(function() {
			options.timezone = 'local';
		});
		whenMovingStart(shouldBeLocal);
		whenMovingEnd(shouldBeLocal);
		whenMovingToTimed(shouldBeLocal);
	});

	describe('when calendar has a UTC timezone', function() {
		beforeEach(function() {
			options.timezone = 'UTC';
		});
		whenMovingStart(shouldBeUTC);
		whenMovingEnd(shouldBeUTC);
		whenMovingToTimed(shouldBeUTC);
	});

	describe('when calendar has a custom timezone', function() {
		beforeEach(function() {
			options.timezone = 'America/Chicago';
		});
		whenMovingStart(shouldBeAmbiguouslyZoned);
		whenMovingEnd(shouldBeAmbiguouslyZoned);
		whenMovingToTimed(shouldBeAmbiguouslyZoned);
	});

});