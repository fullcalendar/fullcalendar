import { parseUtcDate } from '../lib/date-parsing'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'

describe('now', function() {

  pushOptions({
    defaultDate: '2014-05-01'
  })

  describe('when month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth'
    })

    it('changes the highlighted day when customized', function() {
      let calendar = initCalendar({
        now: '2014-05-06'
      })
      expectRenderedTodayDate(calendar, '2014-05-06')
    })
  })

  describe('when week view', function() {
    pushOptions({
      defaultView: 'timeGridWeek'
    })

    it('changes the highlighted day when customized', function() {
      let calendar = initCalendar({
        now: '2014-04-29T12:00:00'
      })
      expectRenderedTodayDate(calendar, '2014-04-29')
    })
  })

  it('accepts a function that returns a Date', function() {
    let calendar = initCalendar({
      defaultView: 'dayGridMonth',
      now: function() {
        return parseUtcDate('2014-05-01')
      }
    })
    expectRenderedTodayDate(calendar, '2014-05-01')
  })

  it('accepts a function that returns a date string', function() {
    let calendar = initCalendar({
      defaultView: 'dayGridMonth',
      now: function() {
        return '2014-05-01'
      }
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
