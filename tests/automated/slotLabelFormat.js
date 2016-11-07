describe('slotLabelFormat', function() {

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

	it('renders correctly when default and the locale is customized', function() {
		options.locale = 'en-gb';
		$('#cal').fullCalendar(options);
		expect(getAxisText()).toBe('00');
	});

	it('renders correctly when customized', function() {
		options.slotLabelFormat = 'H:mm:mm[!]';
		$('#cal').fullCalendar(options);
		expect(getAxisText()).toBe('0:00:00!');
	});
});
