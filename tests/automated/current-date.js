describe('current date', function() {

	var TITLE_FORMAT = 'MMMM D YYYY';
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			titleFormat: TITLE_FORMAT,
			defaultDate: '2014-06-01'
		};
	});

	describe('defaultDate & getDate', function() {
		describeWhenInMonth(function() {
			it('should initialize at the date', function() {
				options.defaultDate = '2011-03-10';
				$('#cal').fullCalendar(options);
				expectViewDates('2011-02-27', '2011-04-10', '2011-03-01');
				var currentDate = $('#cal').fullCalendar('getDate');
				expect(moment.isMoment(currentDate)).toEqual(true); // test the type, but only here
				expect(currentDate).toEqualMoment('2011-03-10');
			});
		});
		describeWhenInWeek(function() {
			it('should initialize at the date, given a date string', function() {
				options.defaultDate = '2011-03-10';
				$('#cal').fullCalendar(options);
				expectViewDates('2011-03-06', '2011-03-13');
				expect($('#cal').fullCalendar('getDate')).toEqualMoment('2011-03-10');
			});
			it('should initialize at the date, given a Moment object', function() {
				options.defaultDate = $.fullCalendar.moment('2011-03-10');
				$('#cal').fullCalendar(options);
				expectViewDates('2011-03-06', '2011-03-13');
				expect($('#cal').fullCalendar('getDate')).toEqualMoment('2011-03-10');
			});
		});
		describeWhenInDay(function() {
			it('should initialize at the date', function() {
				options.defaultDate = '2011-03-10';
				$('#cal').fullCalendar(options);
				expectViewDates('2011-03-10');
				expect($('#cal').fullCalendar('getDate')).toEqualMoment('2011-03-10');
			});
		});
	});

	describe('gotoDate', function() {
		describeWhenInMonth(function() {
			it('should go to a date when given a date string', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('gotoDate', '2015-04-01');
				expectViewDates('2015-03-29', '2015-05-10', '2015-04-01');
			});
		});
		describeWhenInWeek(function() {
			it('should go to a date when given a date string', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('gotoDate', '2015-04-01');
				expectViewDates('2015-03-29', '2015-04-05');
			});
			it('should go to a date when given a date string with a time', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('gotoDate', '2015-04-01T12:00:00');
				expectViewDates('2015-03-29', '2015-04-05');
			});
			it('should go to a date when given a moment object', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('gotoDate', $.fullCalendar.moment('2015-04-01'));
				expectViewDates('2015-03-29', '2015-04-05');
			});
		});
		describeWhenInDay(function() {
			it('should go to a date when given a date string', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('gotoDate', '2015-04-01');
				expectViewDates('2015-04-01');
			});
		});
	});

	describe('incrementDate', function() {
		describeWhenInMonth(function() {
			it('should increment the date when given a Duration object', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('incrementDate', { months: -1 });
				expectViewDates('2014-04-27', '2014-06-08', '2014-05-01');
			});
		});
		describeWhenInWeek(function() {
			it('should increment the date when given a Duration object', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('incrementDate', { weeks: -2 });
				expectViewDates('2014-05-18', '2014-05-25');
			});
		});
		describeWhenInDay(function() {
			it('should increment the date when given a Duration object', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('incrementDate', { days: 2 });
				expectViewDates('2014-06-03');
			});
			it('should increment the date when given a Duration string', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('incrementDate', '2.00:00:00');
				expectViewDates('2014-06-03');
			});
			it('should increment the date when given a Duration string with a time', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('incrementDate', '2.05:30:00');
				expectViewDates('2014-06-03');
			});
		});
	});

	describe('prev', function() {
		describeWhenInMonth(function() {
			it('should move the calendar back a month', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('prev');
				expectViewDates('2014-04-27', '2014-06-08', '2014-05-01');
			});
		});
		describeWhenInWeek(function() {
			it('should move the calendar back a week', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('prev');
				expectViewDates('2014-05-25', '2014-06-01');
			});
		});
		describeWhenInDay(function() {
			it('should move the calendar back a week', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('prev');
				expectViewDates('2014-05-31');
			});
		});
	});

	describe('next', function() {
		describeWhenInMonth(function() {
			it('should move the calendar forward a month', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('next');
				expectViewDates('2014-06-29', '2014-08-10', '2014-07-01');
			});
		});
		describeWhenInWeek(function() {
			it('should move the calendar forward a week', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('next');
				expectViewDates('2014-06-08', '2014-06-15');
			});
		});
		describeWhenInDay(function() {
			it('should move the calendar forward a week', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('next');
				expectViewDates('2014-06-02');
			});
		});
	});

	describe('prevYear', function() {
		describeWhenInMonth(function() {
			it('should move the calendar back a year', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('prevYear');
				expectViewDates('2013-05-26', '2013-07-07', '2013-06-01');
			});
		});
		describeWhenInWeek(function() {
			it('should move the calendar back a year', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('prevYear');
				expectViewDates('2013-05-26', '2013-06-02');
			});
		});
		describeWhenInDay(function() {
			it('should move the calendar back a year', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('prevYear');
				expectViewDates('2013-06-01');
			});
		});
	});

	describe('nextYear', function() {
		describeWhenInMonth(function() {
			it('should move the calendar forward a year', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('nextYear');
				expectViewDates('2015-05-31', '2015-07-12', '2015-06-01');
			});
		});
		describeWhenInWeek(function() {
			it('should move the calendar forward a year', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('nextYear');
				expectViewDates('2015-05-31', '2015-06-07');
			});
		});
		describeWhenInDay(function() {
			it('should move the calendar forward a year', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('nextYear');
				expectViewDates('2015-06-01');
			});
		});
	});

	describe('today', function() {
		beforeEach(function() {
			options.now = '2016-03-15'; // the "today" date
		});
		describeWhenInMonth(function() {
			it('should move the calendar to now', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('today');
				expectViewDates('2016-02-28', '2016-04-10', '2016-03-01');
			});
		});
		describeWhenInWeek(function() {
			it('should move the calendar to now', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('today');
				expectViewDates('2016-03-13', '2016-03-20');
			});
		});
		describeWhenInDay(function() {
			it('should move the calendar to now', function() {
				$('#cal').fullCalendar(options);
				$('#cal').fullCalendar('today');
				expectViewDates('2016-03-15');
			});
		});
	});


	// UTILS
	// -----

	function describeWhenInMonth(func) {
		describeWhenIn('month', func);
	}

	function describeWhenInWeek(func) {
		describeWhenIn('basicWeek', func);
		describeWhenIn('agendaWeek', func);
	}

	function describeWhenInDay(func) {
		describeWhenIn('basicDay', func);
		describeWhenIn('agendaDay', func);
	}

	function describeWhenIn(viewName, func) {
		describe('when in ' + viewName, function() {
			beforeEach(function() {
				options.defaultView = viewName;
			});
			func();
		});
	}

	function expectViewDates(start, end, titleDate) {
		var view = $('#cal').fullCalendar('getView');
		var calculatedEnd;
		var title;

		start = $.fullCalendar.moment(start);
		calculatedEnd = end ? $.fullCalendar.moment(end) : start.clone().add('days', 1);
		expect(start).toEqualMoment(view.start);
		expect(calculatedEnd).toEqualMoment(view.end);

		if (titleDate || !end) {
			title = $.fullCalendar.moment(titleDate || start).format(TITLE_FORMAT);
		}
		else {
			title = $.fullCalendar.formatRange(
				start,
				calculatedEnd.clone().add('ms', -1),
				TITLE_FORMAT
			);
		}
		expect($('.fc-header-title h2')).toContainText(title);
	}

});
