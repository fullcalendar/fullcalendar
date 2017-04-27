describe('now indicator', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			now: '2015-12-26T06:00:00',
			scrollTime: '00:00'
		};
	});

	describe('when in month view', function() {
		beforeEach(function() {
			options.defaultView = 'month';
		});

		it('doesn\'t render even when activated', function() {
			$('#cal').fullCalendar(options);
			expect(isNowIndicatorRendered()).toBe(false);
		});
	});

	describe('when in agendaWeek view', function() {
		beforeEach(function() {
			options.defaultView = 'agendaWeek';
		});

		it('doesn\'t render by default', function() {
			$('#cal').fullCalendar(options);
			expect(isNowIndicatorRendered()).toBe(false);
		});

		describe('when activated', function() {
			beforeEach(function() {
				options.nowIndicator = true;
			});

			[ false, true ].forEach(function(isRTL) {

				describe('when ' + (isRTL ? 'RTL' : 'LTR'), function() {
					beforeEach(function() {
						options.isRTL = isRTL;
					});

					it('doesn\'t render when out of view', function() {
						options.defaultDate = '2015-12-27'; // sun of next week
						$('#cal').fullCalendar(options);
						expect(isNowIndicatorRendered()).toBe(false);
					});

					it('renders on correct time', function() {
						$('#cal').fullCalendar(options);
						isNowIndicatorRenderedAt('2015-12-26T06:00:00');
					});

					it('renders on correct time2', function() {
						options.now = '2015-12-20T02:30:00';
						$('#cal').fullCalendar(options);
						isNowIndicatorRenderedAt('2015-12-20T02:30:00');
					});
				});
			});
		});
	});

	function isNowIndicatorRendered() {
		return $('.fc-now-indicator').length > 0;
	}

	function isNowIndicatorRenderedAt(date) {
		var line = getTimeGridLine(date);
		var lineEl = $('.fc-now-indicator-line');
		var arrowEl = $('.fc-now-indicator-arrow');

		expect(lineEl.length).toBe(1);
		expect(arrowEl.length).toBe(1);

		var lineElRect = getBoundingRect(lineEl);
		var arrowElRect = getBoundingRect(arrowEl);

		expect(Math.abs(
			(lineElRect.top + lineElRect.bottom) / 2 -
			line.top
		)).toBeLessThan(2);
		expect(Math.abs(
			(arrowElRect.top + arrowElRect.bottom) / 2 -
			line.top
		)).toBeLessThan(2);

		var timeGridRect = getBoundingRect('.fc-time-grid');
		if (isElWithinRtl(arrowEl)) {
			expect(Math.abs(
				arrowElRect.right - timeGridRect.right
			)).toBeLessThan(2);
		}
		else {
			expect(Math.abs(
				arrowElRect.left - timeGridRect.left
			)).toBeLessThan(2);
		}
	}
});
