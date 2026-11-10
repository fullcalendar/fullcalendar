import { describe, expect, it } from 'vitest'
import { createCalendarElement, initCalendar } from '../lib/calendar'
import { getEventEls, isElVisible, queryPart, queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
The calendar resizes itself when its container's size changes. There's no updateSize() method anymore:
ResizeObserver does it.
*/
describe('container resize', () => {
  it('sizes a calendar rendered while hidden once it\'s shown', async () => {
    // how many events fit in a cell, and the more-link, depend on measuring the cells
    const options = {
      initialView: 'dayGridMonth',
      initialDate: '2014-08-01',
      contentHeight: 600,
      dayMaxEvents: true,
      events: Array.from({ length: 8 }, () => ({ start: '2014-08-06', title: 'event' })),
    }
    const visibleCalendar = initCalendar(options)
    await waitForSettle()
    const expectedEventCount = getEventEls(visibleCalendar.el).filter(isElVisible).length
    expect(expectedEventCount).toBeGreaterThan(0)
    expect(expectedEventCount).toBeLessThan(8)
    visibleCalendar.destroy()

    const el = createCalendarElement()
    el.style.display = 'none'
    const calendar = initCalendar(options, el)
    await waitForSettle()

    el.style.display = ''
    await waitForSettle()

    const viewEl = queryPart(calendar.el, 'view')!
    expect(Math.round(viewEl.getBoundingClientRect().height)).toBe(600)
    expect(getEventEls(calendar.el).filter(isElVisible)).toHaveLength(expectedEventCount)
    expect(queryParts(calendar.el, 'moreLink').filter(isElVisible)).toHaveLength(1)
  })

  it('resizes the view, and its columns, with the container', async () => {
    const el = createCalendarElement()
    el.style.maxWidth = 'none'
    el.style.width = '900px'
    const calendar = initCalendar({ initialView: 'timeGridWeek', aspectRatio: 1.5 }, el)
    await waitForSettle()
    const viewEl = queryPart(calendar.el, 'view')!
    const laneWidth = queryParts(calendar.el, 'dayLane')[0].getBoundingClientRect().width
    expect(Math.round(viewEl.getBoundingClientRect().height)).toBe(600)

    el.style.width = '600px'
    await waitForSettle()

    expect(Math.round(viewEl.getBoundingClientRect().height)).toBe(400) // keeps the aspect ratio
    const newLaneWidth = queryParts(calendar.el, 'dayLane')[0].getBoundingClientRect().width
    expect(laneWidth - newLaneWidth).toBeCloseTo(300 / 7, 0) // the columns share the lost width
  })
})
