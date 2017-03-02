/*
TODO:
- quick test for when button is clicked

SEE ALSO:
- other range intersection tests handled by next-button
*/
describe('prev button', function() {
	pushOptions({
		header: { left: 'prev' },
		defaultView: 'week',
		defaultDate: '2017-06-08',
		dateIncrement: { years: 1 } // prev range is 2016-06-05 - 2016-06-12
	});

	describe('when there is no minDate', function() {
		xit('is enabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('next', true);
		});
	});

	describe('when prev date range is completely before minDate', function() {
		pushOptions({
			minDate: '2018-06-12'
		});
		xit('is disabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('next', false);
		});
	});
});
