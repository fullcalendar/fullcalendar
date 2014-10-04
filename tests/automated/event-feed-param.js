describe('event feed params', function() {

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

	it('utilizes custom startParam, endParam, and timezoneParam names', function() {
		options.events = 'my-feed.php';
		options.timezone = 'America/Los_Angeles';
		options.startParam = 'mystart';
		options.endParam = 'myend';
		options.timezoneParam = 'currtz';
		$('#cal').fullCalendar(options);
		var request = $.mockjax.mockedAjaxCalls()[0];
		expect(request.data.start).toBeUndefined();
		expect(request.data.end).toBeUndefined();
		expect(request.data.timezone).toBeUndefined();
		expect(request.data.mystart).toEqual('2014-04-27');
		expect(request.data.myend).toEqual('2014-06-08');
		expect(request.data.currtz).toEqual('America/Los_Angeles');
	});

	it('utilizes event-source-specific startParam, endParam, and timezoneParam names', function() {
		options.timezone = 'America/Los_Angeles';
		options.startParam = 'mystart';
		options.endParam = 'myend';
		options.timezoneParam = 'currtz';
		options.eventSources = [
			{
				url: 'my-feed.php',
				startParam: 'feedstart',
				endParam: 'feedend',
				timezoneParam: 'feedctz'
			}
		];
		$('#cal').fullCalendar(options);
		var request = $.mockjax.mockedAjaxCalls()[0];
		expect(request.data.start).toBeUndefined();
		expect(request.data.end).toBeUndefined();
		expect(request.data.timezone).toBeUndefined();
		expect(request.data.mystart).toBeUndefined();
		expect(request.data.myend).toBeUndefined();
		expect(request.data.currtz).toBeUndefined();
		expect(request.data.feedstart).toEqual('2014-04-27');
		expect(request.data.feedend).toEqual('2014-06-08');
		expect(request.data.feedctz).toEqual('America/Los_Angeles');
	});

});