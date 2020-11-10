import frLocale from '@fullcalendar/core/locales/fr'
import { createPlugin } from '@fullcalendar/core' // View
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('custom view', () => {
  it('renders a 4 day dayGrid view', () => {
    let calendar = initCalendar({
      views: {
        dayGridFourDay: {
          type: 'dayGrid',
          duration: { days: 4 },
        },
      },
      initialView: 'dayGridFourDay',
      initialDate: '2014-12-25',
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let dayEls = dayGridWrapper.getAllDayEls()

    expect(dayGridWrapper.getRowEls().length).toBe(1)
    expect(dayEls.length).toBe(4)
    expect(dayEls[0].getAttribute('data-date')).toBe('2014-12-25') // starts on initialDate
  })

  it('renders a 2 week dayGrid view', () => {
    let calendar = initCalendar({
      views: {
        dayGridTwoWeek: {
          type: 'dayGrid',
          duration: { weeks: 2 },
        },
      },
      initialView: 'dayGridTwoWeek',
      initialDate: '2014-12-25',
      firstDay: 2, // Tues
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let dayEls = dayGridWrapper.getAllDayEls()

    expect(dayGridWrapper.getRowEls().length).toBe(2)
    expect(dayEls.length).toBe(14)
    expect(dayEls[0]).toHaveClass(CalendarWrapper.DOW_CLASSNAMES[2]) // respects start-of-week
    expect(dayEls[0].getAttribute('data-date')).toBe('2014-12-23') // week start. tues
  })

  it('will use the provided options', () => {
    let calendar = initCalendar({
      views: {
        dayGridFourDay: {
          type: 'dayGrid',
          duration: { days: 4 },
          titleFormat() { return 'special' },
        },
      },
      initialView: 'dayGridFourDay',
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getTitleText()).toBe('special')
  })

  it('will inherit options from the parent view type', () => {
    let calendar = initCalendar({
      views: {
        dayGrid: {
          titleFormat() { return 'dayGridtitle' },
        },
        dayGridFourDay: {
          type: 'dayGrid',
          duration: { days: 4 },
        },
      },
      initialView: 'dayGridFourDay',
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getTitleText()).toBe('dayGridtitle')
  })

  it('will override an option from the parent view type', () => {
    let calendar = initCalendar({
      views: {
        dayGrid: {
          titleFormat() { return 'dayGridtitle' },
        },
        dayGridFourDay: {
          type: 'dayGrid',
          duration: { days: 4 },
          titleFormat() { return 'dayGridfourweekttitle' },
        },
      },
      initialView: 'dayGridFourDay',
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getTitleText()).toBe('dayGridfourweekttitle')
  })

  it('will inherit options from generic "week" type', () => {
    let calendar = initCalendar({
      views: {
        week: {
          titleFormat() { return 'weektitle' },
        },
        dayGridOneWeek: {
          type: 'dayGrid',
          duration: { weeks: 1 },
        },
      },
      initialView: 'dayGridOneWeek',
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getTitleText()).toBe('weektitle')
  })

  it('generic type options for "dayGrid" will override generic "week" options', () => {
    let calendar = initCalendar({
      views: {
        week: {
          titleFormat() { return 'weektitle' },
        },
        dayGrid: {
          titleFormat() { return 'dayGridtitle' },
        },
        dayGridOneWeek: {
          type: 'dayGrid',
          duration: { weeks: 1 },
        },
      },
      initialView: 'dayGridOneWeek',
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getTitleText()).toBe('dayGridtitle')
  })

  it('will not inherit "week" options if more than a single week', () => {
    let calendar = initCalendar({
      titleFormat() { return 'defaultitle' },
      initialView: 'dayGridTwoWeek',
      views: {
        week: {
          titleFormat() { return 'weektitle' },
        },
        dayGridTwoWeek: {
          type: 'dayGrid',
          duration: { weeks: 2 },
        },
      },
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getTitleText()).toBe('defaultitle')
  })

  it('renders a 4 day timeGrid view', () => {
    let calendar = initCalendar({
      initialView: 'timeGridFourDay',
      initialDate: '2014-12-25',
      views: {
        timeGridFourDay: {
          type: 'timeGrid',
          duration: { days: 4 },
        },
      },
    })
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let timeGridDayEls = viewWrapper.timeGrid.getAllDayEls()

    expect(viewWrapper.dayGrid.getRowEls().length).toBe(1)
    expect(viewWrapper.dayGrid.getAllDayEls().length).toBe(4)
    expect(timeGridDayEls.length).toBe(4)
    expect(timeGridDayEls[0].getAttribute('data-date')).toBe('2014-12-25') // starts on initialDate
  })

  it('renders a two week timeGrid view', () => {
    let calendar = initCalendar({
      initialView: 'timeGridTwoWeek',
      initialDate: '2014-12-25',
      views: {
        timeGridTwoWeek: {
          type: 'timeGrid',
          duration: { weeks: 2 },
        },
      },
    })
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let timeGridDayEls = viewWrapper.timeGrid.getAllDayEls()

    expect(viewWrapper.dayGrid.getRowEls().length).toBe(1)
    expect(viewWrapper.dayGrid.getAllDayEls().length).toBe(14)
    expect(timeGridDayEls.length).toBe(14)
    expect(timeGridDayEls[0].getAttribute('data-date')).toBe('2014-12-21') // week start
  })

  it('renders a two month timeGrid view', () => {
    let calendar = initCalendar({
      initialView: 'timeGridTwoWeek',
      initialDate: '2014-11-27',
      views: {
        timeGridTwoWeek: {
          type: 'timeGrid',
          duration: { months: 2 },
        },
      },
    })
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let timeGridDayEls = viewWrapper.timeGrid.getAllDayEls()

    expect(viewWrapper.dayGrid.getRowEls().length).toBe(1)
    expect(viewWrapper.dayGrid.getAllDayEls().length).toBe(61)
    expect(timeGridDayEls.length).toBe(61)
    expect(timeGridDayEls[0].getAttribute('data-date')).toBe('2014-11-01')
    expect(timeGridDayEls[timeGridDayEls.length - 1].getAttribute('data-date')).toBe('2014-12-31') // last
  })

  it('renders a two month dayGrid view', () => {
    let calendar = initCalendar({
      initialView: 'dayGridTwoWeek',
      initialDate: '2014-11-27',
      views: {
        dayGridTwoWeek: {
          type: 'dayGrid',
          duration: { months: 2 },
        },
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let dayEls = dayGridWrapper.getAllDayEls()

    expect(dayGridWrapper.getRowEls().length).toBe(10)
    expect(dayGridWrapper.getDayElsInRow(0).length).toBe(7)
    expect(dayEls[0].getAttribute('data-date')).toBe('2014-10-26')
    expect(dayEls[dayEls.length - 1].getAttribute('data-date')).toBe('2015-01-03')
  })

  it('renders a one year dayGrid view', () => {
    let options = {
      initialView: 'dayGridYear',
      initialDate: '2014-11-27',
      views: {
        dayGridYear: {
          type: 'dayGrid',
          duration: { years: 1 },
        },
      },
    }
    let calendar = initCalendar(options)
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let dayEls = dayGridWrapper.getAllDayEls()

    expect(dayEls[0]).toBeMatchedBy('[data-date="2013-12-29"]')
    expect(dayEls[dayEls.length - 1]).toBeMatchedBy('[data-date="2015-01-03"]')
  })

  describe('buttonText', () => {
    it('accepts buttonText exact-match override', () => {
      let options = {
        buttonText: {
          custom: 'over-ridden',
        },
        headerToolbar: {
          center: 'custom,dayGridMonth',
        },
        initialView: 'custom',
        views: {
          custom: {
            type: 'dayGrid',
            duration: { days: 4 },
            buttonText: 'awesome',
          },
        },
      }
      let calendar = initCalendar(options)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('over-ridden')
    })

    it('accepts buttonText single-unit-match override', () => {
      let options = {
        buttonText: {
          day: '1day-over-ridden',
        },
        headerToolbar: {
          center: 'custom,dayGridMonth',
        },
        initialView: 'custom',
        views: {
          custom: {
            type: 'dayGrid',
            duration: { days: 1 },
            buttonText: 'awesome',
          },
        },
      }
      let calendar = initCalendar(options)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('1day-over-ridden')
    })

    it('does not accept buttonText unit-match override when unit is more than one', () => {
      let options = {
        buttonText: {
          day: '1day!!!???',
        },
        headerToolbar: {
          center: 'custom,dayGridMonth',
        },
        initialView: 'custom',
        views: {
          custom: {
            type: 'dayGrid',
            duration: { days: 2 },
            buttonText: 'awesome',
          },
        },
      }
      let calendar = initCalendar(options)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('awesome')
    })

    it('accepts locale\'s single-unit-match override', () => {
      let calendar = initCalendar({
        locale: frLocale,
        headerToolbar: {
          center: 'custom,dayGridMonth',
        },
        initialView: 'custom',
        views: {
          custom: {
            type: 'dayGrid',
            duration: { days: 1 },
          },
        },
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('Jour')
    })

    it('accepts explicit View-Specific buttonText, overriding locale\'s single-unit-match override', () => {
      let calendar = initCalendar({
        locale: frLocale,
        headerToolbar: {
          center: 'custom,dayGridMonth',
        },
        initialView: 'custom',
        views: {
          custom: {
            type: 'dayGrid',
            duration: { days: 1 },
            buttonText: 'awesome',
          },
        },
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('awesome')
    })

    it('respects custom view\'s value', () => {
      let options = {
        headerToolbar: {
          center: 'custom,dayGridMonth',
        },
        initialView: 'custom',
        views: {
          custom: {
            type: 'dayGrid',
            duration: { days: 4 },
            buttonText: 'awesome',
          },
        },
      }
      let calendar = initCalendar(options)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('custom')

      expect(buttonInfo.text).toBe('awesome')
    })

    it('respects custom view\'s value, even when a "smart" property name', () => {
      let options = {
        headerToolbar: {
          center: 'dayGridFourDay,dayGridMonth',
        },
        initialView: 'dayGridFourDay',
        views: {
          dayGridFourDay: { // "dayGridFourDay" is a pitfall for smartProperty
            type: 'dayGrid',
            duration: { days: 4 },
            buttonText: 'awesome',
          },
        },
      }
      let calendar = initCalendar(options)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('dayGridFourDay')

      expect(buttonInfo.text).toBe('awesome')
    })

    it('falls back to view name when view lacks metadata', () => {
      // also sorta tests plugin system

      let calendar = initCalendar({
        plugins: [
          createPlugin({
            views: {
              crazy: {
                content: 'hello world',
              },
            },
          }),
        ],
        headerToolbar: {
          center: 'crazy,dayGridMonth',
        },
        initialView: 'crazy',
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('crazy')

      expect(buttonInfo.text).toBe('crazy')
    })
  })

  it('throws an error when type is self', () => {
    let error = null

    try {
      initCalendar({
        initialView: 'month',
        views: {
          month: {
            type: 'month',
          },
        },
      })
    } catch (_error) {
      error = _error
    }

    expect(error).toBeTruthy()
    expect(error.message).toBe('Can\'t have a custom view type that references itself')
  })
})
