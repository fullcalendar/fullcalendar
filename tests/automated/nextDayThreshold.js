
describe('nextDayThreshold', function() {

	// when a view object exposes its nextDayThreshold value (after some refactoring)...
	//   TODO: detect the default of 9am
	//   TODO: detect 2 or more different types of Duration-ish parsing

	beforeEach(function() {
		affix('#cal');
	});

	it('renders an event before the threshold', function() {
		$('#cal').fullCalendar({
			nextDayThreshold: '10:00:00',
			defaultDate: '2014-06',
			defaultView: 'month',
			events: [
				{
					title: 'event1',
					start: '2014-06-08T22:00:00',
					end: '2014-06-10T09:00:00'
				}
			]
		});
		expect(renderedDayCount()).toBe(2);
	});

	it('renders an event equal to the threshold', function() {
		$('#cal').fullCalendar({
			nextDayThreshold: '10:00:00',
			defaultDate: '2014-06',
			defaultView: 'month',
			events: [
				{
					title: 'event1',
					start: '2014-06-08T22:00:00',
					end: '2014-06-10T10:00:00'
				}
			]
		});
		expect(renderedDayCount()).toBe(3);
	});

	it('renders an event after the threshold', function() {
		$('#cal').fullCalendar({
			nextDayThreshold: '10:00:00',
			defaultDate: '2014-06',
			defaultView: 'month',
			events: [
				{
					title: 'event1',
					start: '2014-06-08T22:00:00',
					end: '2014-06-10T11:00:00'
				}
			]
		});
		expect(renderedDayCount()).toBe(3);
	});


	function renderedDayCount() { // assumes only one event on the calendar
		var cellWidth = $('.fc-sun').outerWidth(); // works with basic and agenda
		var totalWidth = 0;
		$('.fc-event').each(function() {
			totalWidth += $(this).outerWidth();
		});
		return Math.round(totalWidth / cellWidth);
	}

});