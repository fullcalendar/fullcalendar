import { strictModeFactor } from 'fullcalendar/protected-api'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { waitEventResize } from '../lib/wrappers/interaction-util'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitTimeout } from '../lib/misc'

describe('event resize mirror', () => {
  pushOptions({
    editable: true,
    initialDate: '2018-12-25',
    eventDragMinDistance: 0, // so mirror will render immediately upon mousedown
  })

  describe('in month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
      events: [
        { start: '2018-12-03', title: 'all day event' },
      ],
    })

    it('gets passed through render hooks', async () => {
      let mirrorMountCalls = 0
      let mirrorContentCalls = 0
      let mirrorUnmountCalls = 0

      let calendar = initCalendar({
        eventDidMount(info) {
          if (info.isMirror) {
            mirrorMountCalls += 1
          }
        },
        eventContent(info) {
          if (info.isMirror) {
            mirrorContentCalls += 1
          }
        },
        eventWillUnmount(info) {
          if (info.isMirror) {
            mirrorUnmountCalls += 1
          }
        },
      })

      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      let resizing = dayGridWrapper.resizeEvent( // drag TWO days
        dayGridWrapper.getEventEls()[0],
        '2018-12-03',
        '2018-12-05',
      )
      await waitEventResize(calendar, resizing)
      expect(mirrorMountCalls).toBe(1 * strictModeFactor)
      expect(mirrorContentCalls).toBe(3 * strictModeFactor)
      expect(mirrorUnmountCalls).toBe(1 * strictModeFactor)
    })
  })

  describe('in timeGrid view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
      scrollTime: '00:00',
      slotDuration: '01:00',
      snapDuration: '01:00',
      events: [
        { start: '2018-12-25T01:00:00', end: '2018-12-25T02:00:00', title: 'timed event' },
      ],
    })

    it('gets passed through eventWillUnmount', async () => {
      let mirrorMountCalls = 0
      let mirrorContentCalls = 0
      let mirrorUnmountCalls = 0

      let calendar = initCalendar({
        eventDidMount(info) {
          if (info.isMirror) {
            mirrorMountCalls += 1
          }
        },
        eventContent(info) {
          if (info.isMirror) {
            mirrorContentCalls += 1
          }
        },
        eventWillUnmount(info) {
          if (info.isMirror) {
            mirrorUnmountCalls += 1
          }
        },
      })

      await waitTimeout()
      let eventEl = new CalendarWrapper(calendar).getFirstEventEl()
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let resizing = timeGridWrapper.resizeEvent(
        eventEl,
        '2018-12-25T02:00:00',
        '2018-12-25T04:00:00', // drag TWO snaps
      )
      await waitEventResize(calendar, resizing)
      expect(mirrorMountCalls).toBe(1 * strictModeFactor)
      expect(mirrorContentCalls).toBe(3 * strictModeFactor)
      expect(mirrorUnmountCalls).toBe(1 * strictModeFactor)
    })
  })
})
