
describe('weekNumberCalculation', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('when using the default', function() {
		it('should return iso standard', function() {
			$('#cal').fullCalendar({
				editable: true,
				weekNumbers: true,
				weekNumberCalculation: 'ISO'
			});
			$('#cal').fullCalendar('gotoDate', '2013-11-17');
			var weekNum = parseInt($('.fc-week.fc-first .fc-week-number div').text());
			expect(weekNum).toEqual(43);
		});
	});

	describe('when using a defined weekNumber calculation', function() {
		it('should return the calculated number', function() {
			$('#cal').fullCalendar({
				editable: true,
				weekNumbers: true,
				weekNumberCalculation: function() {
					return 4;
				}
			});
			$('#cal').fullCalendar('gotoDate', '2013-11-17');
			var weekNum = parseInt($('.fc-week.fc-first .fc-week-number div').text());
			expect(weekNum).toEqual(4);
		});
	});
});