
describe('isRTL tests', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('when setting l:prev c:today r:next settings with isRTL default', function() {
		beforeEach(function() {
			var options = {
				header: {
					left: 'prev',
					center: 'today',
					right: 'next'
				}
			};
			$('#cal').fullCalendar(options);
			var cal = $('#cal');
		});
		it('should have prev in left', function() {
			var fcHeaderLeft = $(cal).find('.fc-header-left')[0];
			expect(fcHeaderLeft).toContain('.fc-button-prev');
		});
		it('should have today in center', function() {
			var fcHeaderCenter = $(cal).find('.fc-header-center')[0];
			expect(fcHeaderCenter).toContain('.fc-button-today');
		});
		it('should have next in right', function() {
			var fcHeaderRight = $(cal).find('.fc-header-right')[0];
			expect(fcHeaderRight).toContain('.fc-button-next');
		});
	});

	describe('when setting l:prev c:today r:next settings with isRTL false', function() {
		beforeEach(function() {
			var options = {};
			$('#cal').fullCalendar({
				header: {
					left: 'prev',
					center: 'today',
					right: 'next'
				},
				isRTL: false
			});
			var cal = $('#cal');
		});
		it('should have prev in left', function() {
			var fcHeaderLeft = $(cal).find('.fc-header-left')[0];
			expect(fcHeaderLeft).toContain('.fc-button-prev');
		});
		it('should have today in center', function() {
			var fcHeaderCenter = $(cal).find('.fc-header-center')[0];
			expect(fcHeaderCenter).toContain('.fc-button-today');
		});
		it('should have next in right', function() {
			var fcHeaderRight = $(cal).find('.fc-header-right')[0];
			expect(fcHeaderRight).toContain('.fc-button-next');
		});
	});

	describe('when setting l:prev c:today r:next settings with isRTL true', function() {
		beforeEach(function() {
			var options = {};
			$('#cal').fullCalendar({
				header: {
					left: 'prev',
					center: 'today',
					right: 'next'
				},
				isRTL: true
			});
			var cal = $('#cal');
		});
		it('should have prev in left', function() {
			var fcHeaderLeft = $(cal).find('.fc-header-left')[0];
			expect(fcHeaderLeft).toContain('.fc-button-prev');
		});
		it('should have today in center', function() {
			var fcHeaderCenter = $(cal).find('.fc-header-center')[0];
			expect(fcHeaderCenter).toContain('.fc-button-today');
		});
		it('should have next in right', function() {
			var fcHeaderRight = $(cal).find('.fc-header-right')[0];
			expect(fcHeaderRight).toContain('.fc-button-next');
		});
	});

	describe('when using default view (month)', function() {

		describe('using default isRTL', function() {
			beforeEach(function() {
				var options = {};
				$('#cal').fullCalendar();
				var cal = $('#cal');
			});
			it('should have have days ordered sun to sat', function() {
				var fc = $(cal).find('.fc-day-header');
				expect(fc[0]).toHaveClass('fc-sun');
				expect(fc[1]).toHaveClass('fc-mon');
				expect(fc[2]).toHaveClass('fc-tue');
				expect(fc[3]).toHaveClass('fc-wed');
				expect(fc[4]).toHaveClass('fc-thu');
				expect(fc[5]).toHaveClass('fc-fri');
				expect(fc[6]).toHaveClass('fc-sat');
			});
		});

		describe('using default isRTL is set to false', function() {
			beforeEach(function() {
				var options = {};
				$('#cal').fullCalendar({
					isRTL: false
				});
				var cal = $('#cal');
			});
			it('should have have days ordered sun to sat', function() {
				var fc = $(cal).find('.fc-day-header');
				expect(fc[0]).toHaveClass('fc-sun');
				expect(fc[1]).toHaveClass('fc-mon');
				expect(fc[2]).toHaveClass('fc-tue');
				expect(fc[3]).toHaveClass('fc-wed');
				expect(fc[4]).toHaveClass('fc-thu');
				expect(fc[5]).toHaveClass('fc-fri');
				expect(fc[6]).toHaveClass('fc-sat');
			});
		});

		describe('using default isRTL is set to false', function() {
			beforeEach(function() {
				var options = {};
				$('#cal').fullCalendar({
					isRTL: true
				});
				var cal = $('#cal');
			});
			it('should have have days ordered back sat to sun', function() {
				var fc = $(cal).find('.fc-day-header');
				expect(fc[6]).toHaveClass('fc-sun');
				expect(fc[5]).toHaveClass('fc-mon');
				expect(fc[4]).toHaveClass('fc-tue');
				expect(fc[3]).toHaveClass('fc-wed');
				expect(fc[2]).toHaveClass('fc-thu');
				expect(fc[1]).toHaveClass('fc-fri');
				expect(fc[0]).toHaveClass('fc-sat');
			});
		});
	});

	describe('when using agendaWeek view', function() {

		describe('when using default isRTL', function() {
			beforeEach(function() {
				var options = {};
				$('#cal').fullCalendar({
					defaultView: 'agendaWeek'
				});
			});
			it('should have have days ordered sun to sat', function() {
				var fc = $(cal).find('.fc-agenda-days th');
				expect(fc[0]).toHaveClass('fc-agenda-axis');
				expect(fc[1]).toHaveClass('fc-sun');
				expect(fc[2]).toHaveClass('fc-mon');
				expect(fc[3]).toHaveClass('fc-tue');
				expect(fc[4]).toHaveClass('fc-wed');
				expect(fc[5]).toHaveClass('fc-thu');
				expect(fc[6]).toHaveClass('fc-fri');
				expect(fc[7]).toHaveClass('fc-sat');
			});
		});

		describe('when using isRTL false', function() {
			beforeEach(function() {
				var options = {};
				$('#cal').fullCalendar({
					defaultView: 'agendaWeek',
					isRTL: false
				});
			});
			it('should have have days ordered sun to sat', function() {
				var fc = $(cal).find('.fc-agenda-days th');
				expect(fc[0]).toHaveClass('fc-agenda-axis');
				expect(fc[1]).toHaveClass('fc-sun');
				expect(fc[2]).toHaveClass('fc-mon');
				expect(fc[3]).toHaveClass('fc-tue');
				expect(fc[4]).toHaveClass('fc-wed');
				expect(fc[5]).toHaveClass('fc-thu');
				expect(fc[6]).toHaveClass('fc-fri');
				expect(fc[7]).toHaveClass('fc-sat');
			});
		});

		describe('when using isRTL true', function() {
			beforeEach(function() {
				var options = {};
				$('#cal').fullCalendar({
					defaultView: 'agendaWeek',
					isRTL: true
				});
			});
			it('should have have days ordered sun to sat', function() {
				var fc = $(cal).find('.fc-agenda-days th');
				expect(fc[0]).toHaveClass('fc-agenda-axis');
				expect(fc[1]).toHaveClass('fc-sat');
				expect(fc[2]).toHaveClass('fc-fri');
				expect(fc[3]).toHaveClass('fc-thu');
				expect(fc[4]).toHaveClass('fc-wed');
				expect(fc[5]).toHaveClass('fc-tue');
				expect(fc[6]).toHaveClass('fc-mon');
				expect(fc[7]).toHaveClass('fc-sun');
			});
		});
	});

	xdescribe('when using agendaWeek view', function() {
		describe('and switching from isRTL false to true', function() {
			beforeEach(function() {
				$('#cal').fullCalendar({
					defaultView: 'agendaWeek',
					isRTL: false
				});
			});
			it('should result in sunday moving from first to last day', function() {
				var fcDaysBefore = $(cal).find('.fc-agenda-days th');
				$('#cal').fullCalendar('isRTL', 'true');
				var fcDaysAfter = $(cal).find('.fc-agenda-days th');
				expect(fcDaysBefore[1]).toHaveClass('fc-sun');
				expect(fcDaysAfter[7]).toHaveCalss('fc-sun');
			});
		});
	});
});