import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitEventResize } from '../lib/wrappers/interaction-util'
import { waitTimeout } from '../lib/misc'

describe('event mirror rendering', () => {
  pushOptions({
    editable: true,
  })

  it('maintains vertical position while dragging', async () => {
    let calendar = initCalendar({
      initialDate: '2019-08-26',
      initialView: 'dayGridMonth',
      eventOrder: 'title',
      events: [
        { start: '2019-08-27', title: 'event0' },
        { start: '2019-08-27', title: 'event1' },
      ],
    })
    await waitTimeout()
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
    await waitEventResize(calendar, resizing)
  })
})
