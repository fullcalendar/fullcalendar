import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'
import { waitEventResize } from '../lib/wrappers/interaction-util'
import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'

describe('event resize mirror', function() {
  pushOptions({
    editable: true,
    defaultDate: '2018-12-25',
    eventDragMinDistance: 0 // so mirror will render immediately upon mousedown
  })

  describe('in month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth',
      events: [
        { start: '2018-12-03', title: 'all day event' }
      ]
    })

    it('gets passed through eventDestroy', function(done) {
      let mirrorRenderCalls = 0
      let mirrorDestroyCalls = 0
      let normalRenderCalls = 0
      let normalDestroyCalls = 0

      let calendar = initCalendar({
        eventRender(info) {
          if (info.isMirror) {
            mirrorRenderCalls++
          } else {
            normalRenderCalls++
          }
        },
        eventDestroy(info) {
          if (info.isMirror) {
            mirrorDestroyCalls++
          } else {
            normalDestroyCalls++
          }
        }
      })

      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      let resizing = dayGridWrapper.resizeEvent( // drag TWO days
        dayGridWrapper.getEventEls()[0],
        '2018-12-03',
        '2018-12-05'
      )

      waitEventResize(calendar, resizing).then(() => {
        expect(mirrorRenderCalls).toBe(3)
        expect(mirrorDestroyCalls).toBe(3)

        expect(normalRenderCalls).toBe(2)
        expect(normalDestroyCalls).toBe(1)

        done()
      })
    })
  })

  describe('in timeGrid view', function() {
    pushOptions({
      defaultView: 'timeGridWeek',
      scrollTime: '00:00',
      slotDuration: '01:00',
      snapDuration: '01:00',
      events: [
        { start: '2018-12-25T01:00:00', end: '2018-12-25T02:00:00', title: 'timed event' }
      ]
    })

    it('gets passed through eventDestroy', function(done) {
      let mirrorRenderCalls = 0
      let mirrorDestroyCalls = 0
      let normalRenderCalls = 0
      let normalDestroyCalls = 0

      let calendar = initCalendar({
        eventRender(info) {
          if (info.isMirror) {
            mirrorRenderCalls++
          } else {
            normalRenderCalls++
          }
        },
        eventDestroy(info) {
          if (info.isMirror) {
            mirrorDestroyCalls++
          } else {
            normalDestroyCalls++
          }
        }
      })

      let eventEl = new CalendarWrapper(calendar).getFirstEventEl()
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let resizing = timeGridWrapper.resizeEvent(
        eventEl,
        '2018-12-25T02:00:00',
        '2018-12-25T04:00:00' // drag TWO snaps
      )

      waitEventResize(calendar, resizing).then(() => {
        expect(mirrorRenderCalls).toBe(3)
        expect(mirrorDestroyCalls).toBe(3)

        expect(normalRenderCalls).toBe(2)
        expect(normalDestroyCalls).toBe(1)

        done()
      })
    })
  })

})
