import { describe, expect, it } from 'vitest'
import { createCalendarElement, initCalendar } from '../lib/calendar'
import { getEventEls, queryParts } from '../lib/models/events'
import { getSlotLaneEls, getSlotTop, getVerticalScroller } from '../lib/models/slots'
import { waitForSettle } from '../lib/settle'

function getTimedScroller(root: HTMLElement): HTMLElement {
  return getVerticalScroller(getSlotLaneEls(root)[0])
}

/*
Throws unless the time's slot is at the top of the scroller, scrolled there.
*/
function expectScrolledToTime(root: HTMLElement, time: string): void {
  const scrollerEl = getTimedScroller(root)
  expect(scrollerEl.scrollTop).toBeGreaterThan(0)
  expect(Math.abs(getSlotTop(root, time) - scrollerEl.getBoundingClientRect().top)).toBeLessThan(3)
}

describe('scrollTime', () => {
  const options = {
    initialView: 'timeGridWeek',
    height: 400, // short enough to scroll
  }

  it.each([
    ['a string', '02:00:00'],
    ['an object', { hours: 2 }],
  ])('scrolls to the time given as %s', async (_desc, scrollTime) => {
    const calendar = initCalendar({ ...options, scrollTime })
    await waitForSettle()

    expectScrolledToTime(calendar.el, '02:00:00')
  })

  it.each([
    [true, true],
    [false, false],
  ])('with scrollTimeReset:%s, resets the scroll on navigation: %s', async (scrollTimeReset, resets) => {
    const calendar = initCalendar({ ...options, scrollTime: '02:00:00', scrollTimeReset })
    await waitForSettle()

    const scrollerEl = getTimedScroller(calendar.el)
    scrollerEl.scrollTop = 99999
    const bottomScrollTop = scrollerEl.scrollTop
    calendar.next()
    await waitForSettle()

    if (resets) {
      expectScrolledToTime(calendar.el, '02:00:00')
    } else {
      expect(getTimedScroller(calendar.el).scrollTop).toBe(bottomScrollTop)
    }
  })
})

describe('scrollToTime', () => {
  it('scrolls to a time given as an object', async () => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', scrollTime: 0 })
    await waitForSettle()
    expect(getTimedScroller(calendar.el).scrollTop).toBe(0)

    calendar.scrollToTime({ hours: 2 })
    await waitForSettle()

    expectScrolledToTime(calendar.el, '02:00:00')
  })
})

describe('scroll state', () => {
  it.each([
    ['dayGridMonth', 'dayCell'],
    ['timeGridWeek', 'slotLane'],
  ])('in %s, is kept when rendering again', async (initialView, part) => {
    const el = createCalendarElement()
    el.style.width = '800px'
    const calendar = initCalendar({
      initialView,
      initialDate: '2015-02-20',
      contentHeight: 200,
      scrollTime: '00:00',
      events: [{ start: '2015-02-20' }],
    }, el)
    await waitForSettle()
    expect(getEventEls(calendar.el).length).toBe(1)

    const scrollerEl = getVerticalScroller(queryParts(calendar.el, part)[0])
    scrollerEl.scrollTop = 99999 // all the way
    const scrollTop = scrollerEl.scrollTop
    expect(scrollTop).toBeGreaterThan(0)

    calendar.render()
    await waitForSettle()

    expect(getEventEls(calendar.el).length).toBe(1)
    expect(scrollerEl.scrollTop).toBe(scrollTop)
  })
})
