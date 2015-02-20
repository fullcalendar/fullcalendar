
describe('background events', function() {

	// SEE ALSO: event-color.js

	var options;

	beforeEach(function() {
		options = {
			defaultDate: '2014-11-04',
			scrollTime: '00:00'
		};
		affix('#cal');
		$('#cal').width(1100);
	});

	describe('when in month view', function() {
		beforeEach(function() {
			options.defaultView = 'month';
		});

		describe('when LTR', function() {
			it('render correctly on a single day', function(done) {
				options.events = [ {
					title: 'hi',
					start: '2014-11-04',
					rendering: 'background'
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(1);
					expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(1);
					expect($('.fc-bgevent')).toBeLeftOf('.fc-day[data-date="2014-11-05"]');
					expect($('.fc-event').length).toBe(0);
					expect($('.fc-bgevent .fc-resizer').length).toBe(0); // can't resize
					done();
				};
				$('#cal').fullCalendar(options);
			});
			it('render correctly spanning multiple weeks', function(done) {
				options.events = [ {
					title: 'hi',
					start: '2014-11-04',
					end: '2014-11-11',
					rendering: 'background'
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(2);
					expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(1);
					expect($('.fc-day-grid .fc-row:eq(2) .fc-bgevent').length).toBe(1);
					expect($('.fc-bgevent:eq(0)')).toBeRightOf('.fc-day[data-date="2014-11-03"]');
					expect($('.fc-bgevent:eq(1)')).toBeLeftOf('.fc-day[data-date="2014-11-12"]');
					expect($('.fc-event').length).toBe(0);
					done();
				};
				$('#cal').fullCalendar(options);
			});
			it('render correctly when two span on top of each other', function(done) {
				options.events = [
					{
						start: '2014-11-04',
						end: '2014-11-07',
						rendering: 'background'
					},
					{
						start: '2014-11-05',
						end: '2014-11-08',
						rendering: 'background'
					}
				];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(2);
					expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(2);
					expect($('.fc-bgevent:eq(0)')).toBeRightOf('.fc-day[data-date="2014-11-02"]');
					expect($('.fc-bgevent:eq(1)')).toBeLeftOf('.fc-day[data-date="2014-11-08"]');
					expect($('.fc-event').length).toBe(0);
					done();
				};
				$('#cal').fullCalendar(options);
			});
			describe('when weekNumbers', function() {
				it('renders to right of week numbers', function(done) {
					options.weekNumbers = true;
					options.events = [ {
						start: '2014-11-02',
						end: '2014-11-09',
						rendering: 'background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(1);
						expect($('.fc-bgevent')).toBeRightOf('.fc-day-grid .fc-row:eq(1) .fc-week-number');
						expect($('.fc-event').length).toBe(0);
						done();
					};
					$('#cal').fullCalendar(options);
				});
			});
			it('renders "business hours" on whole days', function(done) {
				options.businessHours = true;
				options.eventAfterAllRender = function() {
					expect($('.fc-nonbusiness').length).toBe(12); // there are 6 weeks. 2 weekend days each
					done();
				};
				$('#cal').fullCalendar(options);
			});
		});

		describe('when RTL', function() {
			beforeEach(function() {
				options.isRTL = true;
			});
			it('render correctly on a single day', function(done) {
				options.events = [ {
					title: 'hi',
					start: '2014-11-04',
					rendering: 'background'
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(1);
					expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(1);
					expect($('.fc-bgevent')).toBeRightOf('.fc-day[data-date="2014-11-06"]');
					expect($('.fc-event').length).toBe(0);
					done();
				};
				$('#cal').fullCalendar(options);
			});
			it('render correctly spanning multiple weeks', function(done) {
				options.events = [ {
					title: 'hi',
					start: '2014-11-04',
					end: '2014-11-11',
					rendering: 'background'
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(2);
					expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(1);
					expect($('.fc-day-grid .fc-row:eq(2) .fc-bgevent').length).toBe(1);
					expect($('.fc-bgevent:eq(0)')).toBeLeftOf('.fc-day[data-date="2014-11-02"]');
					expect($('.fc-bgevent:eq(1)')).toBeRightOf('.fc-day[data-date="2014-11-12"]');
					expect($('.fc-event').length).toBe(0);
					done();
				};
				$('#cal').fullCalendar(options);
			});
			describe('when weekNumbers', function() {
				it('renders to left of week numbers', function(done) {
					options.weekNumbers = true;
					options.events = [ {
						start: '2014-11-02',
						end: '2014-11-09',
						rendering: 'background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(1);
						expect($('.fc-bgevent')).toBeLeftOf('.fc-day-grid .fc-row:eq(1) .fc-week-number span');
						expect($('.fc-event').length).toBe(0);
						done();
					};
					$('#cal').fullCalendar(options);
				});
			});
		});

		describe('when inverse', function() {

			describe('when LTR', function() {
				it('render correctly on a single day', function(done) {
					options.events = [ {
						title: 'hi',
						start: '2014-11-04',
						rendering: 'inverse-background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(7);
						expect($('.fc-day-grid .fc-row:eq(0) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(2);
						expect($('.fc-day-grid .fc-row:eq(2) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(3) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(4) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(5) .fc-bgevent').length).toBe(1);

						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(0)'))
							.toBeLeftOf('.fc-day[data-date="2014-11-05"]');
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(1)'))
							.toBeRightOf('.fc-day[data-date="2014-11-03"]');

						expect($('.fc-event').length).toBe(0);
						done();
					};
					$('#cal').fullCalendar(options);
				});
				it('render correctly spanning multiple weeks', function(done) {
					options.events = [ {
						title: 'hi',
						start: '2014-11-04',
						end: '2014-11-11',
						rendering: 'inverse-background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(6);
						expect($('.fc-day-grid .fc-row:eq(0) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(2) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(3) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(4) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(5) .fc-bgevent').length).toBe(1);

						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(0)'))
							.toBeLeftOf('.fc-day[data-date="2014-11-05"]');

						expect($('.fc-day-grid .fc-row:eq(2) .fc-bgevent:eq(0)'))
							.toBeRightOf('.fc-day[data-date="2014-11-09"]');

						expect($('.fc-event').length).toBe(0);
						done();
					};
					$('#cal').fullCalendar(options);
				});
				it('render correctly when starts before start of month', function(done) {
					options.events = [ {
						start: '2014-10-24',
						end: '2014-11-06',
						rendering: 'inverse-background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(5);
						expect($('.fc-day-grid .fc-row:eq(0) .fc-bgevent').length).toBe(0);
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(2) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(3) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(4) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(5) .fc-bgevent').length).toBe(1);

						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent'))
							.toBeRightOf('.fc-day[data-date="2014-11-04"]');

						done();
					};
					$('#cal').fullCalendar(options);
				});
				it('render correctly when ends after end of month', function(done) {
					options.events = [ {
						start: '2014-11-27',
						end: '2014-12-08',
						rendering: 'inverse-background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(5);
						expect($('.fc-day-grid .fc-row:eq(0) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(2) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(3) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(4) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(5) .fc-bgevent').length).toBe(0);

						expect($('.fc-day-grid .fc-row:eq(4) .fc-bgevent'))
							.toBeLeftOf('.fc-day[data-date="2014-11-28"]');

						done();
					};
					$('#cal').fullCalendar(options);
				});
				it('render correctly with two related events, in reverse order', function(done) {
					options.events = [
						{
							id: 'hi',
							start: '2014-11-06',
							rendering: 'inverse-background'
						},
						{
							id: 'hi',
							start: '2014-11-04',
							rendering: 'inverse-background'
						}
					];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(8);
						expect($('.fc-day-grid .fc-row:eq(0) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(3);
						expect($('.fc-day-grid .fc-row:eq(2) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(3) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(4) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(5) .fc-bgevent').length).toBe(1);

						/* order in DOM is reversed
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(0)'))
							.toBeLeftOf('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(1)');
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(1)'))
							.toBeLeftOf('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(2)');*/

						done();
					};
					$('#cal').fullCalendar(options);
				});
			});

			describe('when RTL', function() {
				beforeEach(function() {
					options.isRTL = true;
				});
				it('render correctly on a single day', function(done) {
					options.events = [ {
						title: 'hi',
						start: '2014-11-04',
						rendering: 'inverse-background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(7);
						expect($('.fc-day-grid .fc-row:eq(0) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent').length).toBe(2);
						expect($('.fc-day-grid .fc-row:eq(2) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(3) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(4) .fc-bgevent').length).toBe(1);
						expect($('.fc-day-grid .fc-row:eq(5) .fc-bgevent').length).toBe(1);

						/* order in DOM is reversed
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(0)'))
							.toBeLeftOf('.fc-day[data-date="2014-11-03"]');
						expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(1)'))
							.toBeRightOf('.fc-day[data-date="2014-11-05"]');*/

						done();
					};
					$('#cal').fullCalendar(options);
				});
			});
		});

		describe('when in month view', function() {
			it('can be activated when rendering set on the source', function(done) {
				options.defaultView = 'month';
				options.eventSources = [ {
					rendering: 'background',
					events: [ {
						start: '2014-11-04'
					} ]
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(1);
					expect($('.fc-event').length).toBe(0);
					done();
				};
				$('#cal').fullCalendar(options);
			});
		});

		describe('when in agenda view and timed event', function() {
			it('can be activated when rendering set on the source', function(done) {
				options.defaultView = 'agendaWeek';
				options.eventSources = [ {
					rendering: 'background',
					events: [ {
						start: '2014-11-04T01:00:00'
					} ]
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(1);
					expect($('.fc-event').length).toBe(0);
					done();
				};
				$('#cal').fullCalendar(options);
			});
		});
	});

	describe('when in agendaWeek view', function() {
		beforeEach(function() {
			options.defaultView = 'agendaWeek';
		});

		describe('when LTR', function(done) {
			it('render correctly on one day', function(done) {
				options.events = [ {
					start: '2014-11-04T01:00:00',
					end: '2014-11-04T05:00:00',
					rendering: 'background'
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(1);
					expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(2) .fc-bgevent').length).toBe(1); // column 2
					expect($('.fc-bgevent')).toBeBelow('.fc-slats tr:eq(0)'); // should be 1am (eq(1)) but FF cmplaning
					expect($('.fc-bgevent')).toBeAbove('.fc-slats tr:eq(10)'); // 5am
					expect($('.fc-event').length).toBe(0);
					expect($('.fc-bgevent .fc-resizer').length).toBe(0); // can't resize
					done();
				};
				$('#cal').fullCalendar(options);
			});
			it('render correctly spanning multiple days', function(done) {
				options.events = [ {
					start: '2014-11-04T01:00:00',
					end: '2014-11-05T05:00:00',
					rendering: 'background'
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(2);
					expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(2) .fc-bgevent').length).toBe(1); // column 2
					expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(3) .fc-bgevent').length).toBe(1); // column 3
					// TODO: maybe check y coords
					done();
				};
				$('#cal').fullCalendar(options);
			});
			it('render correctly when two span on top of each other', function(done) {
				options.events = [
					{
						start: '2014-11-04T01:00:00',
						end: '2014-11-05T05:00:00',
						rendering: 'background'
					},
					{
						start: '2014-11-04T03:00:00',
						end: '2014-11-05T08:00:00',
						rendering: 'background'
					}
				];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(4);
					expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(2) .fc-bgevent').length).toBe(2); // column 2
					expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(3) .fc-bgevent').length).toBe(2); // column 3
					// TODO: maybe check y coords
					done();
				};
				$('#cal').fullCalendar(options);
			});
			describe('when businessHours', function() {
				it('renders correctly if assumed default', function() {
					options.businessHours = true;
					$('#cal').fullCalendar(options);
					expect($('.fc-day-grid .fc-nonbusiness').length).toBe(2); // whole days in the day area
					expect($('.fc-time-grid .fc-nonbusiness').length).toBe(12); // strips of gray on the timed area
				});
				it('renders correctly if custom', function() {
					options.businessHours = {
						start: '02:00',
						end: '06:00',
						dow: [ 1, 2, 3, 4 ] // Mon-Thu
					};
					$('#cal').fullCalendar(options);

					// whole days
					expect($('.fc-day-grid .fc-nonbusiness').length).toBe(2); // each multi-day stretch is one element

					// time area
					expect($('.fc-time-grid .fc-nonbusiness').length).toBe(11);
					var containerEls = $('.fc-time-grid .fc-bgevent-skeleton td:not(.fc-axis)'); // background columns
					expect(containerEls.eq(0).find('.fc-nonbusiness').length).toBe(1);
					expect(containerEls.eq(1).find('.fc-nonbusiness').length).toBe(2);
					expect(containerEls.eq(2).find('.fc-nonbusiness').length).toBe(2);
					expect(containerEls.eq(3).find('.fc-nonbusiness').length).toBe(2);
					expect(containerEls.eq(4).find('.fc-nonbusiness').length).toBe(2);
					expect(containerEls.eq(5).find('.fc-nonbusiness').length).toBe(1);
					expect(containerEls.eq(6).find('.fc-nonbusiness').length).toBe(1);
				});
			});
		});
		describe('when RTL', function() {
			beforeEach(function() {
				options.isRTL = true;
			});
			it('render correctly on one day', function(done) {
				options.events = [ {
					start: '2014-11-04T01:00:00',
					end: '2014-11-04T05:00:00',
					rendering: 'background'
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(1);
					expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(4) .fc-bgevent').length).toBe(1); // column 4
					expect($('.fc-bgevent')).toBeBelow('.fc-slats tr:eq(0)'); // should be 1am (eq(1)) but FF cmplaining
					expect($('.fc-bgevent')).toBeAbove('.fc-slats tr:eq(10)'); // 5am
					done();
				};
				$('#cal').fullCalendar(options);
			});
			it('render correctly spanning multiple days', function(done) {
				options.events = [ {
					start: '2014-11-04T01:00:00',
					end: '2014-11-05T05:00:00',
					rendering: 'background'
				} ];
				options.eventAfterAllRender = function() {
					expect($('.fc-bgevent').length).toBe(2);
					expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(3) .fc-bgevent').length).toBe(1); // column 3
					expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(4) .fc-bgevent').length).toBe(1); // column 4
					done();
				};
				$('#cal').fullCalendar(options);
			});
			describe('when businessHours', function() {
				it('renders correctly if custom', function() {
					options.businessHours = {
						start: '02:00',
						end: '06:00',
						dow: [ 1, 2, 3, 4 ] // Mon-Thu
					};
					$('#cal').fullCalendar(options);

					// whole days
					expect($('.fc-day-grid .fc-nonbusiness').length).toBe(2); // each stretch of days is one element

					// time area
					expect($('.fc-time-grid .fc-nonbusiness').length).toBe(11);
					var containerEls = $('.fc-time-grid .fc-bgevent-skeleton td:not(.fc-axis)'); // background columns
					expect(containerEls.eq(0).find('.fc-nonbusiness').length).toBe(1);
					expect(containerEls.eq(1).find('.fc-nonbusiness').length).toBe(1);
					expect(containerEls.eq(2).find('.fc-nonbusiness').length).toBe(2);
					expect(containerEls.eq(3).find('.fc-nonbusiness').length).toBe(2);
					expect(containerEls.eq(4).find('.fc-nonbusiness').length).toBe(2);
					expect(containerEls.eq(5).find('.fc-nonbusiness').length).toBe(2);
					expect(containerEls.eq(6).find('.fc-nonbusiness').length).toBe(1);
				});
			});
		});

		describe('when inverse', function() {

			describe('when LTR', function() {

				it('render correctly on one day', function(done) {
					options.events = [ {
						start: '2014-11-04T01:00:00',
						end: '2014-11-04T05:00:00',
						rendering: 'inverse-background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(8);
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(0) .fc-bgevent').length).toBe(1); // column 0
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(1) .fc-bgevent').length).toBe(1); // column 1
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(2) .fc-bgevent').length).toBe(2); // column 2
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(3) .fc-bgevent').length).toBe(1); // column 3
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(4) .fc-bgevent').length).toBe(1); // column 4
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(5) .fc-bgevent').length).toBe(1); // column 5
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(6) .fc-bgevent').length).toBe(1); // column 6
						// TODO: maybe check y coords
						done();
					};
					$('#cal').fullCalendar(options);
				});

				it('render correctly spanning multiple days', function(done) {
					options.events = [ {
						start: '2014-11-04T01:00:00',
						end: '2014-11-05T05:00:00',
						rendering: 'inverse-background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(7);
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(0) .fc-bgevent').length).toBe(1); // column 0
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(1) .fc-bgevent').length).toBe(1); // column 1
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(2) .fc-bgevent').length).toBe(1); // column 2
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(3) .fc-bgevent').length).toBe(1); // column 3
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(4) .fc-bgevent').length).toBe(1); // column 4
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(5) .fc-bgevent').length).toBe(1); // column 5
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(6) .fc-bgevent').length).toBe(1); // column 6
						// TODO: maybe check y coords
						done();
					};
					$('#cal').fullCalendar(options);
				});

				it('render correctly when starts before start of week', function(done) {
					options.events = [ {
						start: '2014-10-30T01:00:00',
						end: '2014-11-04T05:00:00',
						rendering: 'inverse-background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(5);
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(0) .fc-bgevent').length).toBe(0); // column 0
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(1) .fc-bgevent').length).toBe(0); // column 1
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(2) .fc-bgevent').length).toBe(1); // column 2
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(3) .fc-bgevent').length).toBe(1); // column 3
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(4) .fc-bgevent').length).toBe(1); // column 4
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(5) .fc-bgevent').length).toBe(1); // column 5
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(6) .fc-bgevent').length).toBe(1); // column 6
						// TODO: maybe check y coords
						done();
					};
					$('#cal').fullCalendar(options);
				});

				it('render correctly when ends after end of week', function(done) {
					options.events = [ {
						start: '2014-11-04T01:00:00',
						end: '2014-11-12T05:00:00',
						rendering: 'inverse-background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(3);
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(0) .fc-bgevent').length).toBe(1); // column 0
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(1) .fc-bgevent').length).toBe(1); // column 1
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(2) .fc-bgevent').length).toBe(1); // column 2
						// TODO: maybe check y coords
						done();
					};
					$('#cal').fullCalendar(options);
				});

				it('render correctly with two related events, in reverse order', function(done) {
					options.events = [
						{
							id: 'hello',
							start: '2014-11-05T01:00:00',
							end: '2014-11-05T05:00:00',
							rendering: 'inverse-background'
						},
						{
							id: 'hello',
							start: '2014-11-03T01:00:00',
							end: '2014-11-03T05:00:00',
							rendering: 'inverse-background'
						}
					];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(9);
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(0) .fc-bgevent').length).toBe(1); // column 0
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(1) .fc-bgevent').length).toBe(2); // column 1
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(2) .fc-bgevent').length).toBe(1); // column 2
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(3) .fc-bgevent').length).toBe(2); // column 3
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(4) .fc-bgevent').length).toBe(1); // column 4
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(5) .fc-bgevent').length).toBe(1); // column 5
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(6) .fc-bgevent').length).toBe(1); // column 6
						// TODO: maybe check y coords
						done();
					};
					$('#cal').fullCalendar(options);
				});
			});

			describe('when RTL', function() {
				beforeEach(function() {
					options.isRTL = true;
				});
				it('render correctly on one day', function(done) {
					options.events = [ {
						start: '2014-11-04T01:00:00',
						end: '2014-11-04T05:00:00',
						rendering: 'inverse-background'
					} ];
					options.eventAfterAllRender = function() {
						expect($('.fc-bgevent').length).toBe(8);
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(0) .fc-bgevent').length).toBe(1); // column 0
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(1) .fc-bgevent').length).toBe(1); // column 1
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(2) .fc-bgevent').length).toBe(1); // column 2
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(3) .fc-bgevent').length).toBe(1); // column 3
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(4) .fc-bgevent').length).toBe(2); // column 4
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(5) .fc-bgevent').length).toBe(1); // column 5
						expect($('.fc-bgevent-skeleton td:not(.fc-axis):eq(6) .fc-bgevent').length).toBe(1); // column 6
						// TODO: maybe check y coords
						done();
					};
					$('#cal').fullCalendar(options);
				});
			});
		});

		it('can have custom Event Object color', function(done) {
			options.events = [ {
				start: '2014-11-04T01:00:00',
				rendering: 'background',
				color: 'red'
			} ];
			options.eventAfterAllRender = function() {
				expect($('.fc-bgevent').css('background-color')).toMatch(RED_REGEX);
				done();
			};
			$('#cal').fullCalendar(options);
		});

		it('can have custom Event Object backgroundColor', function(done) {
			options.events = [ {
				start: '2014-11-04T01:00:00',
				rendering: 'background',
				backgroundColor: 'red'
			} ];
			options.eventAfterAllRender = function() {
				expect($('.fc-bgevent').css('background-color')).toMatch(RED_REGEX);
				done();
			};
			$('#cal').fullCalendar(options);
		});

		it('can have custom Event Source color', function(done) {
			options.eventSources = [ {
				color: 'red',
				events: [ {
					start: '2014-11-04T01:00:00',
					rendering: 'background'
				} ]
			} ];
			options.eventAfterAllRender = function() {
				expect($('.fc-bgevent').css('background-color')).toMatch(RED_REGEX);
				done();
			};
			$('#cal').fullCalendar(options);
		});

		it('can have custom Event Source backgroundColor', function(done) {
			options.eventSources = [ {
				backgroundColor: 'red',
				events: [ {
					start: '2014-11-04T01:00:00',
					rendering: 'background'
				} ]
			} ];
			options.eventAfterAllRender = function() {
				expect($('.fc-bgevent').css('background-color')).toMatch(RED_REGEX);
				done();
			};
			$('#cal').fullCalendar(options);
		});

		it('is affected by global eventColor', function(done) {
			options.eventColor = 'red';
			options.eventSources = [ {
				events: [ {
					start: '2014-11-04T01:00:00',
					rendering: 'background'
				} ]
			} ];
			options.eventAfterAllRender = function() {
				expect($('.fc-bgevent').css('background-color')).toMatch(RED_REGEX);
				done();
			};
			$('#cal').fullCalendar(options);
		});

		it('is affected by global eventBackgroundColor', function(done) {
			options.eventBackgroundColor = 'red';
			options.eventSources = [ {
				events: [ {
					start: '2014-11-04T01:00:00',
					rendering: 'background'
				} ]
			} ];
			options.eventAfterAllRender = function() {
				expect($('.fc-bgevent').css('background-color')).toMatch(RED_REGEX);
				done();
			};
			$('#cal').fullCalendar(options);
		});
	});
});