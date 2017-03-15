
describe('dateAlignment', function() {
	pushOptions({
		defaultView: 'agenda',
		duration: { days: 3 },
		dateAlignment: 'week'
	});

	it('aligns with the week', function() {
		initCalendar({
			defaultDate: '2017-06-15'
		});
		ViewDateUtils.expectVisibleRange('2017-06-11', '2017-06-14');
	});
});
