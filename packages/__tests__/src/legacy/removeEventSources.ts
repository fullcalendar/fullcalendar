import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('removeEventSources', () => {
  pushOptions({
    initialDate: '2014-08-01',
    initialView: 'timeGridDay',
    eventSources: [
      buildEventSource(1),
      buildEventSource(2),
      buildEventSource(3),
    ],
  })

  describe('when called with no arguments', () => {
    it('removes all sources', () => {
      let calendar = initCalendar()
      let calendarWrapper = new CalendarWrapper(calendar)

      expect(calendarWrapper.getEventEls().length).toBe(3)

      calendar.removeAllEventSources()

      expect(calendarWrapper.getEventEls().length).toBe(0)
    })
  })

  describe('when called with specific IDs', () => {
    it('removes only events with matching sources', () => {
      let calendar = initCalendar()
      let calendarWrapper = new CalendarWrapper(calendar)

      expect(calendarWrapper.getEventEls().length).toBe(3)

      calendar.getEventSourceById('1').remove()
      calendar.getEventSourceById('3').remove()

      expect(calendarWrapper.getEventEls().length).toBe(1)
      expect($('.event2').length).toBe(1)
    })
  })

  function buildEventSource(id) {
    return {
      id,
      events(arg, callback) {
        callback([{
          title: 'event' + id,
          className: 'event' + id,
          start: '2014-08-01T02:00:00',
        }])
      },
    }
  }
})
