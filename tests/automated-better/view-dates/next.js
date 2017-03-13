
describe('next', function() {
	pushOptions({
		defaultDate: '2017-06-08'
	});

	describe('when in a week view', function() {
		pushOptions({
			defaultView: 'agendaWeek'
		});

		describe('when dateIncrement not specified', function() {

			xit('moves back by one week', function() {
				initCalendar();
				currentCalendar.prev();
				ViewDateUtils.expectVisibleRange('2017-05-28', '2017-06-04');
			});

			xit('moves forward by one week', function() {
				initCalendar();
				currentCalendar.next();
				var view = currentCalendar.getView();
				ViewDateUtils.expectVisibleRange('2017-06-11', '2017-06-24');
			});
		})

		describeOptions('dateIncrement', {
			'when two week dateIncrement specified as a plain object': { weeks: 2 },
			'when two week dateIncrement specified as a Duration object': moment.duration({ weeks: 2 }),
			'when two week dateIncrement specified as a string': '14.00:00:00'
		}, function() {

			xit('moves back by two weeks', function() {
				initCalendar();
				currentCalendar.prev();
				ViewDateUtils.expectVisibleRange('2017-05-21', '2017-05-28');
			});

			xit('moves forward by two weeks', function() {
				initCalendar();
				currentCalendar.next();
				ViewDateUtils.expectVisibleRange('2017-06-18', '2017-07-02');
			});
		});
	});

	describe('when in a month view', function() {
		pushOptions({
			defaultView: 'month'
		});

		describe('when dateIncrement not specified', function() {

			xit('moves back by one month', function() {
				initCalendar();
				currentCalendar.next();
				ViewDateUtils.expectVisibleRange('2017-05-30', '2017-06-04');
			});

			xit('moves forward by one month', function() {
				initCalendar();
				currentCalendar.next();
				ViewDateUtils.expectVisibleRange('2017-06-25', '2017-08-06');
			});
		});

		describe('when two month dateIncrement is specified', function() {
			pushOptions({
				dateIncrement: { months: 2 }
			});

			xit('moves back by two months', function() {
				initCalendar();
				currentCalendar.next();
				ViewDateUtils.expectVisibleRange('2017-03-26', '2017-05-07');
			});

			xit('moves forward by two months', function() {
				initCalendar();
				currentCalendar.next();
				ViewDateUtils.expectVisibleRange('2017-07-30', '2017-09-03');
			});
		});
	});

	describe('when in custom three day view', function() {
		pushOptions({
			defaultView: 'basic',
			duration: { days: 3 }
		});

		describe('when no dateAlignment is specified', function() {

			describe('when dateIncrement not specified', function() {
				xit('moves forward three days', function() {
					initCalendar();
					calendar.next();
					ViewDateUtils.expectVisibleRange('2017-06-11', '2017-06-14');
				});
			});

			describe('when two day dateIncrement is specified', function() {
				pushOptions({
					dateIncrement: { days: 2 }
				})
				xit('moves forward two days', function() {
					initCalendar();
					calendar.next();
					ViewDateUtils.expectVisibleRange('2017-06-10', '2017-06-13');
				});
			});
		})

		describe('when week dateAlignment is specified', function() {
			pushOptions({
				dateAlignment: 'week'
			});

			describe('when dateIncrement not specified', function() {
				xit('moves back one week', function() {
					initCalendar();
					calendar.next();
					ViewDateUtils.expectVisibleRange('2017-06-11', '2017-06-14');
				});
			});

			describe('when two day dateIncrement is specified', function() {
				pushOptions({
					dateIncrement: { days: 2 }
				});

				xit('does not navigate nor rerender', function() {
					viewRenderCalled = false
					initCalendar({
						viewRender: function() {
							viewRenderCalled = true
						}
					});
					calendar.next();
					ViewDateUtils.expectVisibleRange('2017-06-04', '2017-06-07'); // the same as how it started
					expect(viewRenderCalled).toBe(false)
				});
			});
		});
	});
});
