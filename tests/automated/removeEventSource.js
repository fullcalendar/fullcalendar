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
		$.mockjax.clear();
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

	it('won\'t render removed events when subsequent addEventSource', function(done) {

		var source1 = function(start, end, timezone, callback) {
			setTimeout(function() {
				callback([{
					title: 'event1',
					className: 'event1',
					start: '2014-08-01T02:00:00'
				}]);
			}, 100);
		};

		var source2 = function(start, end, timezone, callback) {
			setTimeout(function() {
				callback([{
					title: 'event2',
					className: 'event2',
					start: '2014-08-01T02:00:00'
				}]);
			}, 100);
		};

		options.eventSources = [ source1 ];

		options.eventAfterAllRender = function() {
			if (!$('.fc-event').length) {
				; // might have rendered no events after removeEventSource call
			}
			else {
				expect($('.event1').length).toBe(0);
				expect($('.event2').length).toBe(1);
				done();
			}
		};

		$('#cal').fullCalendar(options);
		$('#cal').fullCalendar('removeEventSource', source1);
		$('#cal').fullCalendar('addEventSource', source2);
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