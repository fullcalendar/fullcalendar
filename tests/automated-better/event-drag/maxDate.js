
describe('maxDate event dragging', function() {

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

		pit('won\'t go after maxDate', function() {
			initCalendar();
			return DayGridEventDragUtils.drag('2017-06-05', '2017-06-08')
				.then(function(res) {
					expect(res.isSuccess).toBe(false);
				});
		});
	});
});
