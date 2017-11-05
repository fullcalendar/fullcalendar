
describe('events as a json feed', function() {
	var request;
	var options;

	beforeEach(function() {
		affix('#cal');

		options = {
			defaultDate: '2014-05-01',
			defaultView: 'month'
		};

		// mock xhr
		window.xhr = function(options, callback) {
			request = options
			callback(null, [
				{
					title: 'my event',
					start: '2014-05-21',
				},
			])
		}
	});

	afterEach(function() {
		request = null
	});

	it('requests correctly when no timezone', function() {
		options.events = '/my-feed.php';
		$('#cal').fullCalendar(options);
		expect(request.data.start).toEqual('2014-04-27');
		expect(request.data.end).toEqual('2014-06-08');
		expect(request.data.timezone).toBeUndefined();
	});

	it('requests correctly when local timezone', function() {
		options.events = '/my-feed.php';
		options.timezone = 'local';
		$('#cal').fullCalendar(options);
		expect(request.data.start).toEqual('2014-04-27');
		expect(request.data.end).toEqual('2014-06-08');
		expect(request.data.timezone).toBeUndefined();
	});

	it('requests correctly when UTC timezone', function() {
		options.events = '/my-feed.php';
		options.timezone = 'UTC';
		$('#cal').fullCalendar(options);
		expect(request.data.start).toEqual('2014-04-27');
		expect(request.data.end).toEqual('2014-06-08');
		expect(request.data.timezone).toEqual('UTC');
	});

	it('requests correctly when custom timezone', function() {
		options.events = '/my-feed.php';
		options.timezone = 'America/Chicago';
		$('#cal').fullCalendar(options);
		expect(request.data.start).toEqual('2014-04-27');
		expect(request.data.end).toEqual('2014-06-08');
		expect(request.data.timezone).toEqual('America/Chicago');
	});

	it('requests correctly with event source extended form', function(done) {
		var eventSource = {
			url: '/my-feed.php',
			className: 'customeventclass'
		};
		options.eventSources = [ eventSource ];
		options.timezone = 'America/Chicago';
		options.eventRender = function(eventObj, eventElm) {
			expect(request.data.start).toEqual('2014-04-27');
			expect(request.data.end).toEqual('2014-06-08');
			expect(request.data.timezone).toEqual('America/Chicago');
			expect(eventElm).toHaveClass('customeventclass');
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('accepts jQuery.ajax params', function(done) {
		var eventSource = {
			url: '/my-feed.php',
			data: {
				customParam: 'yes'
			},
			success: function() {
				expect(request.data.customParam).toMatch('yes');
				done();
			}
		};
		options.eventSources = [ eventSource ];
		$('#cal').fullCalendar(options);
	});

	it('accepts a dynamic data function', function(done) {
		var eventSource = {
			url: '/my-feed.php',
			data: function() {
				return {
					customParam: 'heckyeah'
				};
			}
		};
		options.eventSources = [ eventSource ];
		options.eventAfterAllRender = function() {
			expect(request.data.customParam).toMatch('heckyeah');
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('calls loading callback', function(done) {
		var loadingCallArgs = [];

		initCalendar({
			events: { url: '/my-feed.php' },
			loading: function(bool) {
				loadingCallArgs.push(bool);
			},
			eventAfterAllRender: function() {
				expect(loadingCallArgs).toEqual([ true, false ]);
				done();
			}
		});
	});

	it('has and Event Source object with certain props', function() {
		var url = '/my-feed.php';
		var source;

		initCalendar({
			events: { url: url }
		});

		source = currentCalendar.getEventSources()[0];
		expect(source.url).toBe(url);
	});

});
