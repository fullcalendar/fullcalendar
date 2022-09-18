import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('fixedMirrorParent', () => {
  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2020-10-26',
  })

  it('changes the mirror\'s parent element', (done) => {
    let calendar = initCalendar({
      editable: true,
      fixedMirrorParent: document.body,
      events: [
        { start: '2020-10-04' },
      ],
    })

    let wrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = wrapper.getEventEls()

    $(eventEls[0]).simulate('drag', {
      dx: -100, // out of the calendar, to create a fixed mirror el
      onBeforeRelease() {
        let $mirrorEl = $('body').find('> .' + CalendarWrapper.EVENT_CLASSNAME) // direct child
        expect($mirrorEl.length).toBe(1)
      },
      onRelease() {
        done()
      },
    })
  })
})
