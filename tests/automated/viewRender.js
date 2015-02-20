
describe('viewRender', function() {
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

		it('fires after the view is rendered, with correct arguments', function(done) {
			options.viewRender = function(givenViewObj, givenViewEl) {
				var viewObj = $('#cal').fullCalendar('getView');
				var viewEl = $('#cal .fc-view');

				expect(viewObj).toBe(givenViewObj);
				expect(viewEl[0]).toBe(givenViewEl[0]);
				expect(viewEl.children().length >= 1).toBe(true); // has it rendered content?
				done();
			};
			$('#cal').fullCalendar(options);
		});
	}
});