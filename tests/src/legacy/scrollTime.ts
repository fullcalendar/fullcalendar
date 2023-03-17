import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('scrollTime', () => {
  pushOptions({
    initialView: 'timeGridWeek',
  })

  it('accepts a string Duration', () => {
    let calendar = initCalendar({
      scrollTime: '02:00:00',
      height: 400, // short enough to make scrolling happen
    })
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let timeGridWrapper = viewWrapper.timeGrid
    let slotTop = viewWrapper.timeGrid.getTimeTop('02:00:00') - $(timeGridWrapper.el).offset().top
    let scrollTop = viewWrapper.getScrollerEl().scrollTop
    let diff = Math.abs(slotTop - scrollTop)

    expect(slotTop).toBeGreaterThan(0)
    expect(scrollTop).toBeGreaterThan(0)
    expect(diff).toBeLessThan(3)
  })

  it('accepts a Duration object', () => {
    let calendar = initCalendar({
      scrollTime: { hours: 2 },
      height: 400, // short enough to make scrolling happen
    })
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let timeGridWrapper = viewWrapper.timeGrid
    let slotTop = timeGridWrapper.getTimeTop('02:00:00') - $(timeGridWrapper.el).offset().top
    let scrollTop = viewWrapper.getScrollerEl().scrollTop
    let diff = Math.abs(slotTop - scrollTop)

    expect(slotTop).toBeGreaterThan(0)
    expect(scrollTop).toBeGreaterThan(0)
    expect(diff).toBeLessThan(3)
  })

  it('doesn\'t get applied on navigation when scrollTimeReset is false', () => {
    let calendar = initCalendar({
      scrollTime: '02:00:00',
      scrollTimeReset: false,
      height: 400, // short enough to make scrolling happen
    })
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let scrollEl = viewWrapper.getScrollerEl()

    scrollEl.scrollTop = 99999
    let scrollTop = scrollEl.scrollTop

    calendar.next()
    expect(scrollEl.scrollTop).toBe(scrollTop) // stays the same
  })
})
