import { parseUtcDate } from '../lib/date-parsing.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('now', () => {
  pushOptions({
    initialDate: '2014-05-01',
  })

  describe('when month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
    })

    it('changes the highlighted day when customized', () => {
      let calendar = initCalendar({
        now: '2014-05-06',
      })
      expectRenderedTodayDate(calendar, '2014-05-06')
    })
  })

  describe('when week view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
    })

    it('changes the highlighted day when customized', () => {
      let calendar = initCalendar({
        now: '2014-04-29T12:00:00',
      })
      expectRenderedTodayDate(calendar, '2014-04-29')
    })
  })

  it('accepts a function that returns a Date', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      now() {
        return parseUtcDate('2014-05-01')
      },
    })
    expectRenderedTodayDate(calendar, '2014-05-01')
  })

  it('accepts a function that returns a date string', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      now() {
        return '2014-05-01'
      },
    })
    expectRenderedTodayDate(calendar, '2014-05-01')
  })

  function expectRenderedTodayDate(calendar, expectedDate) {
    let calendarWrapper = new CalendarWrapper(calendar)
    let todayCell = calendarWrapper.getTodayEls()[0]
    let todayDate = todayCell.getAttribute('data-date')
    expect(todayDate).toEqual(expectedDate)
  }
})
