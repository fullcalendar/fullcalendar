
describe('event coloring', function() {

	var eventInput;
	var options;

	beforeEach(function() {
		eventInput = {};
		options = {
			defaultDate: '2014-11-04'
		};
		affix('#cal');
	});

	describe('when in month view', function() {
		beforeEach(function() {
			options.defaultView = 'month';
			eventInput = { start: '2014-11-04' };
		});
		defineTests();
	});

	describe('when in agendaWeek view', function() {
		beforeEach(function() {
			options.defaultView = 'agendaWeek';
			options.allDaySlot = false;
			eventInput = { start: '2014-11-04T01:00:00' };
		});
		defineTests();
	});


	function defineTests() {

		describe('for foreground events', function() {
			testTextColor();
			testBorderColor();
			testBackgroundColor();
		});

		describe('for background events', function() {
			beforeEach(function() {
				eventInput.rendering = 'background';
			});

			testBackgroundColor();
		});
	}


	function testTextColor() {

		it('should accept the global eventTextColor', function() {
			options.eventTextColor = 'red';
			options.events = [ eventInput ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('color')).toMatch(RED_REGEX);
		});

		it('should accept an event source\'s textColor', function() {
			options.eventTextColor = 'blue'; // even when there's a more general setting
			options.eventSources = [ {
				textColor: 'red',
				events: [ eventInput ]
			} ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('color')).toMatch(RED_REGEX);
		});

		it('should accept an event object\'s textColor', function() {
			eventInput.textColor = 'red';
			options.eventSources = [ {
				textColor: 'blue', // even when there's a more general setting
				events: [ eventInput ]
			} ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('color')).toMatch(RED_REGEX);
		});
	}


	function testBorderColor() {

		it('should accept the global eventColor for border color', function() {
			options.eventColor = 'red';
			options.events = [ eventInput ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('border-top-color')).toMatch(RED_REGEX);
		});

		it('should accept the global eventBorderColor', function() {
			options.eventColor = 'blue'; // even when there's a more general setting
			options.eventBorderColor = 'red';
			options.events = [ eventInput ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('border-top-color')).toMatch(RED_REGEX);
		});

		it('should accept an event source\'s color for the border', function() {
			options.eventBorderColor = 'blue'; // even when there's a more general setting
			options.eventSources = [ {
				color: 'red',
				events: [ eventInput ]
			} ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('border-top-color')).toMatch(RED_REGEX);
		});

		it('should accept an event source\'s borderColor', function() {
			options.eventSources = [ {
				color: 'blue', // even when there's a more general setting
				borderColor: 'red',
				events: [ eventInput ]
			} ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('border-top-color')).toMatch(RED_REGEX);
		});

		it('should accept an event object\'s color for the border', function() {
			eventInput.color = 'red';
			options.eventSources = [ {
				borderColor: 'blue', // even when there's a more general setting
				events: [ eventInput ]
			} ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('border-top-color')).toMatch(RED_REGEX);
		});

		it('should accept an event object\'s borderColor', function() {
			eventInput.color = 'blue'; // even when there's a more general setting
			eventInput.borderColor = 'red';
			options.eventSources = [ {
				events: [ eventInput ]
			} ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('border-top-color')).toMatch(RED_REGEX);
		});
	}


	function testBackgroundColor() {

		it('should accept the global eventColor for background color', function() {
			options.eventColor = 'red';
			options.events = [ eventInput ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('background-color')).toMatch(RED_REGEX);
		});

		it('should accept the global eventBackgroundColor', function() {
			options.eventColor = 'blue'; // even when there's a more general setting
			options.eventBackgroundColor = 'red';
			options.events = [ eventInput ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('background-color')).toMatch(RED_REGEX);
		});

		it('should accept an event source\'s color for the background', function() {
			options.eventBackgroundColor = 'blue'; // even when there's a more general setting
			options.eventSources = [ {
				color: 'red',
				events: [ eventInput ]
			} ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('background-color')).toMatch(RED_REGEX);
		});

		it('should accept an event source\'s backgroundColor', function() {
			options.eventSources = [ {
				color: 'blue', // even when there's a more general setting
				backgroundColor: 'red',
				events: [ eventInput ]
			} ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('background-color')).toMatch(RED_REGEX);
		});

		it('should accept an event object\'s color for the background', function() {
			eventInput.color = 'red';
			options.eventSources = [ {
				backgroundColor: 'blue', // even when there's a more general setting
				events: [ eventInput ]
			} ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('background-color')).toMatch(RED_REGEX);
		});

		it('should accept an event object\'s backgroundColor', function() {
			eventInput.color = 'blue'; // even when there's a more general setting
			eventInput.backgroundColor = 'red';
			options.eventSources = [ {
				events: [ eventInput ]
			} ];
			$('#cal').fullCalendar(options);
			expect(getEventCss('background-color')).toMatch(RED_REGEX);
		});
	}


	function getEventCss(prop) {
		var el = $(eventInput.rendering == 'background' ? '.fc-bgevent' : '.fc-event');
		return el.css(prop);
	}

});