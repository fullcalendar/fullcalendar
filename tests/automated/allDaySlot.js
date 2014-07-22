
describe('allDaySlots', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('when allDaySlots is not set', function() {
		describe('in agendaWeek', function() {
			it('should default to having an allDaySlots table', function() {
				var options = {
					defaultView: 'agendaWeek'
				};
				$('#cal').fullCalendar(options);
				var allDaySlotCount = $('.fc-day-grid').length;
				expect(allDaySlotCount).toEqual(1);
			});
		});
		describe('in agendaDay', function() {
			it('should default to having an allDaySlots table', function() {
				var options = {
					defaultView: 'agendaDay'
				};
				$('#cal').fullCalendar(options);
				var allDaySlotCount = $('.fc-day-grid').length;
				expect(allDaySlotCount).toEqual(1);
			});
		});
	});

	describe('when allDaySlots is set true', function() {
		describe('in agendaWeek', function() {
			it('should default to having an allDaySlots table', function() {
				var options = {
					defaultView: 'agendaWeek',
					allDaySlot: true
				};
				$('#cal').fullCalendar(options);
				var allDaySlotCount = $('.fc-day-grid').length;
				expect(allDaySlotCount).toEqual(1);
			});
		});
		describe('in agendaDay', function() {
			it('should default to having an allDaySlots table', function() {
				var options = {
					defaultView: 'agendaDay',
					allDaySlot: true
				};
				$('#cal').fullCalendar(options);
				var allDaySlotCount = $('.fc-day-grid').length;
				expect(allDaySlotCount).toEqual(1);
			});
		});
	});

	describe('when allDaySlots is set false', function() {
		describe('in agendaWeek', function() {
			it('should default to having an allDaySlots table', function() {
				var options = {
					defaultView: 'agendaWeek',
					allDaySlot: false
				};
				$('#cal').fullCalendar(options);
				var allDaySlotCount = $('.fc-day-grid').length;
				expect(allDaySlotCount).toEqual(0);
			});
		});
		describe('in agendaDay', function() {
			it('should default to having an allDaySlots table', function() {
				var options = {
					defaultView: 'agendaDay',
					allDaySlot: false
				};
				$('#cal').fullCalendar(options);
				var allDaySlotCount = $('.fc-day-grid').length;
				expect(allDaySlotCount).toEqual(0);
			});
		});
	});
});