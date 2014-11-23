describe('select callback', function() {

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-05-25',
			selectable: true
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
			describe('when in month view', function() {
				beforeEach(function() {
					options.defaultView = 'month';
				});
				it('gets fired correctly when the user selects cells', function(done) {
					options.select = function(start, end, jsEvent, view) {
						expect(moment.isMoment(start)).toEqual(true);
						expect(moment.isMoment(end)).toEqual(true);
						expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
						expect(typeof view).toEqual('object'); // "
						expect(start.hasTime()).toEqual(false);
						expect(end.hasTime()).toEqual(false);
						expect(start).toEqualMoment('2014-04-28');
						expect(end).toEqualMoment('2014-05-07');
					};
					spyOn(options, 'select').and.callThrough();
					$('#cal').fullCalendar(options);
					$('.fc-day[data-date="2014-04-28"]').simulate('drag-n-drop', {
						dropTarget: '.fc-day[data-date="2014-05-06"]',
						callback: function() {
							expect(options.select).toHaveBeenCalled();
							done();
						}
					});
				});
				it('gets fired correctly when the user selects just one cell', function(done) {
					options.select = function(start, end, jsEvent, view) {
						expect(moment.isMoment(start)).toEqual(true);
						expect(moment.isMoment(end)).toEqual(true);
						expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
						expect(typeof view).toEqual('object'); // "
						expect(start.hasTime()).toEqual(false);
						expect(end.hasTime()).toEqual(false);
						expect(start).toEqualMoment('2014-04-28');
						expect(end).toEqualMoment('2014-04-29');
					};
					spyOn(options, 'select').and.callThrough();
					$('#cal').fullCalendar(options);
					$('.fc-day[data-date="2014-04-28"]').simulate('drag-n-drop', {
						dropTarget: '.fc-day[data-date="2014-04-28"]',
						callback: function() {
							expect(options.select).toHaveBeenCalled();
							done();
						}
					});
				});
			});

			describe('when in agendaWeek view', function() {
				beforeEach(function() {
					options.defaultView = 'agendaWeek';
				});
				describe('when selecting all-day slots', function() {
					it('gets fired correctly when the user selects cells', function(done) {
						options.select = function(start, end, jsEvent, view) {
							expect(moment.isMoment(start)).toEqual(true);
							expect(moment.isMoment(end)).toEqual(true);
							expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
							expect(typeof view).toEqual('object'); // "
							expect(start.hasTime()).toEqual(false);
							expect(end.hasTime()).toEqual(false);
							expect(start).toEqualMoment('2014-05-28');
							expect(end).toEqualMoment('2014-05-30');
						};
						spyOn(options, 'select').and.callThrough();
						$('#cal').fullCalendar(options);
						$('.fc-agenda-view .fc-day-grid .fc-day:eq(3)').simulate('drag-n-drop', { // will be 2014-05-28 for LTR and RTL
							dx: $('.fc-sun').outerWidth() * (isRTL ? -1 : 1), // the width of one column
							callback: function() {
								expect(options.select).toHaveBeenCalled();
								done();
							}
						});
					});
					it('gets fired correctly when the user selects a single cell', function(done) {
						options.select = function(start, end, jsEvent, view) {
							expect(moment.isMoment(start)).toEqual(true);
							expect(moment.isMoment(end)).toEqual(true);
							expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
							expect(typeof view).toEqual('object'); // "
							expect(start.hasTime()).toEqual(false);
							expect(end.hasTime()).toEqual(false);
							expect(start).toEqualMoment('2014-05-28');
							expect(end).toEqualMoment('2014-05-29');
						};
						spyOn(options, 'select').and.callThrough();
						$('#cal').fullCalendar(options);
						$('.fc-agenda-view .fc-day-grid .fc-day:eq(3)').simulate('drag-n-drop', { // will be 2014-05-28 for LTR and RTL
							callback: function() {
								expect(options.select).toHaveBeenCalled();
								done();
							}
						});
					});
				});
				describe('when selecting timed slots', function(done) {
					it('gets fired correctly when the user selects slots', function(done) {
						options.select = function(start, end, jsEvent, view) {
							expect(moment.isMoment(start)).toEqual(true);
							expect(moment.isMoment(end)).toEqual(true);
							expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
							expect(typeof view).toEqual('object'); // "
							expect(start.hasTime()).toEqual(true);
							expect(end.hasTime()).toEqual(true);
							expect(start).toEqualMoment('2014-05-28T09:00:00');
							expect(end).toEqualMoment('2014-05-28T10:30:00');
						};
						spyOn(options, 'select').and.callThrough();
						$('#cal').fullCalendar(options);
						$('.fc-slats tr:eq(18) td:not(.fc-time)').simulate('drag-n-drop', { // middle will be 2014-05-28T09:00:00
							dy: $('.fc-slats tr:eq(18)').outerHeight() * 2, // move down two slots
							callback: function() {
								expect(options.select).toHaveBeenCalled();
								done();
							}
						});
					});
					it('gets fired correctly when the user selects slots in a different day', function(done) {
						options.select = function(start, end, jsEvent, view) {
							expect(moment.isMoment(start)).toEqual(true);
							expect(moment.isMoment(end)).toEqual(true);
							expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
							expect(typeof view).toEqual('object'); // "
							expect(start.hasTime()).toEqual(true);
							expect(end.hasTime()).toEqual(true);
							expect(start).toEqualMoment('2014-05-28T09:00:00');
							expect(end).toEqualMoment('2014-05-29T10:30:00');
						};
						spyOn(options, 'select').and.callThrough();
						$('#cal').fullCalendar(options);
						$('.fc-slats tr:eq(18) td:not(.fc-time)').simulate('drag-n-drop', { // middle will be 2014-05-28T09:00:00
							dx: $('.fc-day-header:first').outerWidth() * .9 * (isRTL ? -1 : 1), // one day ahead
							dy: $('.fc-slats tr:eq(18)').outerHeight() * 2, // move down two slots
							callback: function() {
								expect(options.select).toHaveBeenCalled();
								done();
							}
						});
					});
					it('gets fired correctly when the user selects a single slot', function(done) {
						options.select = function(start, end, jsEvent, view) {
							expect(moment.isMoment(start)).toEqual(true);
							expect(moment.isMoment(end)).toEqual(true);
							expect(typeof jsEvent).toEqual('object'); // TODO: more descrimination
							expect(typeof view).toEqual('object'); // "
							expect(start.hasTime()).toEqual(true);
							expect(end.hasTime()).toEqual(true);
							expect(start).toEqualMoment('2014-05-28T09:00:00');
							expect(end).toEqualMoment('2014-05-28T09:30:00');
						};
						spyOn(options, 'select').and.callThrough();
						$('#cal').fullCalendar(options);
						$('.fc-slats tr:eq(18) td:not(.fc-time)').simulate('drag-n-drop', { // middle will be 2014-05-28T09:00:00
							callback: function() {
								expect(options.select).toHaveBeenCalled();
								done();
							}
						});
					});
				});
			});
		});
	});
});