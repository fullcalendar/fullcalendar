
describe('events as a function', function() {

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultView: 'month',
			defaultDate: '2014-05-01'
		};
	});

	it('requests correctly when no timezone', function(done) {
		options.events = function(start, end, timezone, callback) {
			expect(moment.isMoment(start)).toEqual(true);
			expect(start.hasTime()).toEqual(false);
			expect(start.hasZone()).toEqual(false);
			expect(start.format()).toEqual('2014-04-27');
			expect(moment.isMoment(end)).toEqual(true);
			expect(end.hasTime()).toEqual(false);
			expect(end.hasZone()).toEqual(false);
			expect(end.format()).toEqual('2014-06-08');
			expect(timezone).toEqual(false);
			expect(typeof callback).toEqual('function');
			callback([]);
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('requests correctly when local timezone', function(done) {
		options.timezone = 'local';
		options.events = function(start, end, timezone, callback) {
			expect(moment.isMoment(start)).toEqual(true);
			expect(start.hasTime()).toEqual(false);
			expect(start.hasZone()).toEqual(false);
			expect(start.format()).toEqual('2014-04-27');
			expect(moment.isMoment(end)).toEqual(true);
			expect(end.hasTime()).toEqual(false);
			expect(end.hasZone()).toEqual(false);
			expect(end.format()).toEqual('2014-06-08');
			expect(timezone).toEqual('local');
			expect(typeof callback).toEqual('function');
			callback([]);
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('requests correctly when UTC timezone', function(done) {
		options.timezone = 'UTC';
		options.events = function(start, end, timezone, callback) {
			expect(moment.isMoment(start)).toEqual(true);
			expect(start.hasTime()).toEqual(false);
			expect(start.hasZone()).toEqual(false);
			expect(start.format()).toEqual('2014-04-27');
			expect(moment.isMoment(end)).toEqual(true);
			expect(end.hasTime()).toEqual(false);
			expect(end.hasZone()).toEqual(false);
			expect(end.format()).toEqual('2014-06-08');
			expect(timezone).toEqual('UTC');
			expect(typeof callback).toEqual('function');
			callback([]);
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('requests correctly when custom timezone', function(done) {
		options.timezone = 'America/Chicago';
		options.events = function(start, end, timezone, callback) {
			expect(moment.isMoment(start)).toEqual(true);
			expect(start.hasTime()).toEqual(false);
			expect(start.hasZone()).toEqual(false);
			expect(start.format()).toEqual('2014-04-27');
			expect(moment.isMoment(end)).toEqual(true);
			expect(end.hasTime()).toEqual(false);
			expect(end.hasZone()).toEqual(false);
			expect(end.format()).toEqual('2014-06-08');
			expect(timezone).toEqual('America/Chicago');
			expect(typeof callback).toEqual('function');
			callback([]);
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('requests correctly when timezone changed dynamically', function(done) {
		var callCnt = 0;

		options.timezone = 'America/Chicago';
		options.events = function(start, end, timezone, callback) {
			callCnt++;
			if (callCnt === 1) {
				expect(timezone).toEqual('America/Chicago');
				setTimeout(function() {
					$('#cal').fullCalendar('option', 'timezone', 'UTC');
				}, 0);
			}
			else if (callCnt === 2) {
				expect(timezone).toEqual('UTC');
				done();
			}
		};

		$('#cal').fullCalendar(options);
	});

	it('requests correctly with event source extended form', function(done) {
		var eventSource = {
			className: 'customeventclass',
			events: function(start, end, timezone, callback) {
				expect(moment.isMoment(start)).toEqual(true);
				expect(start.hasTime()).toEqual(false);
				expect(start.hasZone()).toEqual(false);
				expect(start.format()).toEqual('2014-04-27');
				expect(moment.isMoment(end)).toEqual(true);
				expect(end.hasTime()).toEqual(false);
				expect(end.hasZone()).toEqual(false);
				expect(end.format()).toEqual('2014-06-08');
				expect(timezone).toEqual(false);
				expect(typeof callback).toEqual('function');
				callback([
					{
						title: 'event1',
						start: '2014-05-10'
					}
				]);
			}
		};
		spyOn(eventSource, 'events').and.callThrough();
		options.eventSources = [ eventSource ];
		options.eventRender = function(eventObj, eventElm) {
			expect(eventSource.events.calls.count()).toEqual(1);
			expect(eventElm).toHaveClass('customeventclass');
			done();
		};
		$('#cal').fullCalendar(options);
	});

});
