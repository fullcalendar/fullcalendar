import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

// background fills are decorative. otherwise screen readers find empty groups
describe('background fill a11y', () => {
  it.each([
    ['dayGridMonth', 1], // only the all-day one
    ['timeGridWeek', 3], // the all-day one also fills its day's lane
  ])('in %s, hides background events and non-business fills from screen readers', async (initialView, bgEventCount) => {
    const calendar = initCalendar({
      initialView,
      initialDate: '2023-01-16',
      businessHours: true,
      events: [
        { start: '2023-01-17', display: 'background', title: 'Holiday' },
        { start: '2023-01-18T10:00:00', end: '2023-01-18T12:00:00', display: 'background' },
      ],
    })
    await waitForSettle()

    const bgEventEls = queryParts(calendar.el, 'backgroundEvent')
    const nonBusinessEls = queryParts(calendar.el, 'nonBusinessHours')
    expect(bgEventEls.length).toBe(bgEventCount)
    expect(nonBusinessEls.length).toBeGreaterThan(0)

    for (const el of [...bgEventEls, ...nonBusinessEls]) {
      expect(el.closest('[aria-hidden="true"]')).toBeTruthy()
    }
  })
})
