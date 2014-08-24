describe('DayGrid event rendering', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-01',
			defaultView: 'month'
		};
	});

	it('rendering of events across weeks stays consistent', function() {
		options.events = [
			{
				title: 'event1',
				start: '2014-08-01',
				end: '2014-08-04',
				className: 'event1'
			},
			{
				title: 'event2',
				start: '2014-08-02',
				end: '2014-08-05',
				className: 'event2'
			}
		];
		$('#cal').fullCalendar(options);
		var row0 = $('.fc-day-grid .fc-row:eq(0)');
		var row0event1 = row0.find('.event1');
		var row0event2 = row0.find('.event2');
		var row1 = $('.fc-day-grid .fc-row:eq(1)');
		var row1event1 = row1.find('.event1');
		var row1event2 = row1.find('.event2');
		expect(row0event1.offset().top).toBeLessThan(row0event2.offset().top);
		expect(row1event1.offset().top).toBeLessThan(row1event2.offset().top);
	});
});