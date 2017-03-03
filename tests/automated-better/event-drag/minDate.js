
describe('minDate event dragging', function() {
	// TODO: and dontDisplayCurrentDates
	// TODO: event resizing

	describe('when in month view', function() {
		pushOptions({
			defaultView: 'month',
			defaultDate: '2017-06-01',
			minDate: '2017-06-06',
			events: [
				{ start: '2017-06-07', end: '2017-06-10' }
			],
			editable: true
		});

		it('won\'t do before minDate', function() {
			initCalendar();
			return DayGridEventDragUtils.drag('2017-06-08', '2017-06-06')
				.then(function(res) {
					expect(res.isSuccess).toBe(false);
				});
		});
	});

});
