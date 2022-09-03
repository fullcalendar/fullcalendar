import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('nextDayThreshold', () => {
  // when a view object exposes its nextDayThreshold value (after some refactoring)...
  //   TODO: detect the default of 9am
  //   TODO: detect 2 or more different types of Duration-ish parsing

  it('renders an event before the threshold', () => {
    let calendar = initCalendar({
      nextDayThreshold: '10:00:00',
      initialDate: '2014-06',
      initialView: 'dayGridMonth',
      events: [
        {
          title: 'event1',
          start: '2014-06-08T22:00:00',
          end: '2014-06-10T09:00:00',
        },
      ],
    })
    expect(renderedDayCount(calendar)).toBe(2)
  })

  it('renders an event equal to the threshold', () => {
    let calendar = initCalendar({
      nextDayThreshold: '10:00:00',
      initialDate: '2014-06',
      initialView: 'dayGridMonth',
      events: [
        {
          title: 'event1',
          start: '2014-06-08T22:00:00',
          end: '2014-06-10T10:00:00',
        },
      ],
    })
    expect(renderedDayCount(calendar)).toBe(3)
  })

  it('renders an event after the threshold', () => {
    let calendar = initCalendar({
      nextDayThreshold: '10:00:00',
      initialDate: '2014-06',
      initialView: 'dayGridMonth',
      events: [
        {
          title: 'event1',
          start: '2014-06-08T22:00:00',
          end: '2014-06-10T11:00:00',
        },
      ],
    })
    expect(renderedDayCount(calendar)).toBe(3)
  })

  it('won\'t render an event that ends before the first day\'s threshold', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2017-10-01',
      nextDayThreshold: '09:00:00',
      events: [{
        start: '2017-09-30T08:00:00',
        end: '2017-10-01T08:00:00',
      }],
    })
    let calendarWrapper = new CalendarWrapper(calendar)

    expect(calendarWrapper.getEventEls().length).toBe(0)
  })

  function renderedDayCount(calendar) { // assumes only one event on the calendar
    let headerWrapper = new DayGridViewWrapper(calendar).header
    let dayEl = headerWrapper.getCellEl(0)
    let cellWidth = $(dayEl).outerWidth() // works with dayGrid and timeGrid
    let totalWidth = 0

    let eventEls = new CalendarWrapper(calendar).getEventEls()
    $(eventEls).each((i, eventEl) => {
      totalWidth += $(eventEl).outerWidth()
    })

    return Math.round(totalWidth / cellWidth)
  }
})
