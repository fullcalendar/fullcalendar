import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('validRange event rendering', () => {
  describe('with start constraint', () => {
    describe('when month view', () => {
      pushOptions({
        initialView: 'dayGridMonth',
        initialDate: '2017-06-01',
        validRange: { start: '2017-06-07' },
      })

      describe('when event is partially before', () => {
        pushOptions({
          events: [
            { start: '2017-06-05', end: '2017-06-09' },
          ],
        })

        it('truncates the event\'s beginning', () => {
          let calendar = initCalendar()
          let calendarWrapper = new CalendarWrapper(calendar)

          let eventEl = calendarWrapper.getFirstEventEl()
          let eventInfo = calendarWrapper.getEventElInfo(eventEl)

          expect(eventInfo.isStart).toBe(false)
          expect(eventInfo.isEnd).toBe(true)
          // TODO: more test about positioning
        })
      })
    })
  })

  describe('with end constraint', () => {
    describe('when month view', () => {
      pushOptions({
        initialView: 'dayGridMonth',
        initialDate: '2017-06-01',
        validRange: { end: '2017-06-07' },
      })

      describe('when event is partially before', () => {
        pushOptions({
          events: [
            { start: '2017-06-05', end: '2017-06-09' },
          ],
        })

        it('truncates the event\'s end', () => {
          let calendar = initCalendar()
          let calendarWrapper = new CalendarWrapper(calendar)

          let eventEl = calendarWrapper.getFirstEventEl()
          let eventInfo = calendarWrapper.getEventElInfo(eventEl)

          expect(eventInfo.isStart).toBe(true)
          expect(eventInfo.isEnd).toBe(false)
          // TODO: more test about positioning
        })
      })
    })
  })
})
