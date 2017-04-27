/*
TODO:
- quick test for when button is clicked

SEE ALSO:
- visibleRange, dateAlignment, dateIncrement
*/
describe('next button', function() {
	pushOptions({
		defaultView: 'agendaWeek',
		defaultDate: '2017-06-08',
		dateIncrement: { years: 1 } // next range is 2018-06-03 - 2018-06-10
	});

	describe('when there is no validRange', function() {
		it('is enabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('next', true);
		});
	});

	describe('when next date range is completely within validRange', function() {
		pushOptions({
			validRange: { end: '2018-06-10' }
		});
		it('is enabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('next', true);
		});
	});

	describe('when next date range is partially outside validRange', function() {
		pushOptions({
			validRange: { end: '2018-06-05' }
		});
		it('is enabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('next', true);
		});
	});

	describe('when next date range is completely beyond validRange', function() {
		pushOptions({
			validRange: { end: '2018-06-03' }
		});
		it('is disabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('next', false);
		});
	});

	describe('when day after current day is a hidden day', function() {
		pushOptions({
			defaultDate: '2017-03-31',
			defaultView: 'basicDay',
			weekends: false
		});
		it('is enabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('next', true);
		});
	});
});
