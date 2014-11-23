
describe('timezone', function() {

	// NOTE: Only deals with the processing of *received* events.
	// Verification of a correct AJAX *request* is done in events-json-feed.js

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultView: 'month',
			defaultDate: '2014-05-01',
			events: [
				{
					id: '1',
					title: 'all day event',
					start: '2014-05-02'
				},
				{
					id: '2',
					title: 'timed event',
					start: '2014-05-10T12:00:00'
				},
				{
					id: '3',
					title: 'timed and zoned event',
					start: '2014-05-10T14:00:00+11:00'
				}
			]
		};
	});

	it('receives events correctly when no timezone', function(done) {
		options.eventAfterAllRender = function() {
			var allDayEvent = $('#cal').fullCalendar('clientEvents', '1')[0];
			var timedEvent = $('#cal').fullCalendar('clientEvents', '2')[0];
			var zonedEvent = $('#cal').fullCalendar('clientEvents', '3')[0];
			expect(allDayEvent.start.hasZone()).toEqual(false);
			expect(allDayEvent.start.hasTime()).toEqual(false);
			expect(allDayEvent.start.format()).toEqual('2014-05-02');
			expect(timedEvent.start.hasZone()).toEqual(false);
			expect(timedEvent.start.hasTime()).toEqual(true);
			expect(timedEvent.start.format()).toEqual('2014-05-10T12:00:00');
			expect(zonedEvent.start.hasZone()).toEqual(true);
			expect(zonedEvent.start.hasTime()).toEqual(true);
			expect(zonedEvent.start.format()).toEqual('2014-05-10T14:00:00+11:00');
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('receives events correctly when local timezone', function(done) {
		options.timezone = 'local';
		options.eventAfterAllRender = function() {
			var allDayEvent = $('#cal').fullCalendar('clientEvents', '1')[0];
			var timedEvent = $('#cal').fullCalendar('clientEvents', '2')[0];
			var zonedEvent = $('#cal').fullCalendar('clientEvents', '3')[0];
			expect(allDayEvent.start.hasZone()).toEqual(false);
			expect(allDayEvent.start.hasTime()).toEqual(false);
			expect(allDayEvent.start.format()).toEqual('2014-05-02');
			expect(timedEvent.start.hasZone()).toEqual(true);
			expect(timedEvent.start.hasTime()).toEqual(true);
			expect(timedEvent.start.zone()).toEqual(new Date(2014, 4, 10, 12).getTimezoneOffset());
			expect(zonedEvent.start.hasZone()).toEqual(true);
			expect(zonedEvent.start.hasTime()).toEqual(true);
			expect(zonedEvent.start.zone()).toEqual(new Date('Sat May 10 2014 14:00:00 GMT+1100').getTimezoneOffset());
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('receives events correctly when UTC timezone', function(done) {
		options.timezone = 'UTC';
		options.eventAfterAllRender = function() {
			var allDayEvent = $('#cal').fullCalendar('clientEvents', '1')[0];
			var timedEvent = $('#cal').fullCalendar('clientEvents', '2')[0];
			var zonedEvent = $('#cal').fullCalendar('clientEvents', '3')[0];
			expect(allDayEvent.start.hasZone()).toEqual(false);
			expect(allDayEvent.start.hasTime()).toEqual(false);
			expect(allDayEvent.start.format()).toEqual('2014-05-02');
			expect(timedEvent.start.hasZone()).toEqual(true);
			expect(timedEvent.start.hasTime()).toEqual(true);
			expect(timedEvent.start.format()).toEqual('2014-05-10T12:00:00+00:00');
			expect(zonedEvent.start.hasZone()).toEqual(true);
			expect(zonedEvent.start.hasTime()).toEqual(true);
			expect(zonedEvent.start.format()).toEqual('2014-05-10T03:00:00+00:00');
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('receives events correctly when custom timezone', function(done) {
		options.timezone = 'America/Chicago';
		options.eventAfterAllRender = function() {
			var allDayEvent = $('#cal').fullCalendar('clientEvents', '1')[0];
			var timedEvent = $('#cal').fullCalendar('clientEvents', '2')[0];
			var zonedEvent = $('#cal').fullCalendar('clientEvents', '3')[0];
			expect(allDayEvent.start.hasZone()).toEqual(false);
			expect(allDayEvent.start.hasTime()).toEqual(false);
			expect(allDayEvent.start.format()).toEqual('2014-05-02');
			expect(timedEvent.start.hasZone()).toEqual(false);
			expect(timedEvent.start.hasTime()).toEqual(true);
			expect(timedEvent.start.format()).toEqual('2014-05-10T12:00:00');
			expect(zonedEvent.start.hasZone()).toEqual(true);
			expect(zonedEvent.start.hasTime()).toEqual(true);
			expect(zonedEvent.start.format()).toEqual('2014-05-10T14:00:00+11:00');
			done();
		};
		$('#cal').fullCalendar(options);
	});

});
