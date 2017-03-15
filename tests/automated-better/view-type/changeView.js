
describe('changeView', function() {
	pushOptions({
		defaultDate: '2017-06-08',
		defaultView: 'month'
	});

	it('can change views', function() {
		initCalendar();
		currentCalendar.changeView('agendaWeek');
		ViewDateUtils.expectVisibleRange('2017-06-04', '2017-06-11');
	});

	it('can change views and navigate date', function() {
		initCalendar();
		currentCalendar.changeView('agendaDay', '2017-06-26');
		ViewDateUtils.expectVisibleRange('2017-06-26', '2017-06-27');
	});

	it('can change views and change visibleRange', function() {
		initCalendar();
		currentCalendar.changeView('agenda', {
			start: '2017-07-04',
			end: '2017-07-08'
		});
		ViewDateUtils.expectVisibleRange('2017-07-04', '2017-07-08');
	});
});
