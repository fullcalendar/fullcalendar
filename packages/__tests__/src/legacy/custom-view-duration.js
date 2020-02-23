import frLocale from '@fullcalendar/core/locales/fr'
import { View, createPlugin } from '@fullcalendar/core'
import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('custom view', function() {

  it('renders a 4 day dayGrid view', function() {
    var options = {
      views: {}
    }
    options.views.dayGridFourDay = {
      type: 'dayGrid',
      duration: { days: 4 }
    }
    options.defaultView = 'dayGridFourDay'
    options.defaultDate = '2014-12-25'

    let calendar = initCalendar(options)
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let dayEls = dayGridWrapper.getAllDayEls()

    expect(dayGridWrapper.getRowEls().length).toBe(1)
    expect(dayEls.length).toBe(4)
    expect(dayEls[0].getAttribute('data-date')).toBe('2014-12-25') // starts on defaultDate
  })

  it('renders a 2 week dayGrid view', function() {
    var options = {
      views: {}
    }
    options.views.dayGridTwoWeek = {
      type: 'dayGrid',
      duration: { weeks: 2 }
    }
    options.defaultView = 'dayGridTwoWeek'
    options.defaultDate = '2014-12-25'
    options.firstDay = 2 // Tues

    let calendar = initCalendar(options)
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let dayEls = dayGridWrapper.getAllDayEls()

    expect(dayGridWrapper.getRowEls().length).toBe(2)
    expect(dayEls.length).toBe(14)
    expect(dayEls[0]).toHaveClass(CalendarWrapper.DOW_CLASSNAMES[2]) // respects start-of-week
    expect(dayEls[0].getAttribute('data-date')).toBe('2014-12-23') // week start. tues
  })

  it('will use the provided options', function() {
    var options = {
      views: {}
    }
    options.views.dayGridFourDay = {
      type: 'dayGrid',
      duration: { days: 4 },
      titleFormat: function() { return 'special' }
    }
    options.defaultView = 'dayGridFourDay'

    let calendar = initCalendar(options)
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getTitleText()).toBe('special')
  })

  it('will inherit options from the parent view type', function() {
    var options = {
      views: {}
    }
    options.views.dayGrid = {
      titleFormat: function() { return 'dayGridtitle' }
    }
    options.views.dayGridFourDay = {
      type: 'dayGrid',
      duration: { days: 4 }
    }
    options.defaultView = 'dayGridFourDay'

    let calendar = initCalendar(options)
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getTitleText()).toBe('dayGridtitle')
  })

  it('will override an option from the parent view type', function() {
    var options = {
      views: {}
    }
    options.views.dayGrid = {
      titleFormat: function() { return 'dayGridtitle' }
    }
    options.views.dayGridFourDay = {
      type: 'dayGrid',
      duration: { days: 4 },
      titleFormat: function() { return 'dayGridfourweekttitle' }
    }
    options.defaultView = 'dayGridFourDay'

    let calendar = initCalendar(options)
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getTitleText()).toBe('dayGridfourweekttitle')
  })

  it('will inherit options from generic "week" type', function() {
    var options = {
      views: {}
    }
    options.views.week = {
      titleFormat: function() { return 'weektitle' }
    }
    options.views.dayGridOneWeek = {
      type: 'dayGrid',
      duration: { weeks: 1 }
    }
    options.defaultView = 'dayGridOneWeek'

    let calendar = initCalendar(options)
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar

    expect(toolbarWrapper.getTitleText()).toBe('weektitle')
  })

  it('generic type options for "dayGrid" will override generic "week" options', function() {
    var options = {
      views: {}
    }
    options.views.week = {
      titleFormat: function() { return 'weektitle' }
    }
    options.views.dayGrid = {
      titleFormat: function() { return 'dayGridtitle' }
    }
    options.views.dayGridOneWeek = {
      type: 'dayGrid',
      duration: { weeks: 1 }
    }
    options.defaultView = 'dayGridOneWeek'

    let calendar = initCalendar(options)
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar

    expect(toolbarWrapper.getTitleText()).toBe('dayGridtitle')
  })

  it('will not inherit "week" options if more than a single week', function() {
    var options = {
      views: {}
    }
    options.titleFormat = function() { return 'defaultitle' }
    options.views.week = {
      titleFormat: function() { return 'weektitle' }
    }
    options.views.dayGridTwoWeek = {
      type: 'dayGrid',
      duration: { weeks: 2 }
    }
    options.defaultView = 'dayGridTwoWeek'

    let calendar = initCalendar(options)
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar

    expect(toolbarWrapper.getTitleText()).toBe('defaultitle')
  })

  it('renders a 4 day timeGrid view', function() {
    var options = {
      views: {}
    }
    options.views.timeGridFourDay = {
      type: 'timeGrid',
      duration: { days: 4 }
    }
    options.defaultView = 'timeGridFourDay'
    options.defaultDate = '2014-12-25'

    let calendar = initCalendar(options)
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let timeGridDayEls = viewWrapper.timeGrid.getAllDayEls()

    expect(viewWrapper.dayGrid.getRowEls().length).toBe(1)
    expect(viewWrapper.dayGrid.getAllDayEls().length).toBe(4)
    expect(timeGridDayEls.length).toBe(4)
    expect(timeGridDayEls[0].getAttribute('data-date')).toBe('2014-12-25') // starts on defaultDate
  })

  it('renders a two week timeGrid view', function() {
    var options = {
      views: {}
    }
    options.views.timeGridTwoWeek = {
      type: 'timeGrid',
      duration: { weeks: 2 }
    }
    options.defaultView = 'timeGridTwoWeek'
    options.defaultDate = '2014-12-25'

    let calendar = initCalendar(options)
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let timeGridDayEls = viewWrapper.timeGrid.getAllDayEls()

    expect(viewWrapper.dayGrid.getRowEls().length).toBe(1)
    expect(viewWrapper.dayGrid.getAllDayEls().length).toBe(14)
    expect(timeGridDayEls.length).toBe(14)
    expect(timeGridDayEls[0].getAttribute('data-date')).toBe('2014-12-21') // week start
  })

  it('renders a two month timeGrid view', function() {
    var options = {
      views: {}
    }
    options.views.timeGridTwoWeek = {
      type: 'timeGrid',
      duration: { months: 2 }
    }
    options.defaultView = 'timeGridTwoWeek'
    options.defaultDate = '2014-11-27'

    let calendar = initCalendar(options)
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let timeGridDayEls = viewWrapper.timeGrid.getAllDayEls()

    expect(viewWrapper.dayGrid.getRowEls().length).toBe(1)
    expect(viewWrapper.dayGrid.getAllDayEls().length).toBe(61)
    expect(timeGridDayEls.length).toBe(61)
    expect(timeGridDayEls[0].getAttribute('data-date')).toBe('2014-11-01')
    expect(timeGridDayEls[timeGridDayEls.length - 1].getAttribute('data-date')).toBe('2014-12-31') // last
  })

  it('renders a two month dayGrid view', function() {
    var options = {
      views: {}
    }
    options.views.dayGridTwoWeek = {
      type: 'dayGrid',
      duration: { months: 2 }
    }
    options.defaultView = 'dayGridTwoWeek'
    options.defaultDate = '2014-11-27'

    let calendar = initCalendar(options)
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let dayEls = dayGridWrapper.getAllDayEls()

    expect(dayGridWrapper.getRowEls().length).toBe(10)
    expect(dayGridWrapper.getDayElsInRow(0).length).toBe(7)
    expect(dayEls[0].getAttribute('data-date')).toBe('2014-10-26')
    expect(dayEls[dayEls.length - 1].getAttribute('data-date')).toBe('2015-01-03')
  })

  it('renders a one year dayGrid view', function() {
    var options = {
      views: {}
    }
    options.views.dayGridYear = {
      type: 'dayGrid',
      duration: { years: 1 }
    }
    options.defaultView = 'dayGridYear'
    options.defaultDate = '2014-11-27'

    let calendar = initCalendar(options)
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let dayEls = dayGridWrapper.getAllDayEls()

    expect(dayEls[0]).toBeMatchedBy('[data-date="2013-12-29"]')
    expect(dayEls[dayEls.length - 1]).toBeMatchedBy('[data-date="2015-01-03"]')
  })

  describe('buttonText', function() {

    it('accepts buttonText exact-match override', function() {
      var options = {
        views: {}
      }
      options.buttonText = {
        custom: 'over-ridden'
      }
      options.views.custom = {
        type: 'dayGrid',
        duration: { days: 4 },
        buttonText: 'awesome'
      }
      options.header = {
        center: 'custom,dayGridMonth'
      }
      options.defaultView = 'custom'

      let calendar = initCalendar(options)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('over-ridden')
    })

    it('accepts buttonText single-unit-match override', function() {
      var options = {
        views: {}
      }
      options.buttonText = {
        day: '1day-over-ridden'
      }
      options.views.custom = {
        type: 'dayGrid',
        duration: { days: 1 },
        buttonText: 'awesome'
      }
      options.header = {
        center: 'custom,dayGridMonth'
      }
      options.defaultView = 'custom'

      let calendar = initCalendar(options)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('1day-over-ridden')
    })

    it('does not accept buttonText unit-match override when unit is more than one', function() {
      var options = {
        views: {}
      }
      options.buttonText = {
        day: '1day!!!???'
      }
      options.views.custom = {
        type: 'dayGrid',
        duration: { days: 2 },
        buttonText: 'awesome'
      }
      options.header = {
        center: 'custom,dayGridMonth'
      }
      options.defaultView = 'custom'

      let calendar = initCalendar(options)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('awesome')
    })

    it('accepts locale\'s single-unit-match override', function() {
      let calendar = initCalendar({
        locale: frLocale,
        header: {
          center: 'custom,dayGridMonth'
        },
        defaultView: 'custom',
        views: {
          custom: {
            type: 'dayGrid',
            duration: { days: 1 }
          }
        }
      })

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('Jour')
    })

    it('accepts explicit View-Specific buttonText, overriding locale\'s single-unit-match override', function() {
      let calendar = initCalendar({
        locale: frLocale,
        header: {
          center: 'custom,dayGridMonth'
        },
        defaultView: 'custom',
        views: {
          custom: {
            type: 'dayGrid',
            duration: { days: 1 },
            buttonText: 'awesome'
          }
        }
      })

      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('awesome')
    })

    it('respects custom view\'s value', function() {
      var options = {
        views: {}
      }
      options.views.custom = {
        type: 'dayGrid',
        duration: { days: 4 },
        buttonText: 'awesome'
      }
      options.header = {
        center: 'custom,dayGridMonth'
      }
      options.defaultView = 'custom'

      let calendar = initCalendar(options)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('awesome')
    })

    it('respects custom view\'s value, even when a "smart" property name', function() {
      var options = {
        views: {}
      }
      options.views.dayGridFourDay = { // "dayGridFourDay" is a pitfall for smartProperty
        type: 'dayGrid',
        duration: { days: 4 },
        buttonText: 'awesome'
      }
      options.header = {
        center: 'dayGridFourDay,dayGridMonth'
      }
      options.defaultView = 'dayGridFourDay'

      let calendar = initCalendar(options)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('dayGridFourDay')

      expect(buttonInfo.text).toBe('awesome')
    })

    it('falls back to view name when view lacks metadata', function() {
      // also sorta tests plugin system

      class CrazyView extends View {
        render() {}
      }

      let calendar = initCalendar({
        plugins: [
          createPlugin({
            views: {
              crazy: CrazyView
            }
          })
        ],
        header: {
          center: 'crazy,dayGridMonth'
        },
        defaultView: 'crazy'
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('crazy')

      expect(buttonInfo.text).toBe('crazy')
    })
  })

  it('throws an error when type is self', function() {
    let error = null

    try {
      initCalendar({
        defaultView: 'month',
        views: {
          month: {
            type: 'month'
          }
        }
      })
    } catch (_error) {
      error = _error
    }

    expect(error).toBeTruthy()
    expect(error.message).toBe('Can\'t have a custom view type that references itself')
  })
})
