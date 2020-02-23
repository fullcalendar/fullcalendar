import enGbLocale from '@fullcalendar/core/locales/en-gb'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'

describe('eventTimeFormat', function() {
  pushOptions({
    defaultDate: '2014-06-04',
    events: [ {
      title: 'my event',
      start: '2014-06-04T15:00:00',
      end: '2014-06-04T17:00:00'
    } ]
  })

  describe('when in month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth'
    })

    it('renders correctly when default', function() {
      let calendar = initCalendar()
      expectEventTimeText(calendar, '3p')
    })

    it('renders correctly when default and the locale is customized', function() {
      let calendar = initCalendar({
        locale: enGbLocale
      })
      expectEventTimeText(calendar, '15')
    })

    it('renders correctly when customized', function() {
      let calendar = initCalendar({
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
      })
      expectEventTimeText(calendar, '15:00:00')
    })
  })

  describe('when in week view', function() {
    pushOptions({
      defaultView: 'timeGridWeek'
    })

    it('renders correctly when default', function() {
      let calendar = initCalendar()
      expectEventTimeText(calendar, '3:00 - 5:00')
    })

    it('renders correctly when default and the locale is customized', function() {
      let calendar = initCalendar({
        locale: enGbLocale
      })
      expectEventTimeText(calendar, '15:00 - 17:00')
    })

    it('renders correctly when customized', function() {
      let calendar = initCalendar({
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
      })
      expectEventTimeText(calendar, '15:00:00 - 17:00:00')
    })
  })

  describe('when in multi-day custom dayGrid view', function() {
    pushOptions({
      views: {
        dayGridTwoDay: {
          type: 'dayGrid',
          duration: { days: 2 }
        }
      },
      defaultView: 'dayGridTwoDay'
    })

    it('defaults to no end time', function() {
      let calendar = initCalendar()
      expectEventTimeText(calendar, '3p')
    })
  })

  describe('when in dayGridDay view', function() {
    pushOptions({
      defaultView: 'dayGridDay'
    })

    it('defaults to showing the end time', function() {
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
