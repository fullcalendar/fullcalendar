import { describe, expect, it } from 'vitest'
import { createCalendarElement, initCalendar } from '../lib/calendar'
import { queryPart, queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
aspectRatio sizes the view (not the toolbars): its width divided by its height.
*/
describe('aspectRatio', () => {
  async function getViewRect(width: number, aspectRatio?: number): Promise<DOMRect> {
    const el = createCalendarElement()
    el.style.maxWidth = 'none'
    el.style.width = width + 'px'

    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      ...(aspectRatio === undefined ? {} : { aspectRatio }),
    }, el)
    await waitForSettle()

    return queryPart(calendar.el, 'view')!.getBoundingClientRect()
  }

  it('defaults to 1.35', async () => {
    const rect = await getViewRect(677)

    expect(rect.width).toBe(677)
    expect(Math.round(rect.height)).toBe(Math.round(677 / 1.35))
  })

  it.each([
    [2, 2],
    [1, 1],
    // the minimum is 0.5
    [0.4, 0.5],
    [0, 0.5],
    [-2, 0.5],
  ])('when %s, sizes the view to a ratio of %s', async (aspectRatio, expectedRatio) => {
    const rect = await getViewRect(1000, aspectRatio)

    expect(rect.width).toBe(1000)
    expect(Math.round(rect.width / rect.height * 100)).toBe(expectedRatio * 100)
  })

  it('when very large, gives the rows their natural height', async () => {
    const el = createCalendarElement()
    el.style.maxWidth = 'none'
    el.style.width = '1000px'
    const calendar = initCalendar({ initialView: 'dayGridMonth', aspectRatio: 4000 }, el)
    await waitForSettle()

    const viewRect = queryPart(calendar.el, 'view')!.getBoundingClientRect()
    expect(viewRect.width).toBe(1000)
    expect(viewRect.height).toBeGreaterThan(1000 / 4000) // not the ratio's height

    // the rows are as tall as their content: the day-number row
    for (const rowEl of queryParts(calendar.el, 'dayRow')) {
      const cellEl = queryPart(rowEl, 'dayCell')!
      const topEl = queryPart(cellEl, 'dayCellTop')!
      expect(rowEl.getBoundingClientRect().height).toBeLessThan(topEl.getBoundingClientRect().height + 30)
    }
  })
})
