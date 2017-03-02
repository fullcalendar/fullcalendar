/*
TODO:
- quick test for when button is clicked

SEE ALSO:
- other range intersection tests handled by next-button
*/
describe('today button', function() {
	pushOptions({
		header: { left: 'today' },
		defaultView: 'month',
		now: '2017-06-30'
	});

	describe('when now is in current month', function() {
		pushOptions({
			defaultDate: '2017-06-01'
		});
		xit('is disabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('today', false);
		});
	})

	describe('when now is not current month, but still visible', function() {
		pushOptions({
			defaultDate: '2017-07-01'
		});
		xit('is disabled', function() {
			initCalendar();
			ToolbarUtils.expectButtonEnabled('today', false);
		});
	});

	describe('when now is out of view', function() {
		pushOptions({
			defaultDate: '2017-08-01'
		});

		describe('when no minDate', function() {
			xit('is enabled', function() {
				initCalendar();
				ToolbarUtils.expectButtonEnabled('today', true);
			});
		});

		describe('when now\'s month is entirely before minDate', function() {
			pushOptions({
				minDate: '2017-07-02' // previous day is visible in the June
			});
			xit('is disabled', function() {
				initCalendar();
				ToolbarUtils.expectButtonEnabled('today', false);
			});
		});
	});
});
