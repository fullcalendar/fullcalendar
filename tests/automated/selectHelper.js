describe('selectHelper', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-03',
			defaultView: 'agendaWeek',
			scrollTime: '00:00:00',
			selectHelper: true
		};
	});

	it('goes through eventRender', function() {
		options.eventRender = function(event, element, view) {
			element.addClass('didEventRender');
		};
		$('#cal').fullCalendar(options);
		$('#cal').fullCalendar('select', '2014-08-04T01:00:00', '2014-08-04T04:00:00');
		expect($('.fc-helper')).toHaveClass('didEventRender');
	});
});