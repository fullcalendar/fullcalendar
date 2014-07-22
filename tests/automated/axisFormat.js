describe('axisFormat', function() {

	var options;

	function getAxisText() {
		return $('.fc-slats tr:first-child .fc-time').text();
	}

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-06-04',
			defaultView: 'agendaWeek'
		};
	});

	it('renders correctly when default', function() {
		$('#cal').fullCalendar(options);
		expect(getAxisText()).toBe('12am');
	});

	it('renders correctly when default and the language is customized', function() {
		options.lang = 'en-gb';
		$('#cal').fullCalendar(options);
		expect(getAxisText()).toBe('00');
	});

	it('renders correctly when customized', function() {
		options.axisFormat = 'H:mm:mm[!]';
		$('#cal').fullCalendar(options);
		expect(getAxisText()).toBe('0:00:00!');
	});
});