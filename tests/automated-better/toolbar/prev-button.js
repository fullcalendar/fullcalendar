/*
TODO:
- quick test for when button is clicked

SEE ALSO:
- other range intersection tests handled by next-button
*/
describe('prev button', function() {
	pushOptions({
		defaultView: 'agendaWeek',
		defaultDate: '2017-06-08',
		dateIncrement: { years: 1 } // prev range is 2016-06-05 - 2016-06-12
	});

	describe('when there is no specified validRange', function() {
		it('is enabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('prev', true);
		});
	});

	describe('when prev date range is completely before validRange', function() {
		pushOptions({
			validRange: { start: '2018-06-12' }
		});
		it('is disabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('prev', false);
		});
	});

	describe('when month view', function() {
		pushOptions({
			defaultView: 'month',
			defaultDate: '2017-03-01',
			validRange: { start: '2017-02-07' }
		});

		it('when prev date range is partially before validRange', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('prev', false);
		});
	});

	describe('when day before current day is a hidden day', function() {
		pushOptions({
			defaultDate: '2017-03-27',
			defaultView: 'basicDay',
			weekends: false
		});
		it('is enabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('prev', true);
		});
	});
});
