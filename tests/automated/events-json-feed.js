
describe('events as a json feed', function() {

	var options;
	var sampleResponse;

	beforeEach(function() {
		jasmine.Ajax.install();
		affix('#cal');
		options = {
			defaultDate: '2014-05-01',
			defaultView: 'month'
		};
		sampleResponse = {
			status: 200,
			responseText: JSON.stringify([
				{
					title: 'my event',
					start: '2014-05-21'
				}
			])
		};
	});

	it('requests correctly when no timezone', function() {
		options.events = 'my-feed.php';
		$('#cal').fullCalendar(options);
		var request = jasmine.Ajax.requests.mostRecent();
		expect(request.url).toMatch(/^my-feed\.php\?start=2014-04-27&end=2014-06-08&_=/);
	});

	it('requests correctly when local timezone', function() {
		options.events = 'my-feed.php';
		options.timezone = 'local';
		$('#cal').fullCalendar(options);
		var request = jasmine.Ajax.requests.mostRecent();
		expect(request.url).toMatch(/^my-feed\.php\?start=2014-04-27&end=2014-06-08&_=/);
	});

	it('requests correctly when UTC timezone', function() {
		options.events = 'my-feed.php';
		options.timezone = 'UTC';
		$('#cal').fullCalendar(options);
		var request = jasmine.Ajax.requests.mostRecent();
		expect(request.url).toMatch(/^my-feed\.php\?start=2014-04-27&end=2014-06-08&timezone=UTC&_=/);
	});

	it('requests correctly when custom timezone', function() {
		options.events = 'my-feed.php';
		options.timezone = 'America/Chicago';
		$('#cal').fullCalendar(options);
		var request = jasmine.Ajax.requests.mostRecent();
		expect(request.url).toMatch(/^my-feed\.php\?start=2014-04-27&end=2014-06-08&timezone=America%2FChicago&_=/);
	});

	it('requests correctly with event source extended form', function(done) {
		var request;
		var eventSource = {
			url: 'my-feed.php',
			className: 'customeventclass'
		};
		options.eventSources = [ eventSource ];
		options.timezone = 'America/Chicago';
		options.eventRender = function(eventObj, eventElm) {
			expect(request.url).toMatch(/^my-feed\.php\?start=2014-04-27&end=2014-06-08&timezone=America%2FChicago&_=/);
			expect(eventElm).toHaveClass('customeventclass');
			done();
		};
		$('#cal').fullCalendar(options);
		request = jasmine.Ajax.requests.mostRecent();
		request.response(sampleResponse);
	});

	it('accepts jQuery.ajax params', function(done) {
		var request;
		var eventSource = {
			url: 'my-feed.php',
			data: {
				customParam: 'yes'
			},
			success: function() { }
		};
		spyOn(eventSource, 'success').and.callThrough();
		options.eventSources = [ eventSource ];
		options.eventAfterAllRender = function() {
			expect(request.url).toMatch(/^my-feed\.php/);
			expect(request.url).toMatch(/[?&]customParam=yes/);
			expect(eventSource.success.calls.count()).toEqual(1);
			done();
		};
		$('#cal').fullCalendar(options);
		request = jasmine.Ajax.requests.mostRecent();
		request.response(sampleResponse); // needed to trigger eventAfterAllRender (bad)
	});

	it('accepts a dynamic data function', function(done) {
		var request;
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
			expect(request.url).toMatch(/^my-feed\.php/);
			expect(request.url).toMatch(/[?&]customParam=heckyeah/);
			done();
		};
		$('#cal').fullCalendar(options);
		request = jasmine.Ajax.requests.mostRecent();
		request.response(sampleResponse); // needed to trigger eventAfterAllRender (bad)
	});

});
