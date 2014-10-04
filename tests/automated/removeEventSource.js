describe('removeEventSource', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-01'
		};
		$.mockjax({
			url: '*',
			contentType: 'text/json',
			responseText: buildEventArray()
		});
		$.mockjaxSettings.log = function() { }; // don't console.log
	});

	afterEach(function() {
		$.mockjaxClear();
	});

	describe('with a URL', function() {
		testInput('/myscript.php'); // will go to mockjax
	});

	describe('with an array', function() {
		testInput(buildEventArray());
	});

	describe('with a function', function() {
		testInput(function(start, end, timezone, callback) {
			callback(buildEventArray());
		});
	});

	describe('with an object+url', function() {
		testInput({
			url: '/myscript.php' // will go to mockjax
		});
	});

	describe('with an object+array', function() {
		testInput({
			events: buildEventArray()
		});
	});

	describe('with an object+function', function() {
		testInput({
			events: function(start, end, timezone, callback) {
				callback(buildEventArray());
			}
		});
	});

	function testInput(eventInput) {

		it('correctly removes events provided via `events` at initialization', function(done) {
			var callCnt = 0;
			options.eventAfterAllRender = function() {
				if (!(callCnt++)) { // only the first time
					expectEventCnt(2);
					$('#cal').fullCalendar('removeEventSource', eventInput);
					expectEventCnt(0);
					done();
				}
			};
			options.events = eventInput;
			$('#cal').fullCalendar(options);
		});

		it('correctly removes events provided via `eventSources` at initialization', function(done) {
			var callCnt = 0;
			options.eventAfterAllRender = function() {
				if (!(callCnt++)) { // only the first time
					expectEventCnt(2);
					$('#cal').fullCalendar('removeEventSource', eventInput);
					expectEventCnt(0);
					done();
				}
			};
			options.eventSources = [ eventInput ];
			$('#cal').fullCalendar(options);
		});

		it('correctly removes events provided via `addEventSource` method', function(done) {
			var callCnt = 0;
			options.eventAfterAllRender = function() {
				if ((callCnt++) === 1) { // the second time (the first time is upon initial render)
					expectEventCnt(2);
					$('#cal').fullCalendar('removeEventSource', eventInput);
					expectEventCnt(0);
					done();
				}
			};
			$('#cal').fullCalendar(options);
			$('#cal').fullCalendar('addEventSource', eventInput);
		});
	}

	function buildEventArray() {
		return [
			{ title: 'event1', start: '2014-08-01' },
			{ title: 'event2', start: '2014-08-02' }
		];
	}

	function expectEventCnt(cnt) {
		expect($('.fc-event').length).toBe(cnt);
		expect($('#cal').fullCalendar('clientEvents').length).toBe(cnt);
	}
});