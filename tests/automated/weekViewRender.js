describe('weekViewRender', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('verify th class for today', function() {
		var nowStr = $.fullCalendar.moment(new Date()).format('YYYY-MM-DD');

		beforeEach(function() {
			$('#cal').fullCalendar({
				defaultDate: nowStr,
				defaultView: 'agendaWeek'
			});
		});

		it('should have fc-today class only on "today"', function() {
			var foundToday = false;

			$('#cal th.fc-day-header').each(function(i, headerNode) {
				var headerEl = $(headerNode);
				var dateMatchesToday = headerEl.data('date') === nowStr;
				var hasTodayClass = headerEl.hasClass('fc-today');

				expect(dateMatchesToday).toBe(hasTodayClass);

				if (hasTodayClass) {
					foundToday = true;
				}
			});

			expect(foundToday).toBe(true);
		});
	});
});
