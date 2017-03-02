
describe('minDate rendering', function() {

	describe('when month view', function() {
		pushOptions({
			defaultView: 'month',
			defaultDate: '2017-06-01',
			minDate: '2017-06-07'
		});

		it('does not render days before', function() {
			initCalendar();
			ViewRenderUtils.expectDayRange('2017-06-07', '2017-07-09');
		});
	});

	describe('when in week view', function() {
		pushOptions({
			defaultView: 'agendaWeek',
			defaultDate: '2017-06-08',
			minDate: '2017-06-06'
		});

		it('does not render days before', function() {
			initCalendar();
			ViewRenderUtils.expectDayRange('2017-06-06', '2017-06-11');
		});
	});

});
