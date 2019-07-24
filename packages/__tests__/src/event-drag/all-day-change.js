import { drag } from './EventDragUtils'
import { computeSpanRects } from '../view-render/TimeGridRenderUtils'
import { getDayEl } from '../view-render/DayGridRenderUtils'
import { getEventEls } from '../event-render/EventRenderUtils'
import { parseMarker, addMs } from '@fullcalendar/core'

describe('allDay change', function() {
  pushOptions({
    timeZone: 'UTC',
    defaultView: 'timeGridWeek',
    now: '2018-09-03',
    scrollTime: 0,
    editable: true,
    dragScroll: false
  })

  describe('when dragged from all-day to timed', function() {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-03', end: '2018-09-05' }
      ]
    })

    function doDrag() {
      let startRect = getDayEl('2018-09-03')[0].getBoundingClientRect()
      let endDate = parseMarker('2018-09-03T02:00:00').marker
      var endRect = computeSpanRects(
        endDate,
        addMs(endDate, 1000 * 60 * 30) // hardcoded 30 minute slot :(
      )[0]
      return drag(startRect, endRect, false) // debug=false
    }

    it('discards duration when allDayMaintainDuration:false', function(done) {
      initCalendar({
        allDayMaintainDuration: false
      })
      doDrag().then(function() {
        let event = currentCalendar.getEventById('1')
        expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
        expect(event.end).toBe(null)
      }).then(done)
    })

    it('keeps duration when allDayMaintainDuration:true', function(done) {
      initCalendar({
        allDayMaintainDuration: true
      })
      doDrag().then(function() {
        let event = currentCalendar.getEventById('1')
        expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
        expect(event.end).toEqualDate('2018-09-05T02:00:00Z')
      }).then(done)
    })

    it('sets a default duration when forceEventDuration:true', function(done) {
      initCalendar({
        forceEventDuration: true,
        defaultTimedEventDuration: '04:00'
      })
      doDrag().then(function() {
        let event = currentCalendar.getEventById('1')
        expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
        expect(event.end).toEqualDate('2018-09-03T06:00:00Z')
      }).then(done)
    })

  })

  describe('when dragging from timed to all-day', function() {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-03T01:00:00', end: '2018-09-03T02:00:00' }
      ]
    })

    function doDrag() {
      let startRect = getEventEls()[0].getBoundingClientRect()
      let endRect = getDayEl('2018-09-03')[0].getBoundingClientRect()
      return drag(startRect, endRect, false) // debug=false
    }

    it('sets a default duration when forceEventDuration:true', function(done) {
      initCalendar({
        forceEventDuration: true,
        defaultAllDayEventDuration: { days: 2 }
      })
      doDrag().then(function() {
        let event = currentCalendar.getEventById('1')
        expect(event.start).toEqualDate('2018-09-03T00:00:00Z')
        expect(event.end).toEqualDate('2018-09-05T00:00:00Z')
      }).then(done)
    })

  })

})
