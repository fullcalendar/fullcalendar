
describe('visibleRange function', function() {
	pushOptions({
		defaultDate: '2017-06-08'
	});

	describe('for 3-day centered view', function() {

		var receivedDate;
		beforeEach(function() {
			receivedDate = null;
		});

		pushOptions({
			visibleRange: function(date) {
				receivedDate = date.clone();
				return {
					start: date.clone().subtract(1, 'days'),
					end: date.clone().add(2, 'days')
				};
			}
		});

		xit('renders the correct range', function() {
			initCalendar();
			ViewUtils.expectRange('2017-06-07', '2017-06-10');
		});

		describe('when defaultRange is specified', function() {
			pushOptions({
				defaultRange: {
					start: '2018-06-08',
					end: '2018-06-11'
				}
			});
			xit('does not get called', function() {
				initCalendar();
				expect(receivedDate).toBe(null);
			});
		});

		describe('when defaultDate is before validRange', function() {
			pushOptions({
				validRange: { start: '2017-07-01' }
			});
			xit('receives validRange\'s start', function() {
				initCalendar();
				expect(receivedDate).toEqualMoment('2017-07-01');
			});
		});

		describe('when defaultDate is after validRange', function() {
			pushOptions({
				validRange: { end: '2017-06-02' }
			});
			xit('receives the millisecond before validRange\'s end', function() {
				initCalendar();
				expect(receivedDate).toEqualMoment(
					$.fullCalendar.moment('2017-07-01T00:00:00').subtract(1)
				);
			});
		});
	});

	describe('for far-future view', function() {
		pushOptions({
			visibleRange: function(date) {
				return {
					start: date.clone().add(1, 'years'),
					end: date.clone().add(2, 'years')
				};
			}
		});

		describe('when returned range is beyond validRange', function() {
			pushOptions({
				validRange: { start: '2017-07-01' }
			});
			xit('renders the day before validRange\'s start', function() {
				initCalendar();
				ViewUtils.expectRange('2017-06-30', '2017-07-01');
			});
		});
	});

	describe('when it returns a string start and end', function() {
		var initialStartVal = '2017-03-01';
		var initialEndVal = '2017-03-05';

		pushOptions({
			defaultView: 'agenda',
			visibleRange: function() {
				return {
					start: initialStartVal,
					end: initialEndVal
				};
			}
		})

		xit('is respected by initial render', function() {
			initCalendar();
			ViewUtils.expectRange(initialStartVal, initialEndVal);
		})
	});

	// invalid inputs

	describeValues({
		'when it has no start': { end: '2017-06-02' },
		'when it has no end': { start: '2017-06-09' },
		'when it has end <= start': { start: '2017-06-09', end: '2017-06-02' }
	}, function(badRange) {

		describe('defaultDate', function() {
			pushOptions({
				defaultView: 'agenda',
				defaultDate: '2017-06-29',
				visibleRange: function() {
					return badRange;
				}
			})

			xit('reports a warning and renders single day at defaultDate', function() {
				initCalendar()
				ViewUtils.expectRange('2017-06-29', '2017-06-30');
				// TODO: detect console.warn
			});
		});

		describe('gotoDate', function() {
			var initialStartVal = '2017-03-01';
			var initialEndVal = '2017-03-05';

			pushOptions({
				defaultView: 'agenda',
				defaultRange: {
					start: initialStartVal,
					end: initialEndVal
				},
				visibleRange: function() {
					return badRange;
				}
			});

			xit('resports a warning and does not navigate', function() {
				initCalendar()
				currentCalendar.gotoDate('2017-06-01');
				ViewUtils.expectRange(initialStartVal, initialEndVal);
				// TODO: detect console.warn
			});
		});
	});
});
