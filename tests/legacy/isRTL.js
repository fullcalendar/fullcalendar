describe('isRTL', function() {

	it('has it\'s default value computed differently based off of the locale', function() {
		affix('#cal');
		$('#cal').fullCalendar({
			locale: 'ar' // Arabic is RTL
		});
		var isRTL = $('#cal').fullCalendar('option', 'isRTL');
		expect(isRTL).toEqual(true);
	});

	// NOTE: don't put tests related to other options in here!
	// Put them in the test file for the individual option!

	it('adapts to dynamic option change', function() {
		affix('#cal');
		$('#cal').fullCalendar({
			isRTL: false
		});
		expect($('#cal')).toHaveClass('fc-ltr');
		expect($('#cal')).not.toHaveClass('fc-rtl');

		$('#cal').fullCalendar('option', 'isRTL', true);
		expect($('#cal')).toHaveClass('fc-rtl');
		expect($('#cal')).not.toHaveClass('fc-ltr');
	});

});
