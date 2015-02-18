describe('custom view', function() {
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

	describe('buttonText', function() {

		it('accepts buttonText exact-match override', function() {
			options.buttonText = {
				custom: 'over-ridden'
			};
			options.views.custom = {
				type: 'basic',
				duration: { days: 4 },
				buttonText: 'awesome'
			};
			options.header = {
				center: 'custom,month'
			};
			options.defaultView = 'custom';
			$('#cal').fullCalendar(options);
			expect($('.fc-custom-button')).toHaveText('over-ridden');
		});

		it('accepts buttonText single-unit-match override', function() {
			options.buttonText = {
				day: '1day-over-ridden'
			};
			options.views.custom = {
				type: 'basic',
				duration: { days: 1 },
				buttonText: 'awesome'
			};
			options.header = {
				center: 'custom,month'
			};
			options.defaultView = 'custom';
			$('#cal').fullCalendar(options);
			expect($('.fc-custom-button')).toHaveText('1day-over-ridden');
		});

		it('does not accept buttonText unit-match override when unit is more than one', function() {
			options.buttonText = {
				day: '1day!!!???'
			};
			options.views.custom = {
				type: 'basic',
				duration: { days: 2 },
				buttonText: 'awesome'
			};
			options.header = {
				center: 'custom,month'
			};
			options.defaultView = 'custom';
			$('#cal').fullCalendar(options);
			expect($('.fc-custom-button')).toHaveText('awesome');
		});

		it('accepts lang\'s single-unit-match override', function() {
			options.lang = 'fr';
			options.views.custom = {
				type: 'basic',
				duration: { days: 1 }
			};
			options.header = {
				center: 'custom,month'
			};
			options.defaultView = 'custom';
			$('#cal').fullCalendar(options);
			expect($('.fc-custom-button')).toHaveText('Jour');
		});

		it('accepts explicit View-Specific buttonText, overriding lang\'s single-unit-match override', function() {
			options.lang = 'fr';
			options.views.custom = {
				type: 'basic',
				duration: { days: 1 },
				buttonText: 'awesome'
			};
			options.header = {
				center: 'custom,month'
			};
			options.defaultView = 'custom';
			$('#cal').fullCalendar(options);
			expect($('.fc-custom-button')).toHaveText('awesome');
		});

		it('respects custom view\'s value', function() {
			options.views.custom = {
				type: 'basic',
				duration: { days: 4 },
				buttonText: 'awesome'
			};
			options.header = {
				center: 'custom,month'
			};
			options.defaultView = 'custom';
			$('#cal').fullCalendar(options);
			expect($('.fc-custom-button')).toHaveText('awesome');
		});

		it('respects custom view\'s value, even when a "smart" property name', function() {
			options.views.basicFourDay = { // "basicFourDay" is a pitfall for smartProperty
				type: 'basic',
				duration: { days: 4 },
				buttonText: 'awesome'
			};
			options.header = {
				center: 'basicFourDay,month'
			};
			options.defaultView = 'basicFourDay';
			$('#cal').fullCalendar(options);
			expect($('.fc-basicFourDay-button')).toHaveText('awesome');
		});

		it('falls back to humanized duration when not given', function() {
			options.views.custom = {
				type: 'basic',
				duration: { days: 4 }
			};
			options.header = {
				center: 'custom,month'
			};
			options.defaultView = 'custom';
			$('#cal').fullCalendar(options);
			expect($('.fc-custom-button')).toHaveText('4 days');
		});

		it('falls back to humanized duration and respects language', function() {
			options.lang = 'fr';
			options.views.custom = {
				type: 'basic',
				duration: { days: 4 }
			};
			options.header = {
				center: 'custom,month'
			};
			options.defaultView = 'custom';
			$('#cal').fullCalendar(options);
			expect($('.fc-custom-button')).toHaveText('4 jours');
			expect($('.fc-month-button')).toHaveText('Mois'); // test for the heck of it
		});

		it('falls back to view name when view lacks metadata', function() {
			$.fullCalendar.views.crazy = $.fullCalendar.View.extend();
			options.header = {
				center: 'crazy,month'
			};
			options.defaultView = 'crazy';
			$('#cal').fullCalendar(options);
			expect($('.fc-crazy-button')).toHaveText('crazy');
			delete $.fullCalendar.views.crazy;
		});
	});
});