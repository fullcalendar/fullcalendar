import { TimeGridViewWrapper } from "../lib/wrappers/TimeGridViewWrapper"

describe('scrollToTime method', function() {

  it('accepts a object duration input', function() {
    let calendar = initCalendar({
      scrollTime: 0,
      initialView: 'timeGridWeek'
    })
    let viewWrapper = new TimeGridViewWrapper(calendar)

    calendar.scrollToTime({ hours: 2 })

    // NOTE: c&p'd from scrollTime tests
    var slotTop = viewWrapper.timeGrid.getTimeTop('02:00:00') - viewWrapper.timeGrid.el.getBoundingClientRect().top
    var scrollEl = viewWrapper.getScrollerEl()
    var scrollTop = scrollEl.scrollTop
    var diff = Math.abs(slotTop - scrollTop)

    expect(slotTop).toBeGreaterThan(0)
    expect(scrollTop).toBeGreaterThan(0)
    expect(diff).toBeLessThan(3)
  })
})
