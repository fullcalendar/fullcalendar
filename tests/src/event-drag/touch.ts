import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { waitEventDrag } from '../lib/wrappers/interaction-util.js'

describe('event touch dragging', () => {
  // https://github.com/fullcalendar/fullcalendar/issues/5706
  it('keeps event selected when initiated on custom element', (done) => {
    let calendar = initCalendar({
      initialDate: '2020-08-12',
      editable: true,
      longPressDelay: 100, // dragEventToDate waits 200. TODO: no more hardcoding
      events: [
        { title: 'event', start: '2020-08-12' },
      ],
      eventContent: { html: '<i>the text</i>' },
    })
    let gridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = gridWrapper.getEventEls()[0]

    let dragging = gridWrapper.dragEventToDate(
      eventEl.querySelector('i'),
      null, // don't specify start date. start drag on center of given element
      '2020-08-13',
      true,
    )

    waitEventDrag(calendar, dragging).then((event) => {
      expect(event.startStr).toBe('2020-08-13')
      done()
    })
  })
})
