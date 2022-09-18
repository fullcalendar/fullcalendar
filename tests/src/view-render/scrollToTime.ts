import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('scrollToTime method', () => {
  it('accepts a object duration input', () => {
    let calendar = initCalendar({
      scrollTime: 0,
      initialView: 'timeGridWeek',
    })
    let viewWrapper = new TimeGridViewWrapper(calendar)

    calendar.scrollToTime({ hours: 2 })

    // NOTE: c&p'd from scrollTime tests
    let slotTop = viewWrapper.timeGrid.getTimeTop('02:00:00') - viewWrapper.timeGrid.el.getBoundingClientRect().top
    let scrollEl = viewWrapper.getScrollerEl()
    let scrollTop = scrollEl.scrollTop
    let diff = Math.abs(slotTop - scrollTop)

    expect(slotTop).toBeGreaterThan(0)
    expect(scrollTop).toBeGreaterThan(0)
    expect(diff).toBeLessThan(3)
  })
})
