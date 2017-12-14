import * as EventDragUtils from './EventDragUtils'
import * as DayGridEventDragUtils from './DayGridEventDragUtils'
import * as DayGridRenderUtils from '../view-render/DayGridRenderUtils'

describe('showNonCurrentDates event dragging', function() {
  pushOptions({
    defaultView: 'month',
    defaultDate: '2017-06-01',
    showNonCurrentDates: false,
    events: [
      { start: '2017-06-07', end: '2017-06-10' }
    ],
    editable: true
  })

  describe('when dragging pointer into disabled region', function() {
    pit('won\'t allow the drop', function() {
      initCalendar()
      return EventDragUtils.drag(
        DayGridRenderUtils.getSingleDayEl('2017-06-08')[0].getBoundingClientRect(),
        DayGridRenderUtils.getDisabledEl(3)[0].getBoundingClientRect() // the cell before Jun 1
      ).then(function(res) {
        expect(res.isSuccess).toBe(false)
      })
    })
  })

  describe('when dragging an event\'s start into a disabled region', function() {
    pit('allow the drop if the cursor stays over non-disabled cells', function() {
      initCalendar()
      return DayGridEventDragUtils.drag('2017-06-08', '2017-06-01')
        .then(function(res) {
          expect(res.isSuccess).toBe(true)
        })
    })
  })
})
