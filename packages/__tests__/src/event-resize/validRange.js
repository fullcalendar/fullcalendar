import * as EventResizeUtils from '../lib/EventResizeUtils'
import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'

describe('validRange event resizing', function() {

  describe('when in month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth',
      defaultDate: '2017-06-01',
      validRange: { end: '2017-06-09' },
      events: [
        { start: '2017-06-04', end: '2017-06-07' }
      ],
      editable: true
    })

    it('won\'t go after validRange', function(done) {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      EventResizeUtils.resize(
        dayGridWrapper.getDayEl('2017-06-06').getBoundingClientRect(),
        dayGridWrapper.getDisabledDayEls()[0].getBoundingClientRect() // where Jun 9th would be
      ).then(function(res) {
        expect(res).toBe(false)
      }).then(done)
    })
  })
})
