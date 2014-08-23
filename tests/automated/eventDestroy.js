
describe('eventDestroy', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-01'
		};
	});

	function testSingleEvent(singleEventData, done) {
		expect(singleEventData.id).toBeTruthy();
		options.events = [ singleEventData ];
		options.eventDestroy = function(event, element) {
			expect(event.id).toBe(singleEventData.id);
			done();
		};
		$('#cal').fullCalendar(options);
		$('#cal').fullCalendar('removeEvents', singleEventData.id);
	}

	describe('when in month view', function() { // for issue 2017

		beforeEach(function() {
			options.defaultView = 'month';
		});

		it('gets called with removeEvents method', function(done) {
			testSingleEvent({
				id: 1,
				title: 'event1',
				date: '2014-08-02'
			}, done);
		});
	});

	describe('when in agendaWeek view', function() { // for issue 2017

		beforeEach(function() {
			options.defaultView = 'agendaWeek';
			options.scrollTime = '00:00:00';
		});

		it('gets called with removeEvents method', function(done) {
			testSingleEvent({
				id: 1,
				title: 'event1',
				date: '2014-08-02T02:00:00'
			}, done);
		});
	});

});