describe('now', function() {

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-05-01'
		};
	});

	describe('when month view', function() {
		beforeEach(function() {
			options.defaultView = 'month';
		});
		it('changes the highlighted day when customized', function() {
			options.now = '2014-05-06';
			$('#cal').fullCalendar(options);
			var todayCell = $('#cal td.fc-today');
			var todayDate = todayCell.data('date');
			expect(todayDate).toEqual('2014-05-06');
		});
	});

	describe('when agendaWeek view', function() {
		beforeEach(function() {
			options.defaultView = 'agendaWeek';
		});
		it('changes the highlighted day when customized', function() {
			options.now = '2014-04-29T12:00:00';
			$('#cal').fullCalendar(options);
			var todayCell = $('#cal td.fc-today');
			expect(todayCell.data('date')).toBe('2014-04-29');
		});
	});

	it('accepts a function that returns a moment', function() {
		options.defaultView = 'month';
		options.now = function() {
			return moment.utc('2014-05-01');
		};
		$('#cal').fullCalendar(options);
		var todayCell = $('#cal td.fc-today');
		var todayDate = todayCell.data('date');
		expect(todayDate).toEqual('2014-05-01');
	});

	it('accepts a function that returns a moment-ish string', function() {
		options.defaultView = 'month';
		options.now = function() {
			return '2014-05-01';
		};
		$('#cal').fullCalendar(options);
		var todayCell = $('#cal td.fc-today');
		var todayDate = todayCell.data('date');
		expect(todayDate).toEqual('2014-05-01');
	});

});