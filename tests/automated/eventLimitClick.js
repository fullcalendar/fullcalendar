
describe('eventLimitClick', function() { // simulate a click

	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-01', // important that it is the first week, so works w/ month + week views
			defaultView: 'month',
			eventLimit: 3,
			events: [
				{ title: 'event1', start: '2014-07-29' },
				{ title: 'event2', start: '2014-07-29' },
				{ title: 'event2', start: '2014-07-29' },
				{ title: 'event2', start: '2014-07-29' }
			]
		};
	});

	describe('when set to "popover"', function() {

		beforeEach(function() {
			options.eventLimitClick = 'popover';
		});

		it('renders a popover upon click', function() {
			$('#cal').fullCalendar(options);
			$('.fc-more').simulate('click');
			expect($('.fc-more-popover')).toBeVisible();
		});

		// more popover tests are done in eventLimit-popover
	});

	describe('when set to "week"', function() {

		beforeEach(function() {
			options.eventLimitClick = 'week';
		});

		it('should go to basicWeek if it is one of the available views', function() {
			options.header = {
				left: 'prev,next today',
				center: 'title',
				right: 'month,basicWeek,basicDay'
			};
			$('#cal').fullCalendar(options);
			$('.fc-more').simulate('click');
			var view = $('#cal').fullCalendar('getView');
			expect(view.name).toBe('basicWeek'); // .name should be deprecated
			expect(view.type).toBe('basicWeek');
		});

		it('should go to agendaWeek if it is one of the available views', function() {
			options.header = {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			};
			$('#cal').fullCalendar(options);
			$('.fc-more').simulate('click');
			var view = $('#cal').fullCalendar('getView');
			expect(view.name).toBe('agendaWeek'); // .name should be deprecated
			expect(view.type).toBe('agendaWeek');
		});
	});

	describe('when set to "day"', function() {

		beforeEach(function() {
			options.eventLimitClick = 'day';
		});

		it('should go to basicDay if it is one of the available views', function() {
			options.header = {
				left: 'prev,next today',
				center: 'title',
				right: 'month,basicWeek,basicDay'
			};
			$('#cal').fullCalendar(options);
			$('.fc-more').simulate('click');
			var view = $('#cal').fullCalendar('getView');
			expect(view.name).toBe('basicDay');
		});

		it('should go to agendaDay if it is one of the available views', function() {
			options.header = {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			};
			$('#cal').fullCalendar(options);
			$('.fc-more').simulate('click');
			var view = $('#cal').fullCalendar('getView');
			expect(view.name).toBe('agendaDay');
		});
	});

	it('works with an explicit view name', function() {
		options.eventLimitClick = 'agendaWeek';
		options.header = {
			left: 'prev,next today',
			center: 'title',
			right: 'month,basicWeek,basicDay'
		};
		$('#cal').fullCalendar(options);
		$('.fc-more').simulate('click');
		var view = $('#cal').fullCalendar('getView');
		expect(view.name).toBe('agendaWeek');
	});

	it('works with custom function and all the arguments are correct', function() {
		options.eventLimitClick = function(cellInfo, jsEvent) {
			expect(typeof cellInfo).toBe('object');
			expect(typeof jsEvent).toBe('object');
			expect(cellInfo.date).toEqualMoment('2014-07-29');
			expect(cellInfo.dayEl.data('date')).toBe('2014-07-29');
			expect(cellInfo.hiddenSegs.length).toBe(2);
			expect(cellInfo.segs.length).toBe(4);
			expect(cellInfo.moreEl).toHaveClass('fc-more');
		};
		$('#cal').fullCalendar(options);
		$('.fc-more').simulate('click');
	});

	it('works with custom function, and can return a view name', function() {
		options.eventLimitClick = function(cellInfo, jsEvent) {
			return 'agendaDay';
		};
		$('#cal').fullCalendar(options);
		$('.fc-more').simulate('click');
		var view = $('#cal').fullCalendar('getView');
		expect(view.name).toBe('agendaDay');
	});

});
