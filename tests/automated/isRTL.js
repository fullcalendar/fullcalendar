describe('isRTL', function() {

	it('has it\'s default value computed differently based off of the language', function() {
		affix('#cal');
		$('#cal').fullCalendar({
			lang: 'ar' // Arabic is RTL
		});
		var isRTL = $('#cal').fullCalendar('option', 'isRTL');
		expect(isRTL).toEqual(true);
	});

	// NOTE: don't put tests related to other options in here!
	// Put them in the test file for the individual option!

});