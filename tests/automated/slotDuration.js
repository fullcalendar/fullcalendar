
describe('slotDuration', function() {

	var minutesInADay = 1440;

	beforeEach(function() {
		affix('#cal');
	});

	describe('when using the default settings', function() {
		describe('in agendaWeek', function() {
			it('should have slots 1440/30 slots', function() {
				var options = {
					defaultView: 'agendaWeek'
				};
				$('#cal').fullCalendar(options);
				var slotCount = $('.fc-slats tr').length;
				expect(slotCount).toEqual(Math.ceil(minutesInADay / 30));
			});
		});
		describe('in agendaDay', function() {
			it('should have slots 1440/30 slots', function() {
				var options = {
					defaultView: 'agendaDay'
				};
				$('#cal').fullCalendar(options);
				var slotCount = $('.fc-slats tr').length;
				expect(slotCount).toEqual(Math.ceil(minutesInADay / 30));
			});
		});
	});

	describe('when slotMinutes is set to 30', function() {
		describe('in agendaWeek', function() {
			it('should have slots 1440/30 slots', function() {
				var options = {
					defaultView: 'agendaWeek'
				};
				$('#cal').fullCalendar(options);
				var slotCount = $('.fc-slats tr').length;
				expect(slotCount).toEqual(Math.ceil(minutesInADay / 30));
			});
		});
		describe('in agendaDay', function() {
			it('should have slots 1440/30 slots', function() {
				var options = {
					defaultView: 'agendaDay'
				};
				$('#cal').fullCalendar(options);
				var slotCount = $('.fc-slats tr').length;
				expect(slotCount).toEqual(Math.ceil(minutesInADay / 30));
			});
		});
	});

	describe('when slotMinutes is set to a series of times', function() {

		var slotMinutesList = [ 10, 12, 15, 17, 20, 30, 35, 45, 60, 62, 120, 300 ];

		describe('in agendaWeek', function() {
			beforeEach(function() {
				affix('#cal2');
			});
			slotMinutesList.forEach(function(slotMinutes) {
				it('should have slots 1440/x slots', function() {
					var options = {
						defaultView: 'agendaWeek',
						slotDuration: { minutes: slotMinutes }
					};
					$('#cal2').fullCalendar(options);
					var slotCount = $('.fc-slats tr').length;
					var expected = Math.ceil(minutesInADay / slotMinutes);
					expect(slotCount).toEqual(expected);
				});
			});
		});

		describe('in agendaDay', function() {
			beforeEach(function() {
				affix('#cal2');
			});
			slotMinutesList.forEach(function(slotMinutes) {
				it('should have slots 1440/x slots', function() {
					var options = {
						defaultView: 'agendaWeek',
						slotDuration: { minutes: slotMinutes }
					};
					$('#cal2').fullCalendar(options);
					var slotCount = $('.fc-slats tr').length;
					var expected = Math.ceil(minutesInADay / slotMinutes);
					expect(slotCount).toEqual(expected);
				});
			});
		});
	});
});