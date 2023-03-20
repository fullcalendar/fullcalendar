import { parseMarker, addMs } from '@fullcalendar/core/internal'
import { drag } from '../lib/EventDragUtils.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'
import { intersectRects } from '../lib/geom.js'

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

    function doDrag() {
      let viewWrapper = new TimeGridViewWrapper(currentCalendar)
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

      return drag(startRect, endRect, false) // debug=false
    }

    it('discards duration when allDayMaintainDuration:false', (done) => {
      initCalendar({
        allDayMaintainDuration: false,
      })
      doDrag().then(() => {
        let event = currentCalendar.getEventById('1')
        expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
        expect(event.end).toBe(null)
      }).then(() => done())
    })

    it('keeps duration when allDayMaintainDuration:true', (done) => {
      initCalendar({
        allDayMaintainDuration: true,
      })
      doDrag().then(() => {
        let event = currentCalendar.getEventById('1')
        expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
        expect(event.end).toEqualDate('2018-09-05T02:00:00Z')
      }).then(() => done())
    })

    it('sets a default duration when forceEventDuration:true', (done) => {
      initCalendar({
        forceEventDuration: true,
        defaultTimedEventDuration: '04:00',
      })
      doDrag().then(() => {
        let event = currentCalendar.getEventById('1')
        expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
        expect(event.end).toEqualDate('2018-09-03T06:00:00Z')
      }).then(() => done())
    })
  })

  describe('when dragging from timed to all-day', () => {
    it('sets a default duration when forceEventDuration:true', (done) => {
      initCalendar({
        forceEventDuration: true,
        defaultAllDayEventDuration: { days: 2 },
        events: [
          { id: '1', start: '2018-09-03T01:00:00', end: '2018-09-03T02:00:00' },
        ],
      })

      let viewWrapper = new TimeGridViewWrapper(currentCalendar)
      let dayGridWrapper = viewWrapper.dayGrid
      let timeGridWrapper = viewWrapper.timeGrid
      let startRect = timeGridWrapper.getEventEls()[0].getBoundingClientRect()
      let endRect = dayGridWrapper.getDayEls('2018-09-03')[0].getBoundingClientRect()

      drag(startRect, endRect, false).then(() => { // debug=false
        let event = currentCalendar.getEventById('1')
        expect(event.start).toEqualDate('2018-09-03T00:00:00Z')
        expect(event.end).toEqualDate('2018-09-05T00:00:00Z')
        done()
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/7222
    it('from more-popover', (done) => {
      initCalendar({
        eventMaxStack: 1,
        events: [
          { id: '1', start: '2018-09-03T01:00:00', end: '2018-09-03T02:00:00' },
          { id: '2', start: '2018-09-03T01:00:00', end: '2018-09-03T02:00:00' }, // in popover
        ],
      })

      let viewWrapper = new TimeGridViewWrapper(currentCalendar)
      let dayGridWrapper = viewWrapper.dayGrid
      let timeGridWrapper = viewWrapper.timeGrid

      timeGridWrapper.openMorePopover()
      setTimeout(() => {
        let popoverEventEl = timeGridWrapper.getMorePopoverEventEls()[0]
        let startRect = popoverEventEl.getBoundingClientRect()
        let endRect = dayGridWrapper.getDayEls('2018-09-03')[0].getBoundingClientRect()

        drag(startRect, endRect, false, popoverEventEl).then(() => { // debug=false
          let event = currentCalendar.getEventById('2')
          expect(event.start).toEqualDate('2018-09-03T00:00:00Z')
          expect(event.end).toBe(null)
          expect(event.allDay).toBe(true)
          done()
        })
      })
    })
  })
})
