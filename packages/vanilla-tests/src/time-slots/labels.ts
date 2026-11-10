import { describe, expect, it } from 'vitest'
import enGbLocale from 'fullcalendar/locales/en-gb'
import { initCalendar } from '../lib/calendar'
import { queryPart, queryParts } from '../lib/models/events'
import { getSlotLabelTexts, getSlotLaneEls } from '../lib/models/slots'
import { waitForSettle } from '../lib/settle'
import { getScreenReaderEls } from '../lib/text'

describe('slot labels', () => {
  const options = { initialView: 'timeGridWeek', initialDate: '2014-06-04' }

  it.each([
    ['by default', {}, '12am'],
    ['for a locale', { locale: enGbLocale }, '00'],
    ['with slotHeaderFormat', {
      slotHeaderFormat: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
      locale: 'en-GB', // for 00:00 instead of 24:00
    }, '00:00:00'],
  ] as const)('are formatted %s', async (_desc, extraOptions, label) => {
    const calendar = initCalendar({ ...options, ...extraOptions })
    await waitForSettle()

    expect(getSlotLabelTexts(calendar.el)[0]).toBe(label)
  })

  it.each(['ltr', 'rtl'] as const)('sit on the start side of the grid (%s)', async (direction) => {
    const calendar = initCalendar({ ...options, direction })
    await waitForSettle()

    const pairs = [
      [queryPart(calendar.el, 'slotHeader')!, getSlotLaneEls(calendar.el)[0]],
      [queryPart(calendar.el, 'allDayHeader')!, queryParts(calendar.el, 'dayCell')[0]],
    ]

    for (const [headerEl, gridEl] of pairs) {
      const headerRect = headerEl.getBoundingClientRect()
      const gridRect = gridEl.getBoundingClientRect()

      if (direction === 'ltr') {
        expect(headerRect.right).toBeLessThanOrEqual(gridRect.left)
      } else {
        expect(headerRect.left).toBeGreaterThanOrEqual(gridRect.right)
      }
    }
  })

  it('give the timed area a row header with hidden text', async () => {
    const calendar = initCalendar(options)
    await waitForSettle()

    const rowHeaderEls = Array.from(calendar.el.querySelectorAll('[role=rowheader]'))
    const timedEls = rowHeaderEls.filter((el) => getScreenReaderEls(el).length)

    expect(timedEls.length).toBe(1)
    expect(timedEls[0].hasAttribute('aria-label')).toBe(false)
    expect(getScreenReaderEls(timedEls[0]).map((el) => el.textContent)).toEqual(['Timed'])
  })
})
