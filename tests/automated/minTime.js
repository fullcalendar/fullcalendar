describe('minTime', function() {

	beforeEach(function() {
		affix('#cal');
	});

	var numToStringConverter = function(timeIn, mins) {
		var time = (timeIn % 12) || 12;
		var amPm = 'am';
		if ((timeIn % 24) > 11) {
			amPm = 'pm';
		}
		return time + (mins != null ? ':' + mins : '') + amPm;
	};

	describe('when using the default settings', function() {

		describe('in agendaWeek', function() {
			it('should start at 12am', function() {
				var options = {
					defaultView: 'agendaWeek'
				};
				$('#cal').fullCalendar(options);
				var firstSlotText = $('.fc-slot0 th').text();
				expect(firstSlotText).toEqual('12am');
			});
		});

		describe('in agendaDay', function() {
			it('should start at 12am', function() {
				var options = {
					defaultView: 'agendaDay'
				};
				$('#cal').fullCalendar(options);
				var firstSlotText = $('.fc-slot0 th').text();
				expect(firstSlotText).toEqual('12am');
			});
		});
	});

	describe('when using a whole number', function() {

		var hourNumbers = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];

		describe('in agendaWeek', function() {
			beforeEach(function() {
				affix('#cal2');
			});
			hourNumbers.forEach(function(hourNumber) {
				it('should start at ' + hourNumber, function() {
					var options = {
						defaultView: 'agendaWeek',
						minTime: { hours: hourNumber }
					};
					$('#cal2').fullCalendar(options);
					var firstSlotText = $('.fc-slot0 th').text();
					var expected = numToStringConverter(hourNumber);
					expect(firstSlotText).toEqual(expected);
				});
			});
		});

		describe('in agendaDay', function() {
			beforeEach(function() {
				affix('#cal2');
			});
			hourNumbers.forEach(function(hourNumber) {
				it('should start at ' + hourNumber, function() {
					var options = {
						defaultView: 'agendaDay',
						minTime: hourNumber + ':00' // in addition, test string duration input
					};
					$('#cal2').fullCalendar(options);
					var firstSlotText = $('.fc-slot0 th').text();
					var expected = numToStringConverter(hourNumber);
					expect(firstSlotText).toEqual(expected);
				});
			});
		});
	});

	describe('when using default slotInterval and \'uneven\' minTime', function() {

		var hourNumbers = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];

		describe('in agendaWeek', function() {
			beforeEach(function() {
				affix('#cal2');
			});
			hourNumbers.forEach(function(hourNumber) {
				it('should start at ' + hourNumber + ':20', function() {
					var options = {
						defaultView: 'agendaWeek',
						minTime: { hours: hourNumber, minutes: 20 }
					};
					$('#cal2').fullCalendar(options);
					var firstSlotElement = $('.fc-slot0')[0];
					var secondSlotElement = $('.fc-slot1')[0];
					var thirdSlotElement = $('.fc-slot2')[0];
					expect(firstSlotElement).toHaveClass('fc-minor');
					expect(secondSlotElement).toHaveClass('fc-minor');
					expect(thirdSlotElement).toHaveClass('fc-minor');
					// TODO: fix bad behavior in src where no slots have text
				});
			});
		});

		describe('in agendaDay', function() {
			beforeEach(function() {
				affix('#cal2');
			});
			hourNumbers.forEach(function(hourNumber) {
				it('should start at ' + hourNumber + ':20', function() {
					var options = {
						defaultView: 'agendaDay',
						minTime: { hours: hourNumber, minutes: 20 }
					};
					$('#cal2').fullCalendar(options);
					var firstSlotElement = $('.fc-slot0')[0];
					var secondSlotElement = $('.fc-slot1')[0];
					var thirdSlotElement = $('.fc-slot2')[0];
					expect(firstSlotElement).toHaveClass('fc-minor');
					expect(secondSlotElement).toHaveClass('fc-minor');
					expect(thirdSlotElement).toHaveClass('fc-minor');
					// TODO: fix bad behavior in src where no slots have text
				});
			});
		});
	});
});