
describe('eventLimitText', function() {

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-01', // important that it is the first week, so works w/ month + week views
			defaultView: 'month',
			eventLimit: 3,
			events: [
				{ title: 'event1', start: '2014-07-29' },
				{ title: 'event2', start: '2014-07-29' },
				{ title: 'event2', start: '2014-07-29' },
				{ title: 'event2', start: '2014-07-29' }
			]
		};
	});

	it('allows a string', function() {
		options.eventLimitText = 'extra';
		$('#cal').fullCalendar(options);
		expect($('.fc-more')).toHaveText('+2 extra');
	});

	it('allows a function', function() {
		options.eventLimitText = function(n) {
			expect(typeof n).toBe('number');
			return 'there are ' + n + ' more events!';
		};
		$('#cal').fullCalendar(options);
		expect($('.fc-more')).toHaveText('there are 2 more events!');
	});

	it('has a default value that is affected by the custom locale', function() {
		options.lang = 'fr';
		$('#cal').fullCalendar(options);
		expect($('.fc-more')).toHaveText('+2 en plus');
	});

	it('is not affected by a custom locale when the value is explicitly specified', function() {
		options.lang = 'fr';
		options.eventLimitText = 'extra';
		$('#cal').fullCalendar(options);
		expect($('.fc-more')).toHaveText('+2 extra');
	});
});
