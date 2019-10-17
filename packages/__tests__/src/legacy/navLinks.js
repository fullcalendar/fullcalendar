import { formatIsoDay } from '../datelib/utils'

describe('navLinks', function() {
  var options

  beforeEach(function() {
    options = {
      now: '2016-08-20',
      navLinks: true,
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' // affects which view is jumped to by default
      },
      dateClick: function() { }
    }
    spyOn(options, 'dateClick')
  })

  describeTimeZones(function(tz) {

    describe('in month view', function() {
      beforeEach(function() {
        options.defaultView = 'dayGridMonth'
      })

      it('moves to day', function() {
        initCalendar(options)
        $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
        expectDayView('timeGridDay', '2016-08-09')
        expect(options.dateClick).not.toHaveBeenCalled()
      })

      // https://github.com/fullcalendar/fullcalendar/issues/4619
      it('moves to day when no toolbars', function() {
        options.header = null
        initCalendar(options)
        $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
        expectDayView('dayGridDay', '2016-08-09') // is hash-key order-dependent I think :(
        expect(options.dateClick).not.toHaveBeenCalled()
      })

      // https://github.com/fullcalendar/fullcalendar/issues/3869
      it('moves to two different days', function() {
        initCalendar(options)
        $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
        expectDayView('timeGridDay', '2016-08-09')
        expect(options.dateClick).not.toHaveBeenCalled()
        currentCalendar.changeView('dayGridMonth')
        $.simulateMouseClick(getDayGridNumberEl('2016-08-10'))
        expectDayView('timeGridDay', '2016-08-10')
      })

      it('moves to day specifically', function() {
        options.navLinkDayClick = 'day'
        initCalendar(options)
        $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
        expectDayView('timeGridDay', '2016-08-09')
        expect(options.dateClick).not.toHaveBeenCalled()
      })

      it('moves to dayGridDay specifically', function() {
        options.navLinkDayClick = 'dayGridDay'
        initCalendar(options)
        $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
        expectDayView('dayGridDay', '2016-08-09')
        expect(options.dateClick).not.toHaveBeenCalled()
      })

      it('executes a custom handler', function() {
        options.navLinkDayClick = function(date, ev) {
          expect(date).toEqualDate(tz.parseDate('2016-08-09'))
          expect(typeof ev).toBe('object')
        }
        spyOn(options, 'navLinkDayClick').and.callThrough()
        initCalendar(options)
        $.simulateMouseClick(getDayGridNumberEl('2016-08-09'))
        expect(options.navLinkDayClick).toHaveBeenCalled()
        expect(options.dateClick).not.toHaveBeenCalled()
      })

      describe('with weekNumbers', function() {
        beforeEach(function() {
          options.weekNumbers = true
        })

        it('moves to week', function() {
          initCalendar(options)
          $.simulateMouseClick(getDayGridClassicWeekLinks().eq(1))
          expectWeekView('timeGridWeek', '2016-08-07')
          expect(options.dateClick).not.toHaveBeenCalled()
        })

        it('moves to week with within-day rendering', function() {
          options.weekNumbersWithinDays = true
          initCalendar(options)
          $.simulateMouseClick(getDayGridEmbeddedWeekLinks().eq(1))
          expectWeekView('timeGridWeek', '2016-08-07')
          expect(options.dateClick).not.toHaveBeenCalled()
        })
      })

      it('does not have clickable day header', function() {
        initCalendar(options)
        expect(getDayHeaderLinks().length).toBe(0)
      })
    })
  })

  describe('in week view', function() {
    beforeEach(function() {
      options.defaultView = 'timeGridWeek'
    })

    it('moves to day view', function() {
      initCalendar(options)
      $.simulateMouseClick(getDayHeaderLink('2016-08-15'))
      expectDayView('timeGridDay', '2016-08-15')
      expect(options.dateClick).not.toHaveBeenCalled()
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
      expectDayView('timeGridDay', '2016-08-20')
      expect(options.dateClick).not.toHaveBeenCalled()
    })
  })

  describe('in day view', function() {
    beforeEach(function() {
      options.defaultView = 'timeGridDay'
    })

    it('moves to week view', function() {
      options.weekNumbers = true
      initCalendar(options)
      $.simulateMouseClick(getTimeGridWeekNumberLink())
      expectWeekView('timeGridWeek', '2016-08-14')
      expect(options.dateClick).not.toHaveBeenCalled()
    })

    it('does not have a clickable day header', function() {
      initCalendar(options)
      expect(getDayHeaderLinks().length).toBe(0)
    })
  })


  /* utils
  ------------------------------------------------------------------------------------------------------------------ */

  function expectDayView(viewName, dayDate) {
    if (typeof dayDate === 'string') {
      dayDate = new Date(dayDate)
    }
    expect(getCurrentViewName()).toBe(viewName)
    var dates = getDayGridDates()
    expect(dates.length).toBe(1)
    expect(dates[0]).toEqualDate(dayDate)
  }

  function expectWeekView(viewName, firstDayDate) {
    if (typeof firstDayDate === 'string') {
      firstDayDate = new Date(firstDayDate)
    }
    expect(getCurrentViewName()).toBe(viewName)
    var dates = getDayGridDates()
    expect(dates.length).toBe(7)
    expect(dates[0]).toEqualDate(firstDayDate)
  }

  function getCurrentViewName() {
    return $('.fc-view').attr('class').match(/fc-(\w+)-view/)[1]
  }

  // day headers (for both day grid and time grid)

  function getDayHeaderLink(dayDate) {
    if (typeof dayDate === 'string') {
      dayDate = new Date(dayDate)
    }
    return $('.fc-day-header[data-date="' + formatIsoDay(dayDate) + '"] a')
  }

  function getDayHeaderLinks(dayDate) {
    return $('.fc-day-header a')
  }

  // day grid

  function getDayGridNumberEl(dayDate) {
    if (typeof dayDate === 'string') {
      dayDate = new Date(dayDate)
    }
    return $('.fc-day-top[data-date="' + formatIsoDay(dayDate) + '"] .fc-day-number')
  }

  function getDayGridClassicWeekLinks() { // along the sides of the row
    return $('.fc-day-grid .fc-week-number a')
  }

  function getDayGridEmbeddedWeekLinks() { // within the day cells
    return $('.fc-day-top a.fc-week-number')
  }

  function getDayGridDates() {
    return $('.fc-day-grid .fc-day').map(function(i, el) {
      return new Date($(el).data('date'))
    }).get()
  }

  // list view

  function getListDayHeaderLink(dayDate) {
    if (typeof dayDate === 'string') {
      dayDate = new Date(dayDate)
    }
    return $('.fc-list-heading[data-date="' + formatIsoDay(dayDate) + '"] a.fc-list-heading-main')
  }

  // timeGrid view

  function getTimeGridWeekNumberLink() {
    return $('th.fc-axis a')
  }
})
