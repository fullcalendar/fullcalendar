import * as EventResizeUtils from '../lib/EventResizeUtils'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('validRange event resizing', () => {
  describe('when in month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
      initialDate: '2017-06-01',
      validRange: { end: '2017-06-09' },
      events: [
        { start: '2017-06-04', end: '2017-06-07' },
      ],
      editable: true,
    })

    it('won\'t go after validRange', (done) => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      EventResizeUtils.resize(
        dayGridWrapper.getDayEl('2017-06-06').getBoundingClientRect(),
        dayGridWrapper.getDisabledDayEls()[0].getBoundingClientRect(), // where Jun 9th would be
      ).then((res) => {
        expect(res).toBe(false)
      }).then(done)
    })
  })
})
