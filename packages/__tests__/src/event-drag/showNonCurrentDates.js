import * as EventDragUtils from './EventDragUtils'
import * as DayGridEventDragUtils from './DayGridEventDragUtils'
import * as DayGridRenderUtils from '../view-render/DayGridRenderUtils'

describe('showNonCurrentDates event dragging', function() {
  pushOptions({
    defaultView: 'dayGridMonth',
    defaultDate: '2017-06-01',
    showNonCurrentDates: false,
    events: [
      { start: '2017-06-07', end: '2017-06-10' }
    ],
    editable: true
  })

  describe('when dragging pointer into disabled region', function() {
    it('won\'t allow the drop', function(done) {
      initCalendar()
      EventDragUtils.drag(
        DayGridRenderUtils.getDayEl('2017-06-08')[0].getBoundingClientRect(),
        DayGridRenderUtils.getDisabledDayElAtIndex(3)[0].getBoundingClientRect() // the cell before Jun 1
      )
        .then(function(res) {
          expect(res).toBe(false)
        })
        .then(done)
    })
  })

  describe('when dragging an event\'s start into a disabled region', function() {
    it('allow the drop if the cursor stays over non-disabled cells', function(done) {
      initCalendar()
      DayGridEventDragUtils.drag('2017-06-08', '2017-06-01')
        .then(function(res) {
          expect(typeof res).toBe('object')
        })
        .then(done)
    })
  })
})
