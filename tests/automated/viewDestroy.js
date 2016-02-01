
describe('viewDestroy', function() {
	var options;

	beforeEach(function() {
		options = {
			defaultDate: '2015-02-20'
		};
		affix('#cal');
	});

	describe('when in month view', function() {
		beforeEach(function() {
			options = {
				defaultView: 'month'
			};
		});
		defineTests();
	});

	describe('when in agendaWeek view', function() {
		beforeEach(function() {
			options = {
				defaultView: 'agendaWeek'
			};
		});
		defineTests();
	});

	function defineTests() {

		it('fires before the view is unrendered, with correct arguments', function(done) {
			var viewRenderCalls = 0;
			var viewDestroyCalls = 0;

			options.viewRender = function() {
				++viewRenderCalls;
			};

			options.viewDestroy = function(givenViewObj, givenViewEl) {
				if (++viewDestroyCalls === 1) { // because done() calls destroy

					// the viewDestroy should be called before the next viewRender
					expect(viewRenderCalls).toBe(1);

					var viewObj = $('#cal').fullCalendar('getView');
					var viewEl = $('#cal .fc-view');

					expect(viewObj).toBe(givenViewObj);
					expect(viewEl[0]).toBe(givenViewEl[0]);
					expect(viewEl.children().length >= 1).toBe(true); // is the content still rendered?
					done();
				}
			};

			$('#cal').fullCalendar(options);
			$('#cal').fullCalendar('next'); // will trigger a viewDestroy/viewRender
		});
	}
});