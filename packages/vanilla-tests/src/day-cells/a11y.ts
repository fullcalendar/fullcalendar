import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { queryPart } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getScreenReaderEls } from '../lib/text'

describe('day cell a11y text', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2023-01-16',
  }

  // aria-label on a cell is ignored by VoiceOver when the cell has no other readable content.
  // Cells without a day number have no hidden text: the column header already reads the full date,
  // which would otherwise be read twice.
  it.each([
    ['dayGridMonth', ['January 16, 2023']],
    ['dayGridWeek', []],
  ])('in %s, reads hidden date text %j instead of a cell label', async (initialView, texts) => {
    const calendar = initCalendar({ ...options, initialView })
    await waitForSettle()

    const cellEl = new DayGridModel(calendar.el).getDayCell('2023-01-16')
    const dayNumberEl = queryPart(cellEl, 'dayCellTopInner')
    expect(cellEl.hasAttribute('aria-label')).toBe(false)
    expect(getScreenReaderEls(cellEl).map((el) => el.textContent)).toEqual(texts)
    expect(dayNumberEl === null).toBe(texts.length === 0)

    if (dayNumberEl) {
      expect(dayNumberEl.closest('[aria-hidden="true"]')).toBeTruthy()
    }
  })

  it('relies on the nav link instead of hidden text when navLinks is enabled', async () => {
    const calendar = initCalendar({ ...options, navLinks: true })
    await waitForSettle()

    const cellEl = new DayGridModel(calendar.el).getDayCell('2023-01-16')
    expect(cellEl.hasAttribute('aria-label')).toBe(false)
    expect(getScreenReaderEls(cellEl)).toEqual([])
    expect(queryPart(cellEl, 'navLink')!.getAttribute('aria-label')).toBe('Go to January 16, 2023')
  })
})
