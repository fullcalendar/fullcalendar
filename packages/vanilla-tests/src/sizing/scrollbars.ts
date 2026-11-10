import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { areScrollbarsHidden } from '../lib/env'
import { queryParts } from '../lib/models/events'
import { DayGridModel } from '../lib/models/day-grid'
import { TimeGridModel } from '../lib/models/time-grid'
import { getVerticalScroller } from '../lib/models/slots'
import { waitForSettle } from '../lib/settle'

/*
When the body scrolls vertically, its scrollbar takes width that the header doesn't have. The layout
compensates so header cells stay aligned with the body's columns. Runs with scrollbars and without
(the browser and browser-no-scrollbars projects in vitest.config.base.ts).
*/
describe('header alignment with a vertical scrollbar', () => {
  const DATES = ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05', '2023-01-06', '2023-01-07']

  function getDayHeaderEl(root: HTMLElement, date: string): HTMLElement {
    const el = queryParts(root, 'dayHeader').find((headerEl) => headerEl.getAttribute('data-date') === date)

    if (!el) {
      throw new Error(`No day header for ${date}`)
    }

    return el
  }

  function expectAligned(headerEl: HTMLElement, bodyEl: HTMLElement, desc: string): void {
    const headerRect = headerEl.getBoundingClientRect()
    const bodyRect = bodyEl.getBoundingClientRect()
    expect(Math.abs(headerRect.left - bodyRect.left), `${desc} left`).toBeLessThanOrEqual(1)
    expect(Math.abs(headerRect.right - bodyRect.right), `${desc} right`).toBeLessThanOrEqual(1)
  }

  describe.each(['ltr', 'rtl'] as const)('in %s', (direction) => {
    it.each([
      ['timeGridWeek', (root: HTMLElement, date: string) => new TimeGridModel(root).getDayLane(date)],
      ['dayGridWeek', (root: HTMLElement, date: string) => new DayGridModel(root).getDayCell(date)],
    ] as const)('aligns %s\'s day headers with its columns', async (initialView, getBodyEl) => {
      const calendar = initCalendar({
        initialView,
        initialDate: '2023-01-01',
        direction,
        height: 300,
        views: { dayGridWeek: { dayMaxEventRows: false } },
        // enough all-day events to make dayGridWeek's body scroll too
        events: Array.from({ length: 15 }, (_, i) => ({ title: `event ${i}`, start: '2023-01-03' })),
      })
      await waitForSettle()

      const scrollerEl = getVerticalScroller(getBodyEl(calendar.el, DATES[0]))
      expect(scrollerEl.offsetWidth - scrollerEl.clientWidth > 0).toBe(!areScrollbarsHidden)

      for (const date of DATES) {
        expectAligned(getDayHeaderEl(calendar.el, date), getBodyEl(calendar.el, date), date)
      }
    })
  })
})
