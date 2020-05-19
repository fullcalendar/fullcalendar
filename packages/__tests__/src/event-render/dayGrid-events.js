import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { rectsIntersect } from '../lib/geom'


describe('dayGrid advanced event rendering', function() {

  // https://github.com/fullcalendar/fullcalendar/issues/5408
  it('renders without intersecting', function() {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
      events: [
        { start: '2020-05-02', end: '2020-05-04', title: 'event a' },
        { start: '2020-05-02', end: '2020-05-04', title: 'event b' },
        { start: '2020-05-03', end: '2020-05-05', title: 'event c' },
        { start: '2020-05-04', title: 'event d' },
        { start: '2020-05-04', title: 'event e' }
      ]
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()
    let rects = eventEls.map((el) => el.getBoundingClientRect())
    let intersects = false

    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        if (rectsIntersect(rects[i], rects[j])) {
          console.log('rect intersection', eventEls[i], eventEls[j])
          intersects = true
        }
      }
    }

    expect(intersects).toBe(false)
  })

  it('does not render multi-day event as list-item', function() {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
      eventDisplay: 'auto',
      events: [
        {
          title: 'event 1',
          start: '2020-05-11T22:00:00',
          end: '2020-05-12T06:00:00'
        },
      ]
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]

    expect(dayGridWrapper.isEventListItem(eventEl)).toBe(false)
  })

})
