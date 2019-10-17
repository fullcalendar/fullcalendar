import frLocale from '@fullcalendar/core/locales/fr'
import { View, createPlugin } from '@fullcalendar/core'

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
    initCalendar(options)
    expect($('.fc-day-grid .fc-row').length).toBe(1)
    expect($('.fc-day-grid .fc-row .fc-day').length).toBe(4)
    expect($('.fc-day-grid .fc-row .fc-day:first'))
      .toBeMatchedBy('[data-date="2014-12-25"]') // starts on defaultDate
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
    initCalendar(options)
    expect($('.fc-day-grid .fc-row').length).toBe(2)
    expect($('.fc-day-grid .fc-day').length).toBe(14)
    expect($('.fc-day-grid .fc-day:first')).toBeMatchedBy('.fc-tue') // respects start-of-week
    expect($('.fc-day-grid .fc-day:first')).toBeMatchedBy('[data-date="2014-12-23"]') // week start. tues
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
    initCalendar(options)
    expect($('h2')).toHaveText('special')
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
    initCalendar(options)
    expect($('h2')).toHaveText('dayGridtitle')
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
    initCalendar(options)
    expect($('h2')).toHaveText('dayGridfourweekttitle')
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
    initCalendar(options)
    expect($('h2')).toHaveText('weektitle')
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
    initCalendar(options)
    expect($('h2')).toHaveText('dayGridtitle')
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
    initCalendar(options)
    expect($('h2')).toHaveText('defaultitle')
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
    initCalendar(options)
    expect($('.fc-day-grid .fc-row').length).toBe(1)
    expect($('.fc-day-grid .fc-row .fc-day').length).toBe(4)
    expect($('.fc-time-grid .fc-day').length).toBe(4)
    expect($('.fc-time-grid .fc-day:first')).toBeMatchedBy('[data-date="2014-12-25"]') // starts on defaultDate
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
    initCalendar(options)
    expect($('.fc-day-grid .fc-row').length).toBe(1)
    expect($('.fc-day-grid .fc-row .fc-day').length).toBe(14) // one long row
    expect($('.fc-time-grid .fc-day').length).toBe(14)
    expect($('.fc-time-grid .fc-day:first')).toBeMatchedBy('[data-date="2014-12-21"]') // week start
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
    initCalendar(options)
    expect($('.fc-day-grid .fc-row').length).toBe(1)
    expect($('.fc-day-grid .fc-row .fc-day').length).toBe(61) // one long row
    expect($('.fc-time-grid .fc-day').length).toBe(61)
    expect($('.fc-time-grid .fc-day:first')).toBeMatchedBy('[data-date="2014-11-01"]')
    expect($('.fc-time-grid .fc-day:last')).toBeMatchedBy('[data-date="2014-12-31"]')
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
    initCalendar(options)
    expect($('.fc-day-grid .fc-row').length).toBe(10)
    expect($('.fc-day-grid .fc-row:first .fc-day').length).toBe(7)
    expect($('.fc-day-grid .fc-day:first')).toBeMatchedBy('[data-date="2014-10-26"]')
    expect($('.fc-day-grid .fc-day:last')).toBeMatchedBy('[data-date="2015-01-03"]')
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
    initCalendar(options)
    expect($('.fc-day-grid .fc-day:first')).toBeMatchedBy('[data-date="2013-12-29"]')
    expect($('.fc-day-grid .fc-day:last')).toBeMatchedBy('[data-date="2015-01-03"]')
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
      initCalendar(options)
      expect($('.fc-custom-button')).toHaveText('over-ridden')
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
      initCalendar(options)
      expect($('.fc-custom-button')).toHaveText('1day-over-ridden')
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
      initCalendar(options)
      expect($('.fc-custom-button')).toHaveText('awesome')
    })

    it('accepts locale\'s single-unit-match override', function() {
      initCalendar({
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
      expect($('.fc-custom-button')).toHaveText('Jour')
    })

    it('accepts explicit View-Specific buttonText, overriding locale\'s single-unit-match override', function() {
      initCalendar({
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
      expect($('.fc-custom-button')).toHaveText('awesome')
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
      initCalendar(options)
      expect($('.fc-custom-button')).toHaveText('awesome')
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
      initCalendar(options)
      expect($('.fc-dayGridFourDay-button')).toHaveText('awesome')
    })

    it('falls back to view name when view lacks metadata', function() {
      // also sorta tests plugin system

      class CrazyView extends View {
      }

      initCalendar({
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

      expect($('.fc-crazy-button')).toHaveText('crazy')
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
