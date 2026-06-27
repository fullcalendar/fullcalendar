import * as EventDragUtils from '../lib/EventDragUtils'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitEventDrag } from '../lib/wrappers/interaction-util'
import { waitTimeout } from '../lib/misc'

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
    it('won\'t allow the drop', async () => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      await waitTimeout()
      let res = await EventDragUtils.drag(
        calendar,
        dayGridWrapper.getDayEl('2017-06-08').getBoundingClientRect(),
        dayGridWrapper.getDisabledDayEls()[3].getBoundingClientRect(), // the cell before Jun 1
      )
      expect(res).toBe(false)
    })
  })

  describe('when dragging an event\'s start into a disabled region', () => {
    it('allow the drop if the cursor stays over non-disabled cells', async () => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      await waitTimeout()
      let dragging = dayGridWrapper.dragEventToDate(
        dayGridWrapper.getEventEls()[0],
        '2017-06-08',
        '2017-06-01',
      )
      let res = await waitEventDrag(calendar, dragging)
      expect(typeof res).toBe('object')
    })
  })
})
