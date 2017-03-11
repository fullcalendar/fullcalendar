/*
TODO:
- quick test for when button is clicked

SEE ALSO:
- visibleRange, dateAlignment, dateIncrement
*/
describe('next button', function() {
	pushOptions({
		header: { left: 'next' },
		defaultView: 'week',
		defaultDate: '2017-06-08',
		dateIncrement: { years: 1 } // next range is 2018-06-03 - 2018-06-10
	});

	describe('when there is no validRange', function() {
		xit('is enabled', function() {
			initCalendar();
			ToolbarUtils.expecButtonEnabled('next', true);
		});
	});

	describe('when next date range is completely within validRange', function() {
		pushOptions({
			validRange: { end: '2018-06-10' }
		});
		xit('is enabled', function() {
			initCalendar();
			ToolbarUtils.expecButtonEnabled('next', true);
		});
	});

	describe('when next date range is partially outside validRange', function() {
		pushOptions({
			validRange: { end: '2018-06-05' }
		})
		xit('is enabled', function() {
			initCalendar();
			ToolbarUtils.expecButtonEnabled('next', true);
		});
	});

	describe('when next date range is completely beyond validRange', function() {
		pushOptions({
			validRange: { end: '2018-06-03' }
		});
		xit('is enabled', function() {
			initCalendar();
			ToolbarUtils.expecButtonEnabled('next', false);
		});
	});
});
