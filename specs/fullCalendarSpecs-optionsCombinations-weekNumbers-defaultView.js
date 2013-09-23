'use strict';
describe('weekNumbers-defaultView:', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('when using basicWeek ', function() {
		describe('with default weekNumbers ', function() {
			it('should not display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'basicWeek'
				});
				var weekNumbersCount = $('.fc-week-number').length;
				expect(weekNumbersCount).toEqual(0);
			});
		});
		describe('with weekNumbers to false', function() {
			it('should not display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'basicWeek',
					weekNumbers: false
				});
				var weekNumbersCount = $('.fc-week-number').length;
				expect(weekNumbersCount).toEqual(0);
			});
		});
		describe('with weekNumbers to true ', function() {
			it('should display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'basicWeek',
					weekNumbers: true
				});
				var weekNumbersCount = $('.fc-week-number').length;
				// 1 row is header
				// 1 row is actual week number
				expect(weekNumbersCount).toEqual(2);
			});
		});
	});

	describe('when using basicDay', function() {
		describe('with default weekNumbers ', function() {
			it('should not display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'basicDay'
				});
				var weekNumbersCount = $('.fc-week-number').length;
				expect(weekNumbersCount).toEqual(0);
			});
		});
		describe('with weekNumbers to false', function() {
			it('should not display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'basicDay',
					weekNumbers: false
				});
				var weekNumbersCount = $('.fc-week-number').length;
				expect(weekNumbersCount).toEqual(0);
			});
		});
		describe('with weekNumbers to true ', function() {
			it('should display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'basicDay',
					weekNumbers: true
				});
				var weekNumbersCount = $('.fc-week-number').length;
				// 1 row is header
				// 1 row is actual week number
				expect(weekNumbersCount).toEqual(2);
			});
		});
	});

	describe('when using agendaWeek', function() {
		describe('with default weekNumbers ', function() {
			it('should not display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'agendaWeek'
				});
				var weekNumbersCount = $('.fc-week-number').length;
				expect(weekNumbersCount).toEqual(0);
			});
		});
		describe('with weekNumbers to false', function() {
			it('should not display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'agendaWeek',
					weekNumbers: false
				});
				var weekNumbersCount = $('.fc-week-number').length;
				expect(weekNumbersCount).toEqual(0);
			});
		});
		describe('with weekNumbers to true ', function() {
			it('should display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'agendaWeek',
					weekNumbers: true
				});
				var weekNumbersCount = $('.fc-week-number').length;
				// 1 row is axis
				expect(weekNumbersCount).toEqual(1);
			});
		});
	});

	describe('when using agendaDay', function() {
		describe('with default weekNumbers ', function() {
			it('should not display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'agendaDay'
				});
				var weekNumbersCount = $('.fc-week-number').length;
				expect(weekNumbersCount).toEqual(0);
			});
		});
		describe('with weekNumbers to false', function() {
			it('should not display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'agendaDay',
					weekNumbers: false
				});
				var weekNumbersCount = $('.fc-week-number').length;
				expect(weekNumbersCount).toEqual(0);
			});
		});
		describe('with weekNumbers to true ', function() {
			it('should display weekNumbers', function() {
				$('#cal').fullCalendar({
					defaultView: 'agendaDay',
					weekNumbers: true
				});
				var weekNumbersCount = $('.fc-week-number').length;
				// 1 row is axis
				expect(weekNumbersCount).toEqual(1);
			});
		});
	});
});