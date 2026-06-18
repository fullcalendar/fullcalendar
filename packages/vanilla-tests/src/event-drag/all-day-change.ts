import { parseMarker, addMs } from 'fullcalendar/protected-api'
import { drag } from '../lib/EventDragUtils'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { intersectRects } from '../lib/geom'
import { waitTimeout } from '../lib/misc'

describe('allDay change', () => {
  pushOptions({
    timeZone: 'UTC',
    initialView: 'timeGridWeek',
    now: '2018-09-03',
    scrollTime: 0,
    editable: true,
    dragScroll: false,
  })

  describe('when dragged from all-day to timed', () => {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-03', end: '2018-09-05' },
      ],
    })

    function doDrag(calendar) {
      let viewWrapper = new TimeGridViewWrapper(calendar)
      let dayGridWrapper = viewWrapper.dayGrid
      let timeGridWrapper = viewWrapper.timeGrid

      let startRect = intersectRects(
        dayGridWrapper.getDayEls('2018-09-03')[0].getBoundingClientRect(),
        dayGridWrapper.getEventEls()[0].getBoundingClientRect(),
      )
      let endDate = parseMarker('2018-09-03T02:00:00').marker
      let endRect = timeGridWrapper.computeSpanRects(
        endDate,
        addMs(endDate, 1000 * 60 * 30), // hardcoded 30 minute slot :(
      )[0]

      return drag(calendar, startRect, endRect, false) // debug=false
    }

    it('discards duration when allDayMaintainDuration:false', async () => {
      let calendar = initCalendar({
        allDayMaintainDuration: false,
      })
      await waitTimeout()
      await doDrag(calendar)
      let event = calendar.getEventById('1')
      expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
      expect(event.end).toBe(null)
    })

    it('keeps duration when allDayMaintainDuration:true', async () => {
      let calendar = initCalendar({
        allDayMaintainDuration: true,
      })
      await waitTimeout()
      await doDrag(calendar)
      let event = calendar.getEventById('1')
      expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
      expect(event.end).toEqualDate('2018-09-05T02:00:00Z')
    })

    it('sets a default duration when forceEventDuration:true', async () => {
      let calendar = initCalendar({
        forceEventDuration: true,
        defaultTimedEventDuration: '04:00',
      })
      await waitTimeout()
      await doDrag(calendar)
      let event = calendar.getEventById('1')
      expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
      expect(event.end).toEqualDate('2018-09-03T06:00:00Z')
    })
  })

  describe('when dragging from timed to all-day', () => {
    it('sets a default duration when forceEventDuration:true', async () => {
      let calendar = initCalendar({
        forceEventDuration: true,
        defaultAllDayEventDuration: { days: 2 },
        events: [
          { id: '1', start: '2018-09-03T01:00:00', end: '2018-09-03T02:00:00' },
        ],
      })
      await waitTimeout()

      let viewWrapper = new TimeGridViewWrapper(calendar)
      let dayGridWrapper = viewWrapper.dayGrid
      let timeGridWrapper = viewWrapper.timeGrid
      let startRect = timeGridWrapper.getEventEls()[0].getBoundingClientRect()
      let endRect = dayGridWrapper.getDayEls('2018-09-03')[0].getBoundingClientRect()

      await drag(calendar, startRect, endRect, false) // debug=false
      let event = calendar.getEventById('1')
      expect(event.start).toEqualDate('2018-09-03T00:00:00Z')
      expect(event.end).toEqualDate('2018-09-05T00:00:00Z')
    })

    // https://github.com/fullcalendar/fullcalendar/issues/7222
    it('from more-popover', async () => {
      let calendar = initCalendar({
        eventMaxStack: 1,
        events: [
          { id: '1', start: '2018-09-03T01:00:00', end: '2018-09-03T02:00:00' },
          { id: '2', start: '2018-09-03T01:00:00', end: '2018-09-03T02:00:00' }, // in popover
        ],
      })
      await waitTimeout()

      let viewWrapper = new TimeGridViewWrapper(calendar)
      let dayGridWrapper = viewWrapper.dayGrid
      let timeGridWrapper = viewWrapper.timeGrid

      timeGridWrapper.openMorePopover()
      await waitTimeout()
      let popoverEventEl = timeGridWrapper.getMorePopoverEventEls()[0]
      let startRect = popoverEventEl.getBoundingClientRect()
      let endRect = dayGridWrapper.getDayEls('2018-09-03')[0].getBoundingClientRect()

      await drag(calendar, startRect, endRect, false, popoverEventEl) // debug=false
      let event = calendar.getEventById('2')
      expect(event.start).toEqualDate('2018-09-03T00:00:00Z')
      expect(event.end).toBe(null)
      expect(event.allDay).toBe(true)
    })
  })
})
