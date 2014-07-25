
describe('events as a json feed', function() {

	var options;

	beforeEach(function() {
		affix('#cal');

		options = {
			defaultDate: '2014-05-01',
			defaultView: 'month'
		};

		$.mockjax({
			url: '*',
			contentType: 'text/json',
			responseText: [
				{
					title: 'my event',
					start: '2014-05-21'
				}
			]
		});
		$.mockjaxSettings.log = function() { }; // don't console.log
	});

	afterEach(function() {
		$.mockjaxClear();
	});

	it('requests correctly when no timezone', function() {
		options.events = 'my-feed.php';
		$('#cal').fullCalendar(options);
		var request = $.mockjax.mockedAjaxCalls()[0];
		expect(request.data.start).toEqual('2014-04-27');
		expect(request.data.end).toEqual('2014-06-08');
		expect(request.data.timezone).toBeUndefined();
	});

	it('requests correctly when local timezone', function() {
		options.events = 'my-feed.php';
		options.timezone = 'local';
		$('#cal').fullCalendar(options);
		var request = $.mockjax.mockedAjaxCalls()[0];
		expect(request.data.start).toEqual('2014-04-27');
		expect(request.data.end).toEqual('2014-06-08');
		expect(request.data.timezone).toBeUndefined();
	});

	it('requests correctly when UTC timezone', function() {
		options.events = 'my-feed.php';
		options.timezone = 'UTC';
		$('#cal').fullCalendar(options);
		var request = $.mockjax.mockedAjaxCalls()[0];
		expect(request.data.start).toEqual('2014-04-27');
		expect(request.data.end).toEqual('2014-06-08');
		expect(request.data.timezone).toEqual('UTC');
	});

	it('requests correctly when custom timezone', function() {
		options.events = 'my-feed.php';
		options.timezone = 'America/Chicago';
		$('#cal').fullCalendar(options);
		var request = $.mockjax.mockedAjaxCalls()[0];
		expect(request.data.start).toEqual('2014-04-27');
		expect(request.data.end).toEqual('2014-06-08');
		expect(request.data.timezone).toEqual('America/Chicago');
	});

	it('requests correctly with event source extended form', function(done) {
		var eventSource = {
			url: 'my-feed.php',
			className: 'customeventclass'
		};
		options.eventSources = [ eventSource ];
		options.timezone = 'America/Chicago';
		options.eventRender = function(eventObj, eventElm) {
			var request = $.mockjax.mockedAjaxCalls()[0];
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
			url: 'my-feed.php',
			data: {
				customParam: 'yes'
			},
			success: function() {
				var request = $.mockjax.mockedAjaxCalls()[0];
				expect(request.data.customParam).toMatch('yes');
				done();
			}
		};
		options.eventSources = [ eventSource ];
		$('#cal').fullCalendar(options);
	});

	it('accepts a dynamic data function', function(done) {
		var eventSource = {
			url: 'my-feed.php',
			data: function() {
				return {
					customParam: 'heckyeah'
				};
			}
		};
		options.eventSources = [ eventSource ];
		options.eventAfterAllRender = function() {
			var request = $.mockjax.mockedAjaxCalls()[0];
			expect(request.data.customParam).toMatch('heckyeah');
			done();
		};
		$('#cal').fullCalendar(options);
	});

});
