describe('dayClick', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-05-27',
			selectable: false
		};
	});

	afterEach(function() {
		$('#cal').fullCalendar('destroy');
	});

	[ false, true ].forEach(function(isRTL) {
		describe('when isRTL is ' + isRTL, function() {
			beforeEach(function() {
				options.isRTL = isRTL;
			});
			[ false, true ].forEach(function(selectable) {
				describe('when selectable is ' + selectable, function() {
					beforeEach(function() {
						options.selectable = selectable;
					});

					describe('when in month view', function() {
						beforeEach(function() {
							options.defaultView = 'month';
						});
						it('fires correctly when clicking on a cell', function(done) {
							options.dayClick = function(date, jsEvent, view) {
								expect(moment.isMoment(date)).toEqual(true);
								expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
								expect(typeof view).toEqual('object'); // "
								expect(date.hasTime()).toEqual(false);
								expect(date).toEqualMoment('2014-05-07');
							};
							spyOn(options, 'dayClick').and.callThrough();
							$('#cal').fullCalendar(options);

							var dayCell = $('.fc-day:eq(10)'); // 2014-05-07 (regardless of isRTL)

							// for simulating the mousedown/mouseup/click (relevant for selectable)
							dayCell.simulate('drag', {
								callback: function() {
									expect(options.dayClick).toHaveBeenCalled();
									done();
								}
							});
						});
					});

					describe('when in agendaWeek view', function() {
						beforeEach(function() {
							options.defaultView = 'agendaWeek';
						});
						it('fires correctly when clicking on an all-day slot', function(done) {
							options.dayClick = function(date, jsEvent, view) {
								expect(moment.isMoment(date)).toEqual(true);
								expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
								expect(typeof view).toEqual('object'); // "
								expect(date.hasTime()).toEqual(false);
								expect(date).toEqualMoment('2014-05-28');
							};
							spyOn(options, 'dayClick').and.callThrough();
							$('#cal').fullCalendar(options);

							// 2014-05-28 (regardless of isRTL)
							var dayContent = $('.fc-agenda-view .fc-day-grid .fc-day:eq(3)');

							// for simulating the mousedown/mouseup/click (relevant for selectable)
							dayContent.simulate('drag', {
								callback: function() {
									expect(options.dayClick).toHaveBeenCalled();
									done();
								}
							});
						});
						it('fires correctly when clicking on a timed slot', function(done) {

							// make sure the click slot will be in scroll view
							options.contentHeight = 500;
							options.scrollTime = '07:00:00';

							options.dayClick = function(date, jsEvent, view) {
								expect(moment.isMoment(date)).toEqual(true);
								expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
								expect(typeof view).toEqual('object'); // "
								expect(date.hasTime()).toEqual(true);
								expect(date).toEqualMoment('2014-05-28T09:00:00');
							};
							spyOn(options, 'dayClick').and.callThrough();
							$('#cal').fullCalendar(options);

							// the middle is 2014-05-28T09:00:00 (regardless of isRTL)
							var slotRow = $('.fc-slats tr:eq(18) td:not(.fc-time)');

							// for simulating the mousedown/mouseup/click (relevant for selectable)
							slotRow.simulate('drag', {
								callback: function() {
									expect(options.dayClick).toHaveBeenCalled();
									done();
								}
							});
						});

						// issue 2217
						it('fires correctly when clicking on a timed slot, with minTime set', function(done) {

							// make sure the click slot will be in scroll view
							options.contentHeight = 500;
							options.scrollTime = '07:00:00';
							options.minTime = '02:00:00';

							options.dayClick = function(date, jsEvent, view) {
								expect(moment.isMoment(date)).toEqual(true);
								expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
								expect(typeof view).toEqual('object'); // "
								expect(date.hasTime()).toEqual(true);
								expect(date).toEqualMoment('2014-05-28T11:00:00');
							};
							spyOn(options, 'dayClick').and.callThrough();
							$('#cal').fullCalendar(options);

							// the middle is 2014-05-28T11:00:00 (regardless of isRTL)
							var slotRow = $('.fc-slats tr:eq(18) td:not(.fc-time)');

							// for simulating the mousedown/mouseup/click (relevant for selectable)
							slotRow.simulate('drag', {
								callback: function() {
									expect(options.dayClick).toHaveBeenCalled();
									done();
								}
							});
						});
					});
				});
			});
		});
	});

	describe('when touch', function() {

		it('fires correctly when simulated short drag on a cell', function(done) {
			options.dayClick = function(date, jsEvent, view) {
				expect(moment.isMoment(date)).toEqual(true);
				expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
				expect(typeof view).toEqual('object'); // "
				expect(date.hasTime()).toEqual(false);
				expect(date).toEqualMoment('2014-05-07');
			};
			spyOn(options, 'dayClick').and.callThrough();
			$('#cal').fullCalendar(options);

			var dayCell = $('.fc-day:eq(10)'); // 2014-05-07 (regardless of isRTL)

			// for simulating the mousedown/mouseup/click (relevant for selectable)
			dayCell.simulate('drag', {
				isTouch: true,
				callback: function() {
					expect(options.dayClick).toHaveBeenCalled();
					done();
				}
			});
		});

		it('won\'t fire if touch moves outside of date cell', function(done) {
			options.dayClick = function(date, jsEvent, view) {};
			spyOn(options, 'dayClick').and.callThrough();

			$('#cal').fullCalendar(options);

			var startCell = $('.fc-day[data-date="2014-05-07"]');
			var endCell = $('.fc-day[data-date="2014-05-08"]');

			startCell.simulate('drag', {
				// FYI, when debug:true, not a good representation because the minimal  delay is required
				// to recreate bug #3332
				isTouch: true,
				end: endCell,
				callback: function() {
					expect(options.dayClick).not.toHaveBeenCalled();
					done();
				}
			});
		});

		it('fires correctly when simulated click on a cell', function(done) {
			options.dayClick = function(date, jsEvent, view) {
				expect(moment.isMoment(date)).toEqual(true);
				expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
				expect(typeof view).toEqual('object'); // "
				expect(date.hasTime()).toEqual(false);
				expect(date).toEqualMoment('2014-05-07');
			};
			spyOn(options, 'dayClick').and.callThrough();
			$('#cal').fullCalendar(options);

			var dayCell = $('.fc-day:eq(10)'); // 2014-05-07 (regardless of isRTL)

			$.simulateTouchClick(dayCell);

			expect(options.dayClick).toHaveBeenCalled();
			done();
		});
	});

});
