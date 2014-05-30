describe('timeFormat', function() {

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-06-04',
			events: [ {
				title: 'my event',
				start: '2014-06-04T15:00:00',
				end: '2014-06-04T17:00:00'
			} ]
		};
	});

	function getRenderedEventTime() {
		return $('.fc-event-time:first').text();
	}

	describe('when in month view', function() {

		beforeEach(function() {
			options.defaultView = 'month';
		});

		it('renders correctly when default', function() {
			$('#cal').fullCalendar(options);
			expect(getRenderedEventTime()).toBe('3p');
		});

		it('renders correctly when default and the language is customized', function() {
			options.lang = 'en-gb';
			$('#cal').fullCalendar(options);
			expect(getRenderedEventTime()).toBe('15');
		});

		it('renders correctly when customized', function() {
			options.timeFormat = 'Hh:mm:mm';
			$('#cal').fullCalendar(options);
			expect(getRenderedEventTime()).toBe('153:00:00');
		});
	});

	describe('when in agendaWeek view', function() {

		beforeEach(function() {
			options.defaultView = 'agendaWeek';
		});

		it('renders correctly when default', function() {
			$('#cal').fullCalendar(options);
			expect(getRenderedEventTime()).toBe('3:00 - 5:00');
		});

		it('renders correctly when default and the language is customized', function() {
			options.lang = 'en-gb';
			$('#cal').fullCalendar(options);
			expect(getRenderedEventTime()).toBe('15:00 - 17:00');
		});

		it('renders correctly when customized', function() {
			options.timeFormat = 'Hh:mm:mm';
			$('#cal').fullCalendar(options);
			expect(getRenderedEventTime()).toBe('153:00:00 - 175:00:00');
		});
	});
});