import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { waitEventResize } from '../lib/wrappers/interaction-util.js'

describe('event mirror rendering', () => {
  pushOptions({
    editable: true,
  })

  it('maintains vertical position while dragging', (done) => {
    let calendar = initCalendar({
      initialDate: '2019-08-26',
      initialView: 'dayGridMonth',
      eventOrder: 'title',
      events: [
        { start: '2019-08-27', title: 'event0' },
        { start: '2019-08-27', title: 'event1' },
      ],
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()

    let resizing = dayGridWrapper.resizeEvent(
      eventEls[1],
      '2019-08-27',
      '2019-08-28',
      false, // resize-from-start
      () => { // onBeforeRelease
        let mirrorEls = dayGridWrapper.getMirrorEls()
        expect(mirrorEls[0].getBoundingClientRect().top).toBe(
          eventEls[1].getBoundingClientRect().top,
        )
      },
    )

    waitEventResize(calendar, resizing).then(() => done())
  })
})
