import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('eventMinHeight', () => {
  pushOptions({
    initialView: 'timeGridWeek',
    initialDate: '2017-08-10',
    events: [
      { start: '2017-08-10T10:30:00', end: '2017-08-10T10:31:00' },
    ],
  })

  it('has a non-zero default', () => {
    let calendar = initCalendar()
    let eventEl = new CalendarWrapper(calendar).getFirstEventEl()
    expect(eventEl.offsetHeight).toBeGreaterThan(5)
  })

  it('can be set and rendered', () => {
    let calendar = initCalendar({
      eventMinHeight: 40,
    })
    let eventEl = new CalendarWrapper(calendar).getFirstEventEl()
    expect(eventEl.offsetHeight).toBeGreaterThanOrEqual(39)
  })

  it('will ignore temporal non-collision and render side-by-side', () => {
    let calendar = initCalendar({
      eventMinHeight: 40,
      events: [
        { start: '2017-08-10T10:30:00', end: '2017-08-10T10:31:00', title: 'event a' },
        { start: '2017-08-10T10:31:20', end: '2017-08-10T10:31:40', title: 'event b' },
      ],
    })
    let eventEls = new CalendarWrapper(calendar).getEventEls()
    expect(eventEls[0].getBoundingClientRect().left)
      .toBeLessThan(eventEls[1].getBoundingClientRect().left)
  })
})
