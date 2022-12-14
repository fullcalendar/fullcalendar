import * as EventDragUtils from '../lib/EventDragUtils.js'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { waitEventDrag } from '../lib/wrappers/interaction-util.js'

describe('showNonCurrentDates event dragging', () => {
  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2017-06-01',
    showNonCurrentDates: false,
    events: [
      { start: '2017-06-07', end: '2017-06-10' },
    ],
    editable: true,
  })

  describe('when dragging pointer into disabled region', () => {
    it('won\'t allow the drop', (done) => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      EventDragUtils.drag(
        dayGridWrapper.getDayEl('2017-06-08').getBoundingClientRect(),
        dayGridWrapper.getDisabledDayEls()[3].getBoundingClientRect(), // the cell before Jun 1
      )
        .then((res) => {
          expect(res).toBe(false)
        })
        .then(() => done())
    })
  })

  describe('when dragging an event\'s start into a disabled region', () => {
    it('allow the drop if the cursor stays over non-disabled cells', (done) => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      let dragging = dayGridWrapper.dragEventToDate(
        dayGridWrapper.getEventEls()[0],
        '2017-06-08',
        '2017-06-01',
      )

      waitEventDrag(calendar, dragging).then((res) => {
        expect(typeof res).toBe('object')
        done()
      })
    })
  })
})
