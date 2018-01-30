describe('current date', function() {

  var TITLE_FORMAT = 'MMMM D YYYY'
  pushOptions({
    titleFormat: TITLE_FORMAT,
    titleRangeSeparator: ' - ',
    defaultDate: '2014-06-01'
  })

  describe('defaultDate & getDate', function() { // keep getDate
    describeWhenInMonth(function() {
      it('should initialize at the date', function() {
        var options = {}
        options.defaultDate = '2011-03-10'
        initCalendar(options)
        expectViewDates('2011-02-27', '2011-04-10', '2011-03-01', '2011-04-01')
        var currentDate = currentCalendar.getDate()
        expect(moment.isMoment(currentDate)).toEqual(true) // test the type, but only here
        expect(currentDate).toEqualMoment('2011-03-10')
      })
    })
    describeWhenInWeek(function() {
      it('should initialize at the date, given a date string', function() {
        var options = {}
        options.defaultDate = '2011-03-10'
        initCalendar(options)
        expectViewDates('2011-03-06', '2011-03-13')
        expect(currentCalendar.getDate()).toEqualMoment('2011-03-10')
      })
      it('should initialize at the date, given a Moment object', function() {
        var options = {}
        options.defaultDate = $.fullCalendar.moment('2011-03-10')
        initCalendar(options)
        expectViewDates('2011-03-06', '2011-03-13')
        expect(currentCalendar.getDate()).toEqualMoment('2011-03-10')
      })
    })
    describeWhenInDay(function() {
      it('should initialize at the date', function() {
        var options = {}
        options.defaultDate = '2011-03-10'
        initCalendar(options)
        expectViewDates('2011-03-10')
        expect(currentCalendar.getDate()).toEqualMoment('2011-03-10')
      })
    })
  })

  describe('gotoDate', function() {
    describeWhenInMonth(function() {
      it('should go to a date when given a date string', function() {
        initCalendar()
        currentCalendar.gotoDate('2015-04-01')
        expectViewDates('2015-03-29', '2015-05-10', '2015-04-01', '2015-05-01')
      })
    })
    describeWhenInWeek(function() {
      it('should go to a date when given a date string', function() {
        initCalendar()
        currentCalendar.gotoDate('2015-04-01')
        expectViewDates('2015-03-29', '2015-04-05')
      })
      it('should go to a date when given a date string with a time', function() {
        initCalendar()
        currentCalendar.gotoDate('2015-04-01T12:00:00')
        expectViewDates('2015-03-29', '2015-04-05')
      })
      it('should go to a date when given a moment object', function() {
        initCalendar()
        currentCalendar.gotoDate($.fullCalendar.moment('2015-04-01'))
        expectViewDates('2015-03-29', '2015-04-05')
      })
    })
    describeWhenInDay(function() {
      it('should go to a date when given a date string', function() {
        initCalendar()
        currentCalendar.gotoDate('2015-04-01')
        expectViewDates('2015-04-01')
      })
    })
  })

  describe('incrementDate', function() {
    describeWhenInMonth(function() {
      it('should increment the date when given a Duration object', function() {
        initCalendar()
        currentCalendar.incrementDate({ months: -1 })
        expectViewDates('2014-04-27', '2014-06-08', '2014-05-01', '2014-06-01')
      })
    })
    describeWhenInWeek(function() {
      it('should increment the date when given a Duration object', function() {
        initCalendar()
        currentCalendar.incrementDate({ weeks: -2 })
        expectViewDates('2014-05-18', '2014-05-25')
      })
    })
    describeWhenInDay(function() {
      it('should increment the date when given a Duration object', function() {
        initCalendar()
        currentCalendar.incrementDate({ days: 2 })
        expectViewDates('2014-06-03')
      })
      it('should increment the date when given a Duration string', function() {
        initCalendar()
        currentCalendar.incrementDate('2.00:00:00')
        expectViewDates('2014-06-03')
      })
      it('should increment the date when given a Duration string with a time', function() {
        initCalendar()
        currentCalendar.incrementDate('2.05:30:00')
        expectViewDates('2014-06-03')
      })
    })
  })

  describe('prevYear', function() {
    describeWhenInMonth(function() {
      it('should move the calendar back a year', function() {
        initCalendar()
        currentCalendar.prevYear()
        expectViewDates('2013-05-26', '2013-07-07', '2013-06-01', '2013-07-01')
      })
    })
    describeWhenInWeek(function() {
      it('should move the calendar back a year', function() {
        initCalendar()
        currentCalendar.prevYear()
        expectViewDates('2013-05-26', '2013-06-02')
      })
    })
    describeWhenInDay(function() {
      it('should move the calendar back a year', function() {
        initCalendar()
        currentCalendar.prevYear()
        expectViewDates('2013-06-01')
      })
    })
  })

  describe('nextYear', function() {
    describeWhenInMonth(function() {
      it('should move the calendar forward a year', function() {
        initCalendar()
        currentCalendar.nextYear()
        expectViewDates('2015-05-31', '2015-07-12', '2015-06-01', '2015-07-01')
      })
    })
    describeWhenInWeek(function() {
      it('should move the calendar forward a year', function() {
        initCalendar()
        currentCalendar.nextYear()
        expectViewDates('2015-05-31', '2015-06-07')
      })
    })
    describeWhenInDay(function() {
      it('should move the calendar forward a year', function() {
        initCalendar()
        currentCalendar.nextYear()
        expectViewDates('2015-06-01')
      })
    })
  })

  describe('when current date is a hidden day', function() {
    describeWhenInMonth(function() {
      it('should display the current month even if first day of month', function() {
        var options = {}
        options.now = options.defaultDate = '2014-06-01' // a Sunday
        options.weekends = false
        initCalendar(options)
        var view = currentCalendar.getView()
        expect(view.start).toEqualMoment('2014-06-02')
        expect(view.end).toEqualMoment('2014-07-12')
        expect(view.intervalStart).toEqualMoment('2014-06-01')
        expect(view.intervalEnd).toEqualMoment('2014-07-01')
      })
      it('should display the current month', function() {
        var options = {}
        options.now = options.defaultDate = '2014-05-04' // a Sunday
        options.weekends = false
        initCalendar(options)
        var view = currentCalendar.getView()
        expect(view.start).toEqualMoment('2014-04-28')
        expect(view.end).toEqualMoment('2014-06-07')
        expect(view.intervalStart).toEqualMoment('2014-05-01')
        expect(view.intervalEnd).toEqualMoment('2014-06-01')
      })
      describe('when navigating back a month', function() {
        it('should not skip months', function() {
          var options = {}
          options.defaultDate = '2014-07-07'
          options.weekends = false
          initCalendar(options)
          var view = currentCalendar.getView()
          expect(view.intervalStart).toEqualMoment('2014-07-01')
          expect(view.intervalEnd).toEqualMoment('2014-08-01')
          currentCalendar.prev() // will move to Jun 1, which is a Sunday
          view = currentCalendar.getView()
          expect(view.intervalStart).toEqualMoment('2014-06-01')
          expect(view.intervalEnd).toEqualMoment('2014-07-01')
        })
      })
    })
    describeWhenInDay(function() {
      it('should display the next visible day', function() {
        var options = {}
        options.now = options.defaultDate = '2014-06-01' // a Sunday
        options.weekends = false
        initCalendar(options)
        var view = currentCalendar.getView()
        expect(view.start).toEqualMoment('2014-06-02')
        expect(view.end).toEqualMoment('2014-06-03')
        expect(view.intervalStart).toEqualMoment('2014-06-02')
        expect(view.intervalEnd).toEqualMoment('2014-06-03')
      })
    })
  })


  // UTILS
  // -----

  function describeWhenInMonth(func) {
    describeWhenIn('month', func)
  }

  function describeWhenInWeek(func) {
    describeWhenIn('basicWeek', func)
    describeWhenIn('agendaWeek', func)
  }

  function describeWhenInDay(func) {
    describeWhenIn('basicDay', func)
    describeWhenIn('agendaDay', func)
  }

  function describeWhenIn(viewName, func) {
    describe('when in ' + viewName, function() {
      pushOptions({defaultView: viewName})
      func()
    })
  }

  function expectViewDates(start, end, titleStart, titleEnd) {
    var view = currentCalendar.getView()
    var calculatedEnd
    var title

    start = $.fullCalendar.moment(start)
    calculatedEnd = end ? $.fullCalendar.moment(end) : start.clone().add(1, 'days')
    expect(start).toEqualMoment(view.start)
    expect(calculatedEnd).toEqualMoment(view.end)

    titleStart = titleStart ? $.fullCalendar.moment(titleStart) : start
    titleEnd = titleEnd ? $.fullCalendar.moment(titleEnd) : calculatedEnd

    if (titleEnd) {
      title = $.fullCalendar.formatRange(
        titleStart,
        titleEnd.clone().add(-1, 'ms'),
        TITLE_FORMAT,
        ' - '
      )
    } else {
      title = titleStart.format(TITLE_FORMAT)
    }

    expect($('.fc-toolbar h2')).toContainText(title)
  }

})
