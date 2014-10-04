
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

	it('requests the correct dates when days at the start/end of the month are hidden', function(done) {
		options.currentView = 'month';
		options.defaultDate = '2013-06-01'; // June 2013 has first day as Saturday, and last as Sunday!
		options.weekends = false;
		options.weekMode = 'variable';
		options.events = function(start, end, timezone, callback) {
			expect(start).toEqualMoment('2013-06-03');
			expect(end).toEqualMoment('2013-06-29');
			done();
		};
		$('#cal').fullCalendar(options);
	});

});
