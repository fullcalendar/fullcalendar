import CalendarWrapper from '../lib/wrappers/CalendarWrapper'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'
import { queryEventElInfo } from '../lib/wrappers/TimeGridWrapper'

xdescribe('short event rendering with timeGridEventMinHeight', function() {
  pushOptions({
    initialView: 'timeGridWeek',
    initialDate: '2017-08-10',
    timeGridEventMinHeight: 25
  })

  describe('we we have an isolated short event', function() {
    pushOptions({
      events: [
        { start: '2017-08-10T10:30:00', end: '2017-08-10T10:31:00' }
      ]
    })

    it('renders the event having full width and the timeGridEventMinHeight height value', function() {
      let calendar = initCalendar()
      let eventEl = new CalendarWrapper(calendar).getFirstEventEl()

      expect(eventEl.offsetHeight).toEqual(25 - 1) // because of the bottom margin
    })
  })

  describe('we we have two short events close to each other', function() {
    pushOptions({
      events: [
        { start: '2017-08-10T10:30:00', end: '2017-08-10T10:31:00', title: 'event a' },
        { start: '2017-08-10T10:31:20', end: '2017-08-10T10:31:40', title: 'event b' }
      ]
    })

    // disabled because isShort
    xit('renders the second short event side by side with the first one', function() {
      let calendar = initCalendar()
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let eventEls = timeGridWrapper.getEventEls()

      expect(queryEventElInfo(eventEls[1]).isShort).toBe(true)
      expect($(eventEls[1]).css('left')).not.toEqual('0px')
    })

    // disabled because isShort
    xit('prevents the events to overlap when we pass the slotEventOverlap: false option', function() {
      let calendar = initCalendar({
        slotEventOverlap: false
      })
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let eventEls = timeGridWrapper.getEventEls()

      expect(queryEventElInfo(eventEls[0]).isShort).toBe(true)
      expect(queryEventElInfo(eventEls[1]).isShort).toBe(true)

      expect($(eventEls[0]).css('left')).toEqual('0px')
      expect($(eventEls[1]).css('left')).not.toEqual('0px')
    })
  })
})
