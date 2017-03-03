
describe('maxDate rendering', function() {

	describe('when month view', function() {
		pushOptions({
			defaultView: 'month',
			defaultDate: '2017-06-01',
			maxDate: '2017-06-07'
		});

		it('does not render days on or after', function() {
			initCalendar();
			ViewRenderUtils.expectDayRange('2017-05-28', '2017-06-07');
		});
	});

	describe('when in week view', function() {
		pushOptions({
			defaultView: 'agendaWeek',
			defaultDate: '2017-06-08',
			maxDate: '2017-06-06'
		});

		it('does not render days on or after', function() {
			initCalendar();
			ViewRenderUtils.expectDayRange('2017-06-04', '2017-06-06');
		});
	});

});