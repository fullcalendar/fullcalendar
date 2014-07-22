describe('maxTime', function() {

	beforeEach(function() {
		affix('#cal');
	});

	var numToStringConverter = function(timeIn) {
		var time = (timeIn % 12) || 12;
		var amPm = 'am';
		if ((timeIn % 24) > 11) {
			amPm = 'pm';
		}
		return time + amPm;
	};

	describe('when using the default settings', function() {

		describe('in agendaWeek', function() {
			it('should start at 12am', function() {
				var options = {
					defaultView: 'agendaWeek'
				};
				$('#cal').fullCalendar(options);
				var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text();
				expect(lastSlotText).toEqual('11pm');
			});
		});

		describe('in agendaDay', function() {
			it('should start at 12am', function() {
				var options = {
					defaultView: 'agendaDay'
				};
				$('#cal').fullCalendar(options);
				var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text();
				expect(lastSlotText).toEqual('11pm');
			});
		});
	});

	describe('when using a whole number', function() {

		var hourNumbers = [ 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24 ];

		describe('in agendaWeek', function() {
			beforeEach(function() {
				affix('#cal2');
			});
			hourNumbers.forEach(function(hourNumber) {
				it('should end at ' + hourNumber, function() {
					var options = {
						defaultView: 'agendaWeek',
						maxTime: { hours: hourNumber }
					};
					$('#cal2').fullCalendar(options);
					var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text();
					var expected = numToStringConverter(hourNumber - 1);
					expect(lastSlotText).toEqual(expected);
				});
			});
		});

		describe('in agendaDay', function() {
			beforeEach(function() {
				affix('#cal2');
			});
			hourNumbers.forEach(function(hourNumber) {
				it('should end at ' + hourNumber, function() {
					var options = {
						defaultView: 'agendaDay',
						maxTime: hourNumber + ':00' // in addition, test string duration input
					};
					$('#cal2').fullCalendar(options);
					var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text();
					var expected = numToStringConverter(hourNumber - 1);
					expect(lastSlotText).toEqual(expected);
				});
			});
		});
	});

	describe('when using default slotInterval and \'uneven\' maxTime', function() {

		var hourNumbers = [ 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24 ];

		describe('in agendaWeek', function() {
			beforeEach(function() {
				affix('#cal2');
			});
			hourNumbers.forEach(function(hourNumber) {
				it('should end at ' + hourNumber + ':20', function() {
					var options = {
						defaultView: 'agendaWeek',
						maxTime: { hours: hourNumber, minutes: 20 }
					};
					$('#cal2').fullCalendar(options);
					var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text();
					// since exclusive end is :20, last slot will be on the current hour's 00:00
					var expected = numToStringConverter(hourNumber);
					expect(lastSlotText).toEqual(expected);
				});
			});
		});

		describe('in agendaDay', function() {
			beforeEach(function() {
				affix('#cal2');
			});
			hourNumbers.forEach(function(hourNumber) {
				it('should end at ' + hourNumber + ':20', function() {
					var options = {
						defaultView: 'agendaDay',
						maxTime: { hours: hourNumber, minutes: 20 }
					};
					$('#cal2').fullCalendar(options);
					var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text();
					// since exclusive end is :20, last slot will be on the current hour's 00:00
					var expected = numToStringConverter(hourNumber);
					expect(lastSlotText).toEqual(expected);
				});
			});
		});
	});
});