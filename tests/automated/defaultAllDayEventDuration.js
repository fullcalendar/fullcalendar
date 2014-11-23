describe('defaultAllDayEventDuration', function() {

	var options;

	beforeEach(function() {
		affix('#cal');

		options = {
			defaultDate: '2014-05-01',
			defaultView: 'month'
		};
	});

	describe('when forceEventDuration is on', function() {

		beforeEach(function() {
			options.forceEventDuration = true;
		});

		it('correctly calculates an unspecified end when using a Duration object input', function() {
			options.defaultAllDayEventDuration = { days: 2 };
			options.events = [
				{
					allDay: true,
					start: '2014-05-05'
				}
			];
			$('#cal').fullCalendar(options);
			var event = $('#cal').fullCalendar('clientEvents')[0];
			expect(event.end).toEqualMoment('2014-05-07');
		});

		it('correctly calculates an unspecified end when using a string Duration input', function() {
			options.defaultAllDayEventDuration = '3.00:00:00';
			options.events = [
				{
					allDay: true,
					start: '2014-05-05'
				}
			];
			$('#cal').fullCalendar(options);
			var event = $('#cal').fullCalendar('clientEvents')[0];
			expect(event.end).toEqualMoment('2014-05-08');
		});
	});

	describe('when forceEventDuration is off', function() {

		beforeEach(function() {
			options.forceEventDuration = false;
		});

		[ 'basicWeek', 'agendaWeek' ].forEach(function(viewName) { // because they render all-day events in similar ways
			describe('with ' + viewName + ' view', function() {
				beforeEach(function() {
					options.defaultView = viewName;
				});
				it('renders an all-day event with no `end` to appear to have the default duration', function(done) {
					options.defaultAllDayEventDuration = { days: 2 };
					options.events = [
						{
							// a control. so we know how wide it should be
							title: 'control event',
							allDay: true,
							start: '2014-04-28',
							end: '2014-04-30'
						},
						{
							// one day after the control. no specified end
							title: 'test event',
							allDay: true,
							start: '2014-04-28'
						}
					];
					options.eventAfterAllRender = function() {
						var eventElms = $('#cal .fc-event');
						var width0 = eventElms.eq(0).outerWidth();
						var width1 = eventElms.eq(1).outerWidth();
						expect(width0).toEqual(width1);
						done();
					};
					$('#cal').fullCalendar(options);
				});
			});
		});
	});
});