
describe('Google Calendar plugin', function() {

	var API_KEY = 'AIzaSyDcnW6WejpTOCffshGDDb4neIrXVUA1EAE';
	var options;
	var currentRequest;
	var currentWarnArgs;
	var oldConsoleWarn;

	beforeEach(function() {
		affix('#cal');

		options = {
			defaultView: 'month',
			defaultDate: '2014-11-01'
		};

		// Mockjax is bad with JSONP (https://github.com/jakerella/jquery-mockjax/issues/136)
		// Workaround. Wanted to use mockedAjaxCalls(), but JSONP requests get mangled later on.
		currentRequest = null;
		$.mockjaxSettings.log = function(mockHandler, request) {
			currentRequest = currentRequest || $.extend({}, request); // copy
		};

		// Will cause all requests to go through $.mockjaxSettings.log, but will not actually handle
		// any of the requests due to the JSONP bug mentioned above.
		// THE REAL REQUESTS WILL GO THROUGH TO THE GOOGLE CALENDAR API!
		$.mockjax({
			url: '*',
			responseText: {}
		});

		// Intercept calls to console.warn
		currentWarnArgs = null;
		oldConsoleWarn = console.warn;
		console.warn = function() {
			currentWarnArgs = arguments;
		};
	});

	afterEach(function() {
		$.mockjaxClear();
		$.mockjaxSettings.log = function() { };
		console.warn = oldConsoleWarn;
	});

	it('request/receives correctly when local timezone', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = { googleCalendarId: 'usa__en@holiday.calendar.google.com' };
		options.timezone = 'local';
		options.eventAfterAllRender = function() {
			var events = $('#cal').fullCalendar('clientEvents');
			var i;

			expect(currentRequest.data.timeMin).toEqual('2014-10-25T00:00:00+00:00'); // one day before, by design
			expect(currentRequest.data.timeMax).toEqual('2014-12-08T00:00:00+00:00'); // one day after, by design
			expect(currentRequest.data.timeZone).toBeUndefined();

			expect(events.length).toBe(4);
			for (i = 0; i < events.length; i++) {
				expect(events[i].url).not.toMatch('ctz=');
			}

			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('request/receives correctly when UTC timezone', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = { googleCalendarId: 'usa__en@holiday.calendar.google.com' };
		options.timezone = 'UTC';
		options.eventAfterAllRender = function() {
			var events = $('#cal').fullCalendar('clientEvents');
			var i;

			expect(currentRequest.data.timeMin).toEqual('2014-10-25T00:00:00+00:00'); // one day before, by design
			expect(currentRequest.data.timeMax).toEqual('2014-12-08T00:00:00+00:00'); // one day after, by design
			expect(currentRequest.data.timeZone).toEqual('UTC');

			expect(events.length).toBe(4);
			for (i = 0; i < events.length; i++) {
				expect(events[i].url).toMatch('ctz=UTC');
			}

			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('request/receives correctly when custom timezone', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = { googleCalendarId: 'usa__en@holiday.calendar.google.com' };
		options.timezone = 'America/New York';
		options.eventAfterAllRender = function() {
			var events = $('#cal').fullCalendar('clientEvents');
			var i;

			expect(currentRequest.data.timeMin).toEqual('2014-10-25T00:00:00+00:00'); // one day before, by design
			expect(currentRequest.data.timeMax).toEqual('2014-12-08T00:00:00+00:00'); // one day after, by design
			expect(currentRequest.data.timeZone).toEqual('America/New_York'); // space should be escaped

			expect(events.length).toBe(4);
			for (i = 0; i < events.length; i++) {
				expect(events[i].url).toMatch('ctz=America/New_York');
			}

			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('requests/receives correctly when no timezone, defaults to not editable', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = { googleCalendarId: 'usa__en@holiday.calendar.google.com' };
		options.eventAfterAllRender = function() {
			var events = $('#cal').fullCalendar('clientEvents');
			var eventEls = $('.fc-event');
			var i;

			expect(currentRequest.data.timeMin).toEqual('2014-10-25T00:00:00+00:00'); // one day before, by design
			expect(currentRequest.data.timeMax).toEqual('2014-12-08T00:00:00+00:00'); // one day after, by design
			expect(currentRequest.data.timeZone).toBeUndefined();

			expect(events.length).toBe(4); // 4 holidays in November 2014
			for (i = 0; i < events.length; i++) {
				expect(events[i].url).not.toMatch('ctz=');
			}

			expect(eventEls.length).toBe(4);
			expect(eventEls.find('.fc-resizer').length).toBe(0); // not editable

			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('allows editable to explicitly be set to true', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = {
			googleCalendarId: 'usa__en@holiday.calendar.google.com',
			editable: true
		};
		options.eventAfterAllRender = function() {
			var eventEls = $('.fc-event');
			expect(eventEls.length).toBe(4);
			expect(eventEls.find('.fc-resizer').length).toBeGreaterThan(0); // editable!
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('fetches events correctly when API key is in the event source', function(done) {
		options.events = {
			googleCalendarId: 'usa__en@holiday.calendar.google.com',
			googleCalendarApiKey: API_KEY
		};
		options.eventAfterAllRender = function() {
			var events = $('#cal').fullCalendar('clientEvents');
			expect(events.length).toBe(4); // 4 holidays in November 2014
			done();
		};
		$('#cal').fullCalendar(options);
	});

	describe('when not given an API key', function() {
		it('calls error handlers, raises warning, and receives no events', function(done) {
			options.googleCalendarError = function(err) {
				expect(typeof err).toBe('object');
			};
			options.events = {
				googleCalendarError: function(err) {
					expect(typeof err).toBe('object');
				},
				googleCalendarId: 'usa__en@holiday.calendar.google.com'
			};
			options.eventAfterAllRender = function() {
				var events = $('#cal').fullCalendar('clientEvents');
				expect(events.length).toBe(0);
				expect(currentWarnArgs.length).toBeGreaterThan(0);
				expect(options.googleCalendarError).toHaveBeenCalled();
				expect(options.events.googleCalendarError).toHaveBeenCalled();
				expect(currentRequest).toBeNull(); // AJAX request should have never been made!
				done();
			};
			spyOn(options, 'googleCalendarError').and.callThrough();
			spyOn(options.events, 'googleCalendarError').and.callThrough();
			$('#cal').fullCalendar(options);
		});
	});

	describe('when given a bad API key', function() {
		it('calls error handlers, raises warning, and receives no event', function(done) {
			options.googleCalendarApiKey = 'asdfasdfasdf';
			options.googleCalendarError = function(err) {
				expect(typeof err).toBe('object');
			};
			options.events = {
				googleCalendarError: function(err) {
					expect(typeof err).toBe('object');
				},
				googleCalendarId: 'usa__en@holiday.calendar.google.com'
			};
			options.eventAfterAllRender = function() {
				var events = $('#cal').fullCalendar('clientEvents');
				expect(events.length).toBe(0);
				expect(currentWarnArgs.length).toBeGreaterThan(0);
				expect(options.googleCalendarError).toHaveBeenCalled();
				expect(options.events.googleCalendarError).toHaveBeenCalled();
				expect(typeof currentRequest).toBe('object'); // request should have been sent
				done();
			};
			spyOn(options, 'googleCalendarError').and.callThrough();
			spyOn(options.events, 'googleCalendarError').and.callThrough();
			$('#cal').fullCalendar(options);
		});
	});

	it('works when `events` is the actual calendar ID', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = 'usa__en@holiday.calendar.google.com';
		options.eventAfterAllRender = function() {
			var events = $('#cal').fullCalendar('clientEvents');
			expect(events.length).toBe(4); // 4 holidays in November 2014
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('detects a gcal when `events` is the actual calendar ID, with complicated characters (1)', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = 'arshaw.com_jlr7e6hpcuiald27@whatever.import.calendar.google.com';
		options.eventAfterAllRender = function() {
			expect(currentWarnArgs.length).toBe(2);
			expect(typeof currentWarnArgs[1]).toBe('object'); // sent the request to google, but not-found warning
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('detects a gcal when `events` is the actual calendar ID, with complicated characters (2)', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = 'ar-shaw.com_jlr7e6hpcuiald27@calendar.google.com';
		options.eventAfterAllRender = function() {
			expect(currentWarnArgs.length).toBe(2);
			expect(typeof currentWarnArgs[1]).toBe('object'); // sent the request to google, but not-found warning
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('detects a gcal when `events` is the actual calendar ID, person gmail', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = 'arshaw.arshaw@gmail.com';
		options.eventAfterAllRender = function() {
			expect(currentWarnArgs.length).toBe(2);
			expect(typeof currentWarnArgs[1]).toBe('object'); // sent the request to google, but not-found warning
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('detects a gcal when `events` is the actual calendar ID, person googlemail', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = 'arshaw.arshaw@googlemail.com';
		options.eventAfterAllRender = function() {
			expect(currentWarnArgs.length).toBe(2);
			expect(typeof currentWarnArgs[1]).toBe('object'); // sent the request to google, but not-found warning
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('works with requesting an HTTP V1 API feed URL', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = 'http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic';
		options.eventAfterAllRender = function() {
			var events = $('#cal').fullCalendar('clientEvents');
			expect(events.length).toBe(4); // 4 holidays in November 2014
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('works with requesting an HTTPS V1 API feed URL', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events = 'https://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic';
		options.eventAfterAllRender = function() {
			var events = $('#cal').fullCalendar('clientEvents');
			expect(events.length).toBe(4); // 4 holidays in November 2014
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('works with requesting an V3 API feed URL', function(done) {
		options.googleCalendarApiKey = API_KEY;
		options.events =
			'https://www.googleapis.com/calendar/v3/calendars/usa__en%40holiday.calendar.google.com/events';
		options.eventAfterAllRender = function() {
			var events = $('#cal').fullCalendar('clientEvents');
			expect(events.length).toBe(4); // 4 holidays in November 2014
			done();
		};
		$('#cal').fullCalendar(options);
	});

	describe('removeEventSource', function() {

		it('works when specifying only the Google Calendar ID', function(done) {
			var CALENDAR_ID = 'usa__en@holiday.calendar.google.com';
			var called = false;

			options.googleCalendarApiKey = API_KEY;
			options.eventSources = [ { googleCalendarId: CALENDAR_ID } ];
			options.eventAfterAllRender = function() {
				var events;

				if (called) { return; } // only the first time
				called = true;

				events = $('#cal').fullCalendar('clientEvents');
				expect(events.length).toBe(4); // 4 holidays in November 2014

				setTimeout(function() {
					$('#cal').fullCalendar('removeEventSource', CALENDAR_ID);
					events = $('#cal').fullCalendar('clientEvents');
					expect(events.length).toBe(0);
					done();
				}, 0);
			};

			$('#cal').fullCalendar(options);
		});

		it('works when specifying a raw Google Calendar source object', function(done) {
			var CALENDAR_ID = 'usa__en@holiday.calendar.google.com';
			var googleSource = { googleCalendarId: CALENDAR_ID };
			var called = false;

			options.googleCalendarApiKey = API_KEY;
			options.eventSources = [ googleSource ];
			options.eventAfterAllRender = function() {
				var events;

				if (called) { return; } // only the first time
				called = true;

				events = $('#cal').fullCalendar('clientEvents');
				expect(events.length).toBe(4); // 4 holidays in November 2014

				setTimeout(function() {
					$('#cal').fullCalendar('removeEventSource', googleSource);
					events = $('#cal').fullCalendar('clientEvents');
					expect(events.length).toBe(0);
					done();
				}, 0);
			};

			$('#cal').fullCalendar(options);
		});
	});

});