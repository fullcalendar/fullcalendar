describe('navLinks', function() {
  var options

  beforeEach(function() {
    options = {
      now: '2016-08-20',
      navLinks: true,
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listWeek' // affects which view is jumped to by default
      },
      dayClick: function() { }
    }
    spyOn(options, 'dayClick')
  })

  describe('in month view', function() {
    beforeEach(function() {
      options.defaultView = 'month'
    })

    it('moves to day', function() {
      initCalendar(options)
      $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
      expectDayView('agendaDay', '2016-08-09')
      expect(options.dayClick).not.toHaveBeenCalled()
    })

    // https://github.com/fullcalendar/fullcalendar/issues/3869
    it('moves to two different days', function() {
      initCalendar(options)
      $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
      expectDayView('agendaDay', '2016-08-09')
      expect(options.dayClick).not.toHaveBeenCalled()
      currentCalendar.changeView('month')
      $.simulateMouseClick(getDayGridNumberEl('2016-08-10'))
      expectDayView('agendaDay', '2016-08-10')
    })

    it('moves to agendaDay specifically', function() {
      options.navLinkDayClick = 'agendaDay'
      initCalendar(options)
      $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
      expectDayView('agendaDay', '2016-08-09')
      expect(options.dayClick).not.toHaveBeenCalled()
    })

    it('moves to basicDay specifically', function() {
      options.navLinkDayClick = 'basicDay'
      initCalendar(options)
      $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
      expectDayView('basicDay', '2016-08-09')
      expect(options.dayClick).not.toHaveBeenCalled()
    })

    it('executes a custom handler', function() {
      options.navLinkDayClick = function(date, ev) {
        expect(date.format()).toBe('2016-08-09')
        expect(typeof ev).toBe('object')
      }
      spyOn(options, 'navLinkDayClick').and.callThrough()
      initCalendar(options)
      $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
      expect(options.navLinkDayClick).toHaveBeenCalled()
      expect(options.dayClick).not.toHaveBeenCalled()
    })

    describe('with weekNumbers', function() {
      beforeEach(function() {
        options.weekNumbers = true
      })

      it('moves to week', function() {
        initCalendar(options)
        $.simulateMouseClick(getDayGridClassicWeekLinks().eq(1))
        expectWeekView('agendaWeek', '2016-08-07')
        expect(options.dayClick).not.toHaveBeenCalled()
      })

      it('moves to week with within-day rendering', function() {
        options.weekNumbersWithinDays = true
        initCalendar(options)
        $.simulateMouseClick(getDayGridEmbeddedWeekLinks().eq(1))
        expectWeekView('agendaWeek', '2016-08-07')
        expect(options.dayClick).not.toHaveBeenCalled()
      })
    })

    it('does not have clickable day header', function() {
      initCalendar(options)
      expect(getDayHeaderLinks().length).toBe(0)
    })
  })

  describe('in agendaWeek view', function() {
    beforeEach(function() {
      options.defaultView = 'agendaWeek'
    })

    it('moves to day view', function() {
      initCalendar(options)
      $.simulateMouseClick(getDayHeaderLink('2016-08-15'))
      expectDayView('agendaDay', '2016-08-15')
      expect(options.dayClick).not.toHaveBeenCalled()
    })
  })

  describe('in listWeek', function() {
    beforeEach(function() {
      options.defaultView = 'listWeek'
      options.events = [
        {
          title: 'event 1',
          start: '2016-08-20'
        }
      ]
    })

    it('moves to day view', function() {
      initCalendar(options)
      $.simulateMouseClick(getListDayHeaderLink('2016-08-20'))
      expectDayView('agendaDay', '2016-08-20')
      expect(options.dayClick).not.toHaveBeenCalled()
    })
  })

  describe('in agendaDay view', function() {
    beforeEach(function() {
      options.defaultView = 'agendaDay'
    })

    it('moves to week view', function() {
      options.weekNumbers = true
      initCalendar(options)
      $.simulateMouseClick(getAgendaWeekNumberLink())
      expectWeekView('agendaWeek', '2016-08-14')
      expect(options.dayClick).not.toHaveBeenCalled()
    })

    it('does not have a clickable day header', function() {
      initCalendar(options)
      expect(getDayHeaderLinks().length).toBe(0)
    })
  })


  /* utils
  ------------------------------------------------------------------------------------------------------------------ */

  function expectDayView(viewName, dayDate) {
    dayDate = $.fullCalendar.moment(dayDate)
    expect(getCurrentViewName()).toBe(viewName)
    var dates = getDayGridDates()
    expect(dates.length).toBe(1)
    expect(dates[0].format()).toEqualMoment(dayDate)
  }

  function expectWeekView(viewName, firstDayDate) {
    firstDayDate = $.fullCalendar.moment(firstDayDate)
    expect(getCurrentViewName()).toBe(viewName)
    var dates = getDayGridDates()
    expect(dates.length).toBe(7)
    expect(dates[0].format()).toEqualMoment(firstDayDate)
  }

  function getCurrentViewName() {
    return $('.fc-view').attr('class').match(/fc-(\w+)-view/)[1]
  }

  // day headers (for both day grid and time grid)

  function getDayHeaderLink(dayDate) {
    dayDate = $.fullCalendar.moment(dayDate)
    return $('.fc-day-header[data-date="' + dayDate.format('YYYY-MM-DD') + '"] a')
  }

  function getDayHeaderLinks(dayDate) {
    return $('.fc-day-header a')
  }

  // day grid

  function getDayGridNumberEl(dayDate) {
    dayDate = $.fullCalendar.moment(dayDate)
    return $('.fc-day-top[data-date="' + dayDate.format('YYYY-MM-DD') + '"] .fc-day-number')
  }

  function getDayGridClassicWeekLinks() { // along the sides of the row
    return $('.fc-day-grid .fc-week-number a')
  }

  function getDayGridEmbeddedWeekLinks() { // within the day cells
    return $('.fc-day-top a.fc-week-number')
  }

  function getDayGridDates() {
    return $('.fc-day-grid .fc-day').map(function(i, el) {
      return $.fullCalendar.moment($(el).data('date'))
    }).get()
  }

  // list view

  function getListDayHeaderLink(dayDate) {
    dayDate = $.fullCalendar.moment(dayDate)
    return $('.fc-list-heading[data-date="' + dayDate.format('YYYY-MM-DD') + '"] a.fc-list-heading-main')
  }

  // agenda view

  function getAgendaWeekNumberLink() {
    return $('th.fc-axis a')
  }
})
