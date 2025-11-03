import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import dayGridOverlapsPlugin from '@fullcalendar/daygrid-overlaps'
import '../lib/dom-misc.js'

describe('daygrid-overlaps proportional multiday placement', () => {
  it('does not treat a slice that ends at 10:00 as overlapping an event that starts at 12:00 on the same day', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'dayGridMonth',
      plugins: [dayGridOverlapsPlugin],
      // ensure we have a constrained content height to map times into pixels
      dayMaxEventRows: true,
      events: [
        // multiday event starting previous day and ending 2023-06-02 10:00
        {
          title: 'Multi Event',
          start: '2023-06-01T20:00:00',
          end: '2023-06-02T10:00:00',
        },
        // single-day event starting 2023-06-02 12:00
        {
          title: 'Midday Event',
          start: '2023-06-02T12:00:00',
          end: '2023-06-02T13:00:00',
        },
      ],
    })

    const dayGrid = new DayGridViewWrapper(calendar).dayGrid

    // find event elements for June 2 by testing intersection with the day cell
    const dayEl = dayGrid.getDayEl('2023-06-02')
    const dayRect = dayEl.getBoundingClientRect()
    const allEventEls = dayGrid.getEventEls()
    const eventEls = allEventEls.filter((el: HTMLElement) => {
      const r = el.getBoundingClientRect()
      return !(r.bottom <= dayRect.top || r.top >= dayRect.bottom || r.right <= dayRect.left || r.left >= dayRect.right)
    })

    // there should be at least two event elements in that day
    expect(eventEls.length).toBeGreaterThanOrEqual(2)

    // find their bounding rects and ensure they don't vertically overlap
    const rects = Array.from(eventEls).map((el: Element) => el.getBoundingClientRect())

    // sort by top
    rects.sort((a, b) => a.top - b.top)

    // the bottom of the earlier rect should be <= top of the later rect (allow 1px tolerance)
    const earlier = rects[0]
    const later = rects[1]

    expect(earlier.bottom <= later.top + 1).toBe(true)
  })
})
