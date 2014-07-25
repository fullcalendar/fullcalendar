describe('forceEventDuration', function() {

	var options;

	beforeEach(function() {
		affix('#cal');

		options = {
			defaultDate: '2014-05-01',
			defaultView: 'month'
		};
	});

	describe('when turned off', function() {
		beforeEach(function() {
			options.forceEventDuration = false;
		});
		it('allows a null end date for all-day and timed events', function() {
			options.events = [
				{
					id: '1',
					start: '2014-05-10'
				},
				{
					id: '2',
					start: '2014-05-10T14:00:00'
				}
			];
			$('#cal').fullCalendar(options);
			var events = $('#cal').fullCalendar('clientEvents');
			expect(events[0].end).toBeNull();
			expect(events[1].end).toBeNull();
		});
	});

	describe('when turned on', function() {
		beforeEach(function() {
			options.forceEventDuration = true;
		});
		it('allows a null end date for all-day and timed events', function() {
			options.events = [
				{
					id: '1',
					start: '2014-05-10'
				},
				{
					id: '2',
					start: '2014-05-10T14:00:00'
				}
			];
			$('#cal').fullCalendar(options);
			var events = $('#cal').fullCalendar('clientEvents');
			expect(events[0].id).toEqual('1');
			expect(moment.isMoment(events[0].end)).toEqual(true);
			expect(events[1].id).toEqual('2');
			expect(moment.isMoment(events[1].end)).toEqual(true);
		});
	});

	// NOTE: the actual verification of the correct calculation of the end
	// (using defaultTimedEventDuration and defaultAllDayEventDuration)
	// is done in those test files.

});