
describe('eventLimit popover', function() {

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultView: 'month',
			defaultDate: '2014-08-01',
			eventLimit: 3,
			events: [
				{ title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
				{ title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
				{ title: 'event3', start: '2014-07-29', className: 'event3' },
				{ title: 'event4', start: '2014-07-29', className: 'event4' }
			],
			dragScroll: false, // don't do autoscrolling while dragging. close quarters in PhantomJS
			popoverViewportConstrain: false, // because PhantomJS window is small, don't do smart repositioning
			handleWindowResize: false // because showing the popover causes scrollbars and fires resize
		};
	});

	function init() {
		$('#cal').fullCalendar(options);
		$('.fc-more').simulate('click');
	}

	[ 'month', 'basicWeek', 'agendaWeek' ].forEach(function(viewName) {

		describe('when in ' + viewName + ' view', function() {

			beforeEach(function() {
				options.defaultView = viewName;
			});

			it('aligns horizontally with left edge of cell if LTR', function() {
				options.isRTL = false;
				init();
				var cellLeft = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis):eq(2)').offset().left;
				var popoverLeft = $('.fc-more-popover').offset().left;
				var diff = Math.abs(cellLeft - popoverLeft);
				expect(diff).toBeLessThan(2);
			});

			it('aligns horizontally with left edge of cell if RTL', function() {
				options.isRTL = true;
				init();
				var cell = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis):eq(4)');
				var cellRight = cell.offset().left + cell.outerWidth();
				var popover = $('.fc-more-popover');
				var popoverRight = popover.offset().left + popover.outerWidth();
				var diff = Math.abs(cellRight - popoverRight);
				expect(diff).toBeLessThan(2);
			});
		});
	});

	describe('when in month view', function() {

		beforeEach(function() {
			options.defaultView = 'month';
		});

		it('aligns with top of cell', function() {
			init();
			var popoverTop = $('.fc-more-popover').offset().top;
			var rowTop = $('.fc-day-grid .fc-row:eq(0)').offset().top;
			var diff = Math.abs(popoverTop - rowTop);
			expect(diff).toBeLessThan(2);
		});

		it('works with background events', function() {
			options.events.push({
				start: '2014-07-29',
				rendering: 'background'
			});
			init();
			expect($('.fc-more-popover .fc-event').length).toBeGreaterThan(1);
			expect($('.fc-more-popover .fc-bgevent').length).toBe(0);
		});

		it('works with events that have invalid end times', function() {
			options.events = [
				{ title: 'event1', start: '2014-07-29', end: '2014-07-29' },
				{ title: 'event2', start: '2014-07-29', end: '2014-07-28' },
				{ title: 'event3', start: '2014-07-29T00:00:00', end: '2014-07-29T00:00:00' },
				{ title: 'event4', start: '2014-07-29T00:00:00', end: '2014-07-28T23:00:00' }
			];
			init();
			expect($('.fc-more-popover .fc-event').length).toBe(4);
		});

		// issue 2385
		it('orders events correctly regardless of ID', function() {
			options.defaultDate = '2012-03-22';
			options.eventLimit = 3;
			options.events = [
				{
					id: '39957',
					title: 'event01',
					start: '2012-03-22T11:00:00',
					end: '2012-03-22T11:30:00',
					allDay: false
				},
				{
					id: '40607',
					title: 'event02',
					start: '2012-03-22T16:15:00',
					end: '2012-03-22T16:30:00',
					allDay: false
				},
				{
					id: '40760',
					title: 'event03',
					start: '2012-03-22T16:00:00',
					end: '2012-03-22T16:15:00',
					allDay: false
				},
				{
					id: '41284',
					title: 'event04',
					start: '2012-03-22T19:00:00',
					end: '2012-03-22T19:15:00',
					allDay: false
				},
				{
					id: '41645',
					title: 'event05',
					start: '2012-03-22T11:30:00',
					end: '2012-03-22T12:00:00',
					allDay: false
				},
				{
					id: '41679',
					title: 'event07',
					start: '2012-03-22T12:00:00',
					end: '2012-03-22T12:15:00',
					allDay: false
				},
				{
					id: '42246',
					title: 'event08',
					start: '2012-03-22T16:45:00',
					end: '2012-03-22T17:00:00',
					allDay: false
				}
			];
			init();

			var titles = $('.fc-more-popover .fc-event .fc-title').map(function() {
				return $(this).text();
			}).get();

			expect(titles).toEqual([
				'event01', 'event05', 'event07', 'event03', 'event02', 'event08', 'event04'
			]);
		});
	});

	[ 'basicWeek', 'agendaWeek' ].forEach(function(viewName) {

		describe('when in ' + viewName + ' view', function() {

			beforeEach(function() {
				options.defaultView = viewName;
			});

			it('aligns with top of header', function() {
				init();
				var popoverTop = $('.fc-more-popover').offset().top;
				var headTop = $('.fc-view > table > thead .fc-row').offset().top;
				var diff = Math.abs(popoverTop - headTop);
				expect(diff).toBeLessThan(2);
			});
		});
	});

	// TODO: somehow test how the popover does to the edge of any scroll container

	it('closes when user clicks the X', function() {
		init();
		expect($('.fc-more-popover')).toBeVisible();
		$('.fc-more-popover .fc-close')
			.simulate('click')
			.trigger('click'); // needed this for IE8 for some reason
		expect($('.fc-more-popover')).not.toBeVisible();
	});

	it('doesn\'t close when user clicks somewhere inside of the popover', function() {
		init();
		expect($('.fc-more-popover')).toBeVisible();
		expect($('.fc-more-popover .fc-header')).toBeInDOM();
		$('.fc-more-popover .fc-header').simulate('mousedown').simulate('click');
		expect($('.fc-more-popover')).toBeVisible();
	});

	it('closes when user clicks outside of the popover', function() {
		init();
		expect($('.fc-more-popover')).toBeVisible();
		$('body').simulate('mousedown').simulate('click');
		expect($('.fc-more-popover')).not.toBeVisible();
	});

	it('has the correct event contents', function() {
		init();
		expect($('.fc-more-popover .event1')).toBeMatchedBy('.fc-not-start.fc-end');
		expect($('.fc-more-popover .event2')).toBeMatchedBy('.fc-start.fc-not-end');
		expect($('.fc-more-popover .event3')).toBeMatchedBy('.fc-start.fc-end');
		expect($('.fc-more-popover .event4')).toBeMatchedBy('.fc-start.fc-end');
	});


	describe('when dragging events out', function() {

		beforeEach(function() {
			options.editable = true;
		});

		describe('when dragging an all-day event to a different day', function() {

			it('should have the new day and remain all-day', function(done) {

				options.eventDrop = function(event) {
					expect(event.start).toEqualMoment('2014-07-28');
					expect(event.allDay).toBe(true);
					done();
				};
				init();

				setTimeout(function() { // simulate was getting confused about which thing was being clicked :(
					$('.fc-more-popover .event4').simulate('drag-n-drop', {
						dragTarget: $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis):eq(1)') // one day before
					});
				}, 0);
			});
		});

		describe('when dragging a timed event to a whole day', function() {

			it('should move to new day but maintain its time', function(done) {

				options.events.push({ // add timed event
					title: 'event5',
					start: '2014-07-29T13:00:00',
					className: 'event5'
				});
				options.eventDrop = function(event) {
					expect(event.start).toEqualMoment('2014-07-28T13:00:00');
					expect(event.allDay).toBe(false);
					done();
				};
				init();

				setTimeout(function() { // simulate was getting confused about which thing was being clicked :(
					$('.fc-more-popover .event5').simulate('drag-n-drop', {
						dragTarget: $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis):eq(1)') // one day before
					});
				}, 0);
			});
		});

		describe('when dragging a whole day event to a timed slot', function() {

			it('should assume the new time, with a cleared end', function(done) {

				options.defaultView = 'agendaWeek';
				options.scrollTime = '00:00:00';
				options.eventDrop = function(event) {
					expect(event.start).toEqualMoment('2014-07-30T03:00:00');
					expect(event.allDay).toBe(false);
					done();
				};
				init();

				setTimeout(function() { // simulate was getting confused about which thing was being clicked :(
					$('.fc-more-popover .event4').simulate('drag-n-drop', {
						dragTarget: $('.fc-slats tr:eq(6)') // the middle will be 7/30, 3:00am
					});
				}, 0);
			});
		});

		describe('when a single-day event isn\'t dragged out all the way', function() {

			it('shouldn\'t do anything', function(done) {

				options.eventDragStop = function() {
					setTimeout(function() { // try to wait until drag is over. eventDrop won't fire BTW
						expect($('.fc-more-popover')).toBeInDOM();
						done();
					},0);
				};
				init();

				setTimeout(function() { // simulate was getting confused about which thing was being clicked :(
					$('.fc-more-popover .event1 .fc-title').simulate('drag-n-drop', {
						dx: 20
					});
				}, 0);
			});
		});

	});

});
