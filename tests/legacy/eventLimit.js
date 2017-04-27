
describe('eventLimit', function() {

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-01' // important that it is the first week, so works w/ month + week views
		};
	});

	describe('as a number', function() {

		beforeEach(function() {
			options.eventLimit = 3;
		});

		[ 'month', 'basicWeek', 'agendaWeek' ].forEach(function(viewName) {

			describe('when in ' + viewName + ' view', function() {

				beforeEach(function() {
					options.defaultView = viewName;
				});

				it('doesn\'t display a more link when limit is more than the # of events', function() {
					options.events = [
						{ title: 'event1', start: '2014-07-29' },
						{ title: 'event2', start: '2014-07-29' }
					];
					$('#cal').fullCalendar(options);
					expect($('.fc-more').length).toBe(0);
				});

				it('doesn\'t display a more link when limit equal to the # of events', function() {
					options.events = [
						{ title: 'event1', start: '2014-07-29' },
						{ title: 'event2', start: '2014-07-29' },
						{ title: 'event2', start: '2014-07-29' }
					];
					$('#cal').fullCalendar(options);
					expect($('.fc-more').length).toBe(0);
				});

				it('displays a more link when limit is less than the # of events', function() {
					options.events = [
						{ title: 'event1', start: '2014-07-29' },
						{ title: 'event2', start: '2014-07-29' },
						{ title: 'event2', start: '2014-07-29' },
						{ title: 'event2', start: '2014-07-29' }
					];
					$('#cal').fullCalendar(options);
					expect($('.fc-more').length).toBe(1);
					expect($('.fc-more')).toHaveText('+2 more');
				});

				it('displays one more per day, when a multi-day event is above', function() {
					options.events = [
						{ title: 'event1', start: '2014-07-29', end: '2014-07-31' },
						{ title: 'event2', start: '2014-07-29', end: '2014-07-31' },
						{ title: 'event2', start: '2014-07-29', end: '2014-07-31' },
						{ title: 'event2', start: '2014-07-29', end: '2014-07-31' }
					];
					$('#cal').fullCalendar(options);
					var cells = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis)');
					expect($('.fc-more').length).toBe(2);
					expect($('.fc-more').eq(0)).toHaveText('+2 more');
					expect($('.fc-more').eq(0)).toBeBoundedBy(cells.eq(2));
					expect($('.fc-more').eq(1)).toHaveText('+2 more');
					expect($('.fc-more').eq(1)).toBeBoundedBy(cells.eq(3));
				});

				it('will render a link in a multi-day event\'s second column ' +
					'if it has already been hidden in the first',
				function() {
					options.events = [
						{ title: 'event1', start: '2014-07-29', end: '2014-07-31' },
						{ title: 'event2', start: '2014-07-29', end: '2014-07-31' },
						{ title: 'event2', start: '2014-07-29', end: '2014-07-31' },
						{ title: 'event2', start: '2014-07-29' }
					];
					$('#cal').fullCalendar(options);
					var cells = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis)');
					expect($('.fc-more').length).toBe(2);
					expect($('.fc-more').eq(0)).toHaveText('+2 more');
					expect($('.fc-more').eq(0)).toBeBoundedBy(cells.eq(2));
					expect($('.fc-more').eq(1)).toHaveText('+1 more');
					expect($('.fc-more').eq(1)).toBeBoundedBy(cells.eq(3));
				});

				it('will render a link in a multi-day event\'s second column ' +
					'if it has already been hidden in the first even if he second column hardly has any events',
				function() {
					options.events = [
						{ title: 'event1', start: '2014-07-28', end: '2014-07-30' },
						{ title: 'event2', start: '2014-07-28', end: '2014-07-30' },
						{ title: 'event2', start: '2014-07-28', end: '2014-07-30' },
						{ title: 'event2', start: '2014-07-29', end: '2014-07-31' }
					];
					$('#cal').fullCalendar(options);
					var cells = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis)');
					var link = $('.fc-more').eq(0); // will appear to be the third link, but will be in first row, so 0dom
					expect(link.length).toBe(1);
					expect(link).toHaveText('+1 more');
					expect(link).toBeBoundedBy(cells.eq(3));
				});

				it('will render a link in place of a hidden single day event, if covered by a multi-day', function() {
					options.events = [
						{ title: 'event1', start: '2014-07-28', end: '2014-07-30' },
						{ title: 'event2', start: '2014-07-28', end: '2014-07-30' },
						{ title: 'event2', start: '2014-07-28' },
						{ title: 'event2', start: '2014-07-28' }
					];
					$('#cal').fullCalendar(options);
					var cells = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis)');
					var link = $('.fc-more').eq(0);
					expect(link.length).toBe(1);
					expect(link).toHaveText('+2 more');
					expect(link).toBeBoundedBy(cells.eq(1));
				});

				it('will render a link in place of a hidden single day event, if covered by a multi-day ' +
					'and in its second column',
				function() {
					options.events = [
						{ title: 'event1', start: '2014-07-28', end: '2014-07-30' },
						{ title: 'event2', start: '2014-07-28', end: '2014-07-30' },
						{ title: 'event2', start: '2014-07-29' },
						{ title: 'event2', start: '2014-07-29' }
					];
					$('#cal').fullCalendar(options);
					var cells = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis)');
					var link = $('.fc-more').eq(0);
					expect(link.length).toBe(1);
					expect(link).toHaveText('+2 more');
					expect(link).toBeBoundedBy(cells.eq(2));
				});
			});
		});
	});

	describe('when auto', function() {

		beforeEach(function() {
			options.eventLimit = true;
		});

		describe('in month view', function() {

			beforeEach(function() {
				options.defaultView = 'month';
				options.events = [
					{ title: 'event1', start: '2014-07-28', end: '2014-07-30' },
					{ title: 'event2', start: '2014-07-28', end: '2014-07-30' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' }
				];
			});

			it('renders the heights of all the rows the same, regardless of # of events', function() {
				$('#cal').fullCalendar(options);
				var rowEls = $('.fc-day-grid .fc-row').slice(0, -1); // remove last b/c it will be a different height
				expect(rowEls.length).toBeGreaterThan(0);
				var height = rowEls.height();
				rowEls.each(function(i, node) {
					expect($(node).height()).toBe(height);
				});
			});

			it('renders a more link when there are obviously too many events', function() {
				$('#cal').width(800);
				$('#cal').fullCalendar(options);
				expect($('#cal .fc-more').length).toBe(1);
			});
		});

		[ 'month', 'basicWeek' ].forEach(function(viewName) {

			describe('in ' + viewName + ' view', function() {

				beforeEach(function() {
					options.defaultView = viewName;
				});

				it('doesn\'t render a more link where there should obviously not be a limit', function() {
					options.events = [
						{ title: 'event1', start: '2014-07-28', end: '2014-07-30' }
					];
					$('#cal').fullCalendar(options);
					expect($('.fc-more').length).toBe(0);
				});
			});
		});

		describe('in agendaWeek view', function() {

			beforeEach(function() {
				options.defaultView = 'agendaWeek';
			});

			it('behaves as if limit is 5', function() {
				options.events = [
					{ title: 'event1', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' },
					{ title: 'event2', start: '2014-07-29' }
				];
				$('#cal').fullCalendar(options);
				expect($('.fc-event:visible').length).toBe(4);
				expect($('.fc-more').length).toBe(1);
				expect($('.fc-more')).toHaveText('+3 more');
			});
		});
	});
});
