describe('scrollTime', function() {

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultView: 'agendaWeek'
		};
	});

	it('accepts a string Duration', function() {
		options.scrollTime = '02:00:00';
		options.height = 400; // short enough to make scrolling happen
		$('#cal').fullCalendar(options);
		var slotCell = $('.fc-slats tr:eq(4)'); // 2am slot
		var slotTop = slotCell.position().top;
		var scrollContainer = $('.fc-time-grid-container');
		var scrollTop = scrollContainer.scrollTop();
		var diff = Math.abs(slotTop - scrollTop);
		expect(slotTop).toBeGreaterThan(0);
		expect(scrollTop).toBeGreaterThan(0);
		expect(diff).toBeLessThan(3);
	});

	it('accepts a Duration object', function() {
		options.scrollTime = { hours: 2 };
		options.height = 400; // short enough to make scrolling happen
		$('#cal').fullCalendar(options);
		var slotCell = $('.fc-slats tr:eq(4)'); // 2am slot
		var slotTop = slotCell.position().top;
		var scrollContainer = $('.fc-time-grid-container');
		var scrollTop = scrollContainer.scrollTop();
		var diff = Math.abs(slotTop - scrollTop);
		expect(slotTop).toBeGreaterThan(0);
		expect(scrollTop).toBeGreaterThan(0);
		expect(diff).toBeLessThan(3);
	});

});