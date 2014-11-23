
describe('when weekends option is set', function() {

	beforeEach(function() {
		affix('#calendar');
	});

	it('should show sat and sun if true', function() {
		var options = {
			weekends: true
		};
		$('#calendar').fullCalendar(options);
		var sun = $('.fc-day-header.fc-sun')[0];
		var sat = $('.fc-day-header.fc-sun')[0];
		expect(sun).toBeDefined();
		expect(sat).toBeDefined();
	});

	it('should not show sat and sun if false', function() {
		var options = {
			weekends: false
		};
		$('#calendar').fullCalendar(options);
		var sun = $('.fc-day-header.fc-sun')[0];
		var sat = $('.fc-day-header.fc-sun')[0];
		expect(sun).not.toBeDefined();
		expect(sat).not.toBeDefined();
	});

});