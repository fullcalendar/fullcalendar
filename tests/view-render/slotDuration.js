
describe('slotDuration', function() {

	describe('when out of alignment with minTime', function() {
		pushOptions({
			defaultDate: '2017-07-17',
			defaultView: 'agendaDay',
			minTime: '08:30:00',
			maxTime: '12:30:00',
			slotDuration: '01:00'
		});

		it('still renders time axis text', function() {
			initCalendar();
			expect(TimeGridRenderUtils.getTimeAxisText()).toEqual([
				'8:30am', '9:30am', '10:30am', '11:30am'
			]);
		});
	});
});
