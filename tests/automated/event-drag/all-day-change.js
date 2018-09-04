import { drag } from './EventDragUtils'
import { computeSpanRects } from '../event-render/TimeGridEventRenderUtils'
import { getDayEl } from '../view-render/DayGridRenderUtils'

describe('isAllDay change', function() {
  pushOptions({
    timeZone: 'UTC',
    defaultView: 'agendaWeek',
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
      let endDate = FullCalendar.parseMarker('2018-09-03T02:00:00').marker
      var endRect = computeSpanRects(
        endDate,
        FullCalendar.addMs(endDate, 1000 * 60 * 30) // hardcoded 30 minute slot :(
      )[0]
      return drag(startRect, endRect, false)
    }

    it('discards duration when isAllDayMaintainDuration:false', function(done) {
      initCalendar({
        isAllDayMaintainDuration: false
      })
      doDrag().then(function() {
        let event = currentCalendar.getEventById('1')
        expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
        expect(event.end).toBe(null)
      }).then(done)
    })

    it('keeps duration when isAllDayMaintainDuration:true', function(done) {
      initCalendar({
        isAllDayMaintainDuration: true
      })
      doDrag().then(function() {
        let event = currentCalendar.getEventById('1')
        expect(event.start).toEqualDate('2018-09-03T02:00:00Z')
        expect(event.end).toEqualDate('2018-09-05T02:00:00Z')
      }).then(done)
    })

  })

})
