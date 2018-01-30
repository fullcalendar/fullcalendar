import * as EventResizeUtils from './EventResizeUtils'
import * as DayGridRenderUtils from '../view-render/DayGridRenderUtils'


describe('validRange event resizing', function() {

  describe('when in month view', function() {
    pushOptions({
      defaultView: 'month',
      defaultDate: '2017-06-01',
      validRange: { end: '2017-06-09' },
      events: [
        { start: '2017-06-04', end: '2017-06-07' }
      ],
      editable: true
    })

    pit('won\'t go after validRange', function() {
      initCalendar()
      return EventResizeUtils.resize(
        DayGridRenderUtils.getSingleDayEl('2017-06-06')[0].getBoundingClientRect(),
        DayGridRenderUtils.getDisabledEl(0)[0].getBoundingClientRect() // where Jun 9th would be
      ).then(function(res) {
        expect(res.isSuccess).toBe(false)
      })
    })
  })
})
