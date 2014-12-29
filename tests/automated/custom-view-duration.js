describe('custom view duration', function() {
	var options;

	beforeEach(function() {
		options = {
			views: {}
		};
		affix('#cal');
	});

	it('renders a 4 day basic view', function() {
		options.views.basicFourDay = {
			type: 'basic',
			duration: { days: 4 }
		};
		options.defaultView = 'basicFourDay';
		options.defaultDate = '2014-12-25';
		$('#cal').fullCalendar(options);
		expect($('.fc-day-grid .fc-row').length).toBe(1);
		expect($('.fc-day-grid .fc-row .fc-day').length).toBe(4);
		expect($('.fc-day-grid .fc-row .fc-day:first'))
			.toBeMatchedBy('[data-date="2014-12-25"]'); // starts on defaultDate
	});

	it('renders a 2 week basic view', function() {
		options.views.basicTwoWeek = {
			type: 'basic',
			duration: { weeks: 2 }
		};
		options.defaultView = 'basicTwoWeek';
		options.defaultDate = '2014-12-25';
		options.firstDay = 2; // Tues
		$('#cal').fullCalendar(options);
		expect($('.fc-day-grid .fc-row').length).toBe(2);
		expect($('.fc-day-grid .fc-day').length).toBe(14);
		expect($('.fc-day-grid .fc-day:first')).toBeMatchedBy('.fc-tue'); // respects start-of-week
		expect($('.fc-day-grid .fc-day:first')).toBeMatchedBy('[data-date="2014-12-23"]'); // week start. tues
	});

	it('will use the provided options', function() {
		options.views.basicFourDay = {
			type: 'basic',
			duration: { days: 4 },
			titleFormat: '[special]'
		};
		options.defaultView = 'basicFourDay';
		$('#cal').fullCalendar(options);
		expect($('h2')).toHaveText('special');
	});

	it('will inherit options from the parent view type', function() {
		options.views.basic = {
			titleFormat: '[basictitle]'
		};
		options.views.basicFourDay = {
			type: 'basic',
			duration: { days: 4 }
		};
		options.defaultView = 'basicFourDay';
		$('#cal').fullCalendar(options);
		expect($('h2')).toHaveText('basictitle');
	});

	it('will override an option from the parent view type', function() {
		options.views.basic = {
			titleFormat: '[basictitle]'
		};
		options.views.basicFourDay = {
			type: 'basic',
			duration: { days: 4 },
			titleFormat: '[basicfourweekttitle]'
		};
		options.defaultView = 'basicFourDay';
		$('#cal').fullCalendar(options);
		expect($('h2')).toHaveText('basicfourweekttitle');
	});

	it('will inherit options from generic "week" type', function() {
		options.views.week = {
			titleFormat: '[weektitle]'
		};
		options.views.basicOneWeek = {
			type: 'basic',
			duration: { weeks: 1 }
		};
		options.defaultView = 'basicOneWeek';
		$('#cal').fullCalendar(options);
		expect($('h2')).toHaveText('weektitle');
	});

	it('generic type options for "basic" will override generic "week" options', function() {
		options.views.week = {
			titleFormat: '[weektitle]'
		};
		options.views.basic = {
			titleFormat: '[basictitle]'
		};
		options.views.basicOneWeek = {
			type: 'basic',
			duration: { weeks: 1 }
		};
		options.defaultView = 'basicOneWeek';
		$('#cal').fullCalendar(options);
		expect($('h2')).toHaveText('basictitle');
	});

	it('will not inherit "week" options if more than a single week', function() {
		options.titleFormat = '[defaultitle]';
		options.views.week = {
			titleFormat: '[weektitle]'
		};
		options.views.basicTwoWeek = {
			type: 'basic',
			duration: { weeks: 2 }
		};
		options.defaultView = 'basicTwoWeek';
		$('#cal').fullCalendar(options);
		expect($('h2')).toHaveText('defaultitle');
	});

	it('renders a 4 day agenda view', function() {
		options.views.agendaFourDay = {
			type: 'agenda',
			duration: { days: 4 }
		};
		options.defaultView = 'agendaFourDay';
		options.defaultDate = '2014-12-25';
		$('#cal').fullCalendar(options);
		expect($('.fc-day-grid .fc-row').length).toBe(1);
		expect($('.fc-day-grid .fc-row .fc-day').length).toBe(4);
		expect($('.fc-time-grid .fc-day').length).toBe(4);
		expect($('.fc-time-grid .fc-day:first')).toBeMatchedBy('[data-date="2014-12-25"]'); // starts on defaultDate
	});

	it('renders a two week agenda view', function() {
		options.views.agendaTwoWeek = {
			type: 'agenda',
			duration: { weeks: 2 }
		};
		options.defaultView = 'agendaTwoWeek';
		options.defaultDate = '2014-12-25';
		$('#cal').fullCalendar(options);
		expect($('.fc-day-grid .fc-row').length).toBe(1);
		expect($('.fc-day-grid .fc-row .fc-day').length).toBe(14); // one long row
		expect($('.fc-time-grid .fc-day').length).toBe(14);
		expect($('.fc-time-grid .fc-day:first')).toBeMatchedBy('[data-date="2014-12-21"]'); // week start
	});

	it('renders a two month agenda view', function() {
		options.views.agendaTwoMonth = {
			type: 'agenda',
			duration: { months: 2 }
		};
		options.defaultView = 'agendaTwoMonth';
		options.defaultDate = '2014-11-27';
		$('#cal').fullCalendar(options);
		expect($('.fc-day-grid .fc-row').length).toBe(1);
		expect($('.fc-day-grid .fc-row .fc-day').length).toBe(61); // one long row
		expect($('.fc-time-grid .fc-day').length).toBe(61);
		expect($('.fc-time-grid .fc-day:first')).toBeMatchedBy('[data-date="2014-11-01"]');
		expect($('.fc-time-grid .fc-day:last')).toBeMatchedBy('[data-date="2014-12-31"]');
	});

	it('renders a two month basic view', function() {
		options.views.basicTwoWeek = {
			type: 'basic',
			duration: { months: 2 }
		};
		options.defaultView = 'basicTwoWeek';
		options.defaultDate = '2014-11-27';
		$('#cal').fullCalendar(options);
		expect($('.fc-day-grid .fc-row').length).toBe(10);
		expect($('.fc-day-grid .fc-row:first .fc-day').length).toBe(7);
		expect($('.fc-day-grid .fc-day:first')).toBeMatchedBy('[data-date="2014-10-26"]');
		expect($('.fc-day-grid .fc-day:last')).toBeMatchedBy('[data-date="2015-01-03"]');
	});

	it('renders a one year basic view', function() {
		options.views.basicYear = {
			type: 'basic',
			duration: { years: 1 }
		};
		options.defaultView = 'basicYear';
		options.defaultDate = '2014-11-27';
		$('#cal').fullCalendar(options);
		expect($('.fc-day-grid .fc-day:first')).toBeMatchedBy('[data-date="2013-12-29"]');
		expect($('.fc-day-grid .fc-day:last')).toBeMatchedBy('[data-date="2015-01-03"]');
	});
});