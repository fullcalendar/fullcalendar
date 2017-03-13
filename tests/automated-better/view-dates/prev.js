/*
SEE ALSO:
- next (does core of date switching)
*/
describe('prev', function() {
	pushOptions({
		defaultDate: '2017-06-08'
	});

	describe('when in a week view', function() {
		pushOptions({
			defaultView: 'agendaWeek'
		});

		xit('moves back by one week', function() {
			initCalendar();
			currentCalendar.prev();
			ViewDateUtils.expectVisibleRange('2017-05-28', '2017-06-04');
		});

		describe('when two week dateIncrement', function() {
			pushOptions({
				dateIncrement: { weeks: 2 }
			});

			xit('moves back by two weeks', function() {
				initCalendar();
				currentCalendar.prev();
				ViewDateUtils.expectVisibleRange('2017-05-21', '2017-05-28');
			});
		});
	});
});
