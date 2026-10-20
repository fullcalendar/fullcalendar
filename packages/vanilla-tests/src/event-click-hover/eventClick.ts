import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('eventClick', () => {
  pushOptions({
    initialDate: '2018-08-31',
    initialView: 'dayGridMonth',
  })

  it('receives correct args', (done) => {
    let calendar = initCalendar({
      events: [
        { start: '2018-08-31' },
      ],
      eventClick(info) {
        expect(info.el instanceof HTMLElement).toBe(true)
        expect(typeof info.event).toBe('object')
        expect(info.event.start instanceof Date).toBe(true)
        expect(info.jsEvent instanceof UIEvent).toBe(true)
        expect(typeof info.view).toBe('object')
        done()
      },
    })

    let eventEls = new CalendarWrapper(calendar).getEventEls()

    expect(eventEls.length).toBe(1)
    $(eventEls[0]).simulate('click')
  })

  it('fires on a background event', (done) => {
    let calendar = initCalendar({
      events: [
        { start: '2018-08-31', display: 'background' },
      ],
      eventClick(info) {
        expect(info.event.display).toBe('background')
        done()
      },
    })

    let bgEventEls = new CalendarWrapper(calendar).getBgEventEls()

    expect(bgEventEls.length).toBe(1)
    $(bgEventEls[0]).simulate('click')
  })

  it('does not fire on an event whose interactive property is false', () => {
    let clickedTitles = []
    let calendar = initCalendar({
      events: [
        { title: 'inert', start: '2018-08-31', interactive: false },
        { title: 'clickable', start: '2018-08-31' },
      ],
      eventClick(info) {
        clickedTitles.push(info.event.title)
      },
    })

    let eventEls = new CalendarWrapper(calendar).getEventEls()

    expect(eventEls.length).toBe(2)
    for (let eventEl of eventEls) {
      $(eventEl).simulate('click')
    }
    expect(clickedTitles).toEqual(['clickable'])
  })

  it('does not fire when eventInteractive is false', () => {
    let clickCount = 0
    let calendar = initCalendar({
      eventInteractive: false,
      events: [
        { start: '2018-08-31' },
      ],
      eventClick() {
        clickCount += 1
      },
    })

    let eventEls = new CalendarWrapper(calendar).getEventEls()

    expect(eventEls.length).toBe(1)
    $(eventEls[0]).simulate('click')
    expect(clickCount).toBe(0)
  })

  it('works via touch', (done) => {
    let calendar = initCalendar({
      events: [
        { start: '2018-08-31' },
      ],
      eventClick() {
        done()
      },
    })

    let eventEls = new CalendarWrapper(calendar).getEventEls()

    expect(eventEls.length).toBe(1)
    $(eventEls[0]).simulate('click')
  })
})
