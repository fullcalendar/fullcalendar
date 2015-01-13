
describe('unselectAuto', function() {
	var options;

	beforeEach(function() {
		options = {
			selectable: true,
			defaultDate: '2014-12-25',
			defaultView: 'month'
		};
		affix('#cal');
		affix('#otherthing');
	});

	describe('when enabled', function() {

		beforeEach(function() {
			options.unselectAuto = true;
		});

		it('unselects the current selection when clicking elsewhere in DOM', function() {
			$('#cal').fullCalendar(options);
			$('#cal').fullCalendar('select', '2014-12-01', '2014-12-03');

			expect($('.fc-highlight').length).toBeGreaterThan(0);

			$('#otherthing')
				.simulate('mousedown')
				.simulate('mouseup')
				.simulate('click');

			expect($('.fc-highlight').length).toBe(0);
		});
	});

	describe('when disabled', function() {

		beforeEach(function() {
			options.unselectAuto = false;
		});

		it('keeps current selection when clicking elsewhere in DOM', function() {
			$('#cal').fullCalendar(options);
			$('#cal').fullCalendar('select', '2014-12-01', '2014-12-03');

			expect($('.fc-highlight').length).toBeGreaterThan(0);

			$('#otherthing')
				.simulate('mousedown')
				.simulate('mouseup')
				.simulate('click');

			expect($('.fc-highlight').length).toBeGreaterThan(0);
		});
	});
});