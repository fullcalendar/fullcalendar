import enGbLocale from '@fullcalendar/core/locales/en-gb'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('eventTimeFormat', () => {
  pushOptions({
    initialDate: '2014-06-04',
    events: [{
      title: 'my event',
      start: '2014-06-04T15:00:00',
      end: '2014-06-04T17:00:00',
    }],
  })

  describe('when in month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
    })

    it('renders correctly when default', () => {
      let calendar = initCalendar()
      expectEventTimeText(calendar, '3p')
    })

    it('renders correctly when default and the locale is customized', () => {
      let calendar = initCalendar({
        locale: enGbLocale,
      })
      expectEventTimeText(calendar, '15')
    })

    it('renders correctly when customized', () => {
      let calendar = initCalendar({
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
      })
      expectEventTimeText(calendar, '15:00:00')
    })
  })

  describe('when in week view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
    })

    it('renders correctly when default', () => {
      let calendar = initCalendar()
      expectEventTimeText(calendar, '3:00 - 5:00')
    })

    it('renders correctly when default and the locale is customized', () => {
      let calendar = initCalendar({
        locale: enGbLocale,
      })
      expectEventTimeText(calendar, '15:00 - 17:00')
    })

    it('renders correctly when customized', () => {
      let calendar = initCalendar({
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
      })
      expectEventTimeText(calendar, '15:00:00 - 17:00:00')
    })
  })

  describe('when in multi-day custom dayGrid view', () => {
    pushOptions({
      views: {
        dayGridTwoDay: {
          type: 'dayGrid',
          duration: { days: 2 },
        },
      },
      initialView: 'dayGridTwoDay',
    })

    it('defaults to no end time', () => {
      let calendar = initCalendar()
      expectEventTimeText(calendar, '3p')
    })
  })

  describe('when in dayGridDay view', () => {
    pushOptions({
      initialView: 'dayGridDay',
    })

    it('defaults to showing the end time', () => {
      let calendar = initCalendar()
      expectEventTimeText(calendar, '3p - 5p')
    })
  })

  function expectEventTimeText(calendar, expected) {
    let calendarWrapper = new CalendarWrapper(calendar)
    let firstEventEl = calendarWrapper.getFirstEventEl()
    let eventInfo = calendarWrapper.getEventElInfo(firstEventEl)
    expect(eventInfo.timeText).toBe(expected)
  }
})
