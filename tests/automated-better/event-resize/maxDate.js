
describe('maxDate event resizing', function() {

	describe('when in month view', function() {
		pushOptions({
			defaultView: 'month',
			defaultDate: '2017-06-01',
			maxDate: '2017-06-09',
			events: [
				{ start: '2017-06-04', end: '2017-06-07' }
			],
			editable: true
		});

		it('won\'t go after maxDate', function() {
			initCalendar();
			return EventResizeUtils.resize(
				DayGridRenderUtils.getSingleDayEl('2017-06-06')[0].getBoundingClientRect(),
				DayGridRenderUtils.getDisabledEl(0)[0].getBoundingClientRect() // where Jun 9th would be
			).then(function(res) {
				expect(res.isSuccess).toBe(false);
			});
		});
	});
});
