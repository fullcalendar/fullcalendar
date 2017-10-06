
describe('columnHead', function() {
	beforeEach(function() {
		affix('#cal');
	});

	describe('when columnHead is not set', function() {

		var viewWithFormat = [
			{ view: 'month' },
			{ view: 'basicWeek' },
			{ view: 'agendaWeek' },
			{ view: 'basicDay' },
			{ view: 'agendaDay' }
		];

		beforeEach(function() {
			$('#cal').fullCalendar({
				defaultDate: '2014-05-11'
			});
		});

		it('header should be visible', function() {
			var cal = $('#cal');

			for (var i = 0; i <  viewWithFormat.length; i++) {
				var crtView = viewWithFormat[i];
				cal.fullCalendar('changeView', crtView.view);
				expect(cal.find('thead.fc-head').length).toBe(1);
			};
		});
	});

	describe('when columnHead is set to false', function() {

		var viewWithFormat = [
			{ view: 'month' },
			{ view: 'basicWeek' },
			{ view: 'agendaWeek' },
			{ view: 'basicDay' },
			{ view: 'agendaDay' }
		];

		beforeEach(function() {
			$('#cal').fullCalendar({
				defaultDate: '2014-05-11',
				columnHead: false
			});
		});

		it('header should not be visible', function() {
			var cal = $('#cal');

			for (var i = 0; i <  viewWithFormat.length; i++) {
				var crtView = viewWithFormat[i];
				cal.fullCalendar('changeView', crtView.view);
				expect(cal.find('thead.fc-head').length).toBe(0);
			};
		});
	});

	describe('when columnHead is set on a per-view basis', function() {

		var viewWithFormat = [
			{ view: 'month', columnHeadLength: 0 },
			{ view: 'basicWeek', columnHeadLength: 1 },
			{ view: 'agendaWeek', columnHeadLength: 0 },
			{ view: 'basicDay', columnHeadLength: 0 },
			{ view: 'agendaDay', columnHeadLength: 1 }
		];

		beforeEach(function() {
			$('#cal').fullCalendar({
				defaultDate: '2014-05-11',
				views: {
					month: { columnHead: false },
					agendaDay: { columnHead: true },
					agendaWeek: { columnHead: false },
					basicDay: { columnHead: false },
					basicWeek: { columnHead: true }
				}
			});
		});

		it('if columnHead is false, header should not be visible', function() {
			var cal = $('#cal');

			for (var i = 0; i <  viewWithFormat.length; i++) {
				var crtView = viewWithFormat[i];
				cal.fullCalendar('changeView', crtView.view);
				expect(cal.find('thead.fc-head').length).toBe(crtView.columnHeadLength);
			};
		});
	});
});