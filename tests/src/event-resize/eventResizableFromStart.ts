import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitEventResize } from '../lib/wrappers/interaction-util'

describe('eventResizableFromStart', () => {
  pushOptions({
    editable: true,
    eventResizableFromStart: true,
  })

  describe('for DayGrid', () => {
    pushOptions({
      initialDate: '2019-08-26',
      initialView: 'dayGridMonth',
      events: [
        { start: '2019-08-27', title: 'all day event' },
      ],
    })

    it('allows resizing from start', (done) => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      let resizing = dayGridWrapper.resizeEvent(
        dayGridWrapper.getEventEls()[0],
        '2019-08-27',
        '2019-08-26',
        true, // resize-from-start
      )

      waitEventResize(calendar, resizing).then(() => {
        let event = calendar.getEvents()[0]
        expect(event.start).toEqualDate('2019-08-26')
        expect(event.end).toEqualDate('2019-08-28')
        done()
      })
    })
  })
})
