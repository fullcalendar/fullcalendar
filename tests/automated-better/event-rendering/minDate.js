
describe('minDate event rendering', function() {

	describe('when month view', function() {
		pushOptions({
			defaultView: 'month',
			defaultDate: '2017-06-01',
			minDate: '2017-06-07'
		});

		describe('when event is partially before', function() {
			pushOptions({
				events: [
					{ start: '2017-06-05', end: '2017-06-09' }
				]
			})

			it('truncates the event\'s beginning', function() {
				initCalendar();
				EventRenderUtils.expectIsStart(false);
				EventRenderUtils.expectIsEnd(true);
				// TODO: more test about positioning
			});
		});
	});
});
