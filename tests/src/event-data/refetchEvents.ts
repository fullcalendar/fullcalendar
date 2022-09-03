import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('refetchEvents', () => {
  it('retains scroll when in month view', () => {
    let el = $('<div id="calendar" style="width:300px"/>').appendTo('body')
    let scrollEl
    let scrollTop

    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2017-04-25',
      events: [
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
        { start: '2017-04-04', title: 'event' },
      ],
    }, el)

    let calendarWrapper = new CalendarWrapper(calendar)

    expect(calendarWrapper.getEventEls().length).toBe(8)

    let viewWrapper = new DayGridViewWrapper(calendar)
    scrollEl = viewWrapper.getScrollerEl()
    scrollEl.scrollTop = 1000
    scrollTop = scrollEl.scrollTop

    // verify that we queried the correct scroller el
    expect(scrollTop).toBeGreaterThan(10)

    currentCalendar.refetchEvents()
    expect(calendarWrapper.getEventEls().length).toBe(8)
    expect(scrollEl.scrollTop).toBe(scrollTop)
  })
})
