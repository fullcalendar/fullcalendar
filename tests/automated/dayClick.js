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
							dayCell.simulate('drag-n-drop', { // for simulating the mousedown/mouseup/click (relevant for selectable)
								callback: function() {
									dayCell.simulate('click');
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
							var dayContent = $('.fc-agenda-allday .fc-day-content'); // the middle is 2014-05-28 (regardless of isRTL)
							dayContent.simulate('drag-n-drop', { // for simulating the mousedown/mouseup/click (relevant for selectable)
								callback: function() {
									dayContent.simulate('click');
									expect(options.dayClick).toHaveBeenCalled();
									done();
								}
							});
						});
						it('fires correctly when clicking on a timed slot', function(done) {
							options.dayClick = function(date, jsEvent, view) {
								expect(moment.isMoment(date)).toEqual(true);
								expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
								expect(typeof view).toEqual('object'); // "
								expect(date.hasTime()).toEqual(true);
								expect(date).toEqualMoment('2014-05-28T09:00:00');
							};
							spyOn(options, 'dayClick').and.callThrough();
							$('#cal').fullCalendar(options);
							var slotRow = $('tr.fc-slot18 td'); // the middle is 2014-05-28T09:00:00 (regardless of isRTL)
							slotRow.simulate('drag-n-drop', { // for simulating the mousedown/mouseup/click (relevant for selectable)
								callback: function() {
									slotRow.simulate('click');
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
});