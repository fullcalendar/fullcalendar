(function() {

[ 'height', 'contentHeight' ].forEach(function(heightProp) { describe(heightProp, function() {

	var options;
	var heightElm;
	var asAMethod;

	beforeEach(function() {
		affix('#cal');
		$('#cal').width(900);
		options = {
			defaultDate: '2014-08-01'
		};
	});

	function init(heightVal) {
		if (asAMethod) {
			$('#cal').fullCalendar(options);
			$('#cal').fullCalendar('option', heightProp, heightVal);
		}
		else {
			options[heightProp] = heightVal;
			$('#cal').fullCalendar(options);
		}

		if (heightProp === 'height') {
			heightElm = $('.fc');
		}
		else {
			heightElm = $('.fc-view');
		}
	}

	function expectHeight(heightVal) {
		var diff;
		if (heightProp === 'height') {
			// Firefox is reporting off-by-one difference sometimes, even when things are good :(
			diff = Math.abs(heightElm.outerHeight() - heightVal);
			expect(diff).toBeLessThan(2); // off-by-one or exactly the same
		}
		else {
			expect(heightElm.outerHeight()).toBe(heightVal);
		}
	}

	$.each({
		'as an init option': false,
		'as a method': true
	}, function(desc, bool) { describe(desc, function() {

		beforeEach(function() {
			asAMethod = bool;
		});

		describe('when in month view', function() {
			beforeEach(function() {
				options.defaultView = 'month';
			});

			describe('as a number, when there are no events', function() {
				it('should be the specified height, with no scrollbars', function() {
					init(600);
					expect(heightElm.outerHeight()).toBe(600);
					expect('.fc-day-grid-container').not.toHaveScrollbars();
				});
			});

			describe('as a number, when there is one tall row of events', function() {
				beforeEach(function() {
					options.events = repeatClone({ title: 'event', start: '2014-08-04' }, 9);
				});
				it('should take away height from other rows, but not do scrollbars', function() {
					init(600);
					var rows = $('.fc-day-grid .fc-row');
					var tallRow = rows.eq(1);
					var shortRows = rows.not(tallRow); // 0, 2, 3, 4, 5
					var shortHeight = shortRows.eq(0).outerHeight();

					expectHeight(600);

					shortRows.each(function(i, node) {
						var rowHeight = $(node).outerHeight();
						var diff = Math.abs(rowHeight - shortHeight);
						expect(diff).toBeLessThan(10); // all roughly the same
					});

					expect(tallRow.outerHeight()).toBeGreaterThan(shortHeight * 2); // much taller
					expect('.fc-day-grid-container').not.toHaveScrollbars();
				});
			});

			describe('as a number, when there are many tall rows of events', function() {
				beforeEach(function() {
					options.events = [].concat(
						repeatClone({ title: 'event0', start: '2014-07-28' }, 9),
						repeatClone({ title: 'event1', start: '2014-08-04' }, 9),
						repeatClone({ title: 'event2', start: '2014-08-11' }, 9),
						repeatClone({ title: 'event3', start: '2014-08-18' }, 9),
						repeatClone({ title: 'event4', start: '2014-08-25' }, 9),
						repeatClone({ title: 'event5', start: '2014-09-01' }, 9)
					);
				});
				it('height is correct and scrollbars show up', function() {
					init(600);
					expectHeight(600);
					expect($('.fc-day-grid-container')).toHaveScrollbars();
				});
			});

			describe('as "auto", when there are many tall rows of events', function() {
				beforeEach(function() {
					options.events = [].concat(
						repeatClone({ title: 'event0', start: '2014-07-28' }, 9),
						repeatClone({ title: 'event1', start: '2014-08-04' }, 9),
						repeatClone({ title: 'event2', start: '2014-08-11' }, 9),
						repeatClone({ title: 'event3', start: '2014-08-18' }, 9),
						repeatClone({ title: 'event4', start: '2014-08-25' }, 9),
						repeatClone({ title: 'event5', start: '2014-09-01' }, 9)
					);
				});
				it('height is really tall and there are no scrollbars', function() {
					init('auto');
					expect(heightElm.outerHeight()).toBeGreaterThan(1000); // pretty tall
					expect($('.fc-day-grid-container')).not.toHaveScrollbars();
				});
			});
		});

		[ 'basicWeek', 'basicDay' ].forEach(function(viewName) {
			describe('in ' + viewName + ' view', function() {
				beforeEach(function() {
					options.defaultView = viewName;
				});

				describe('as a number, when there are no events', function() {
					it('should be the specified height, with no scrollbars', function() {
						init(600);
						expectHeight(600);
						expect('.fc-day-grid-container').not.toHaveScrollbars();
					});
				});

				describe('as a number, when there are many events', function() {
					beforeEach(function() {
						options.events = repeatClone({ title: 'event', start: '2014-08-01' }, 100);
					});
					it('should have the correct height, with scrollbars', function() {
						init(600);
						expectHeight(600);
						expect('.fc-day-grid-container').toHaveScrollbars();
					});
				});

				describe('as "auto", when there are many events', function() {
					beforeEach(function() {
						options.events = repeatClone({ title: 'event', start: '2014-08-01' }, 100);
					});
					it('should be really tall with no scrollbars', function() {
						init('auto');
						expect(heightElm.outerHeight()).toBeGreaterThan(1000); // pretty tall
						expect('.fc-day-grid-container').not.toHaveScrollbars();
					});
				});
			});
		});

		[ 'agendaWeek', 'agendaDay' ].forEach(function(viewName) {
			describe('in ' + viewName + ' view', function() {
				beforeEach(function() {
					options.defaultView = viewName;
				});

				$.each({
					'with no all-day section': { allDaySlot: false },
					'with no all-day events': { },
					'with some all-day events': { events: repeatClone({ title: 'event', start: '2014-08-01' }, 6) }
				}, function(desc, moreOptions) {
					describe(desc, function() {
						beforeEach(function() {
							$.extend(options, moreOptions);
						});

						describe('as a number, with only a few slots', function() {
							beforeEach(function() {
								options.minTime = '06:00:00';
								options.maxTime = '10:00:00';
							});
							it('should be the correct height, with a horizontal rule to occupy space', function() {
								init(600);
								expectHeight(600);
								expect($('.fc-time-grid > hr')).toBeVisible();
							});
						});

						describe('as a number, with many slots', function() {
							beforeEach(function() {
								options.minTime = '00:00:00';
								options.maxTime = '24:00:00';
							});
							it('should be the correct height, with scrollbars and no filler hr', function() {
								init(600);
								expectHeight(600);
								expect($('.fc-time-grid-container')).toHaveScrollbars();
								expect($('.fc-time-grid > hr')).not.toBeVisible();
							});
						});

						describe('as "auto", with only a few slots', function() {
							beforeEach(function() {
								options.minTime = '06:00:00';
								options.maxTime = '10:00:00';
							});
							it('should be really short with no scrollbars nor horizontal rule', function() {
								init('auto');
								expect(heightElm.outerHeight()).toBeLessThan(500); // pretty short
								expect($('.fc-time-grid-container')).not.toHaveScrollbars();
								expect($('.fc-time-grid > hr')).not.toBeVisible();
							});
						});

						describe('as a "auto", with many slots', function() {
							beforeEach(function() {
								options.minTime = '00:00:00';
								options.maxTime = '24:00:00';
							});
							it('should be really tall with no scrollbars nor horizontal rule', function() {
								init('auto');
								expect(heightElm.outerHeight()).toBeGreaterThan(900); // pretty tall
								expect($('.fc-time-grid-container')).not.toHaveScrollbars();
								expect($('.fc-time-grid > hr')).not.toBeVisible();
							});
						});
					});
				});
			});
		});
	}); });
}); });


function repeatClone(srcObj, times) {
	var a = [];
	var i;

	for (i = 0; i < times; i++) {
		a.push($.extend({}, srcObj));
	}

	return a;
}

})();