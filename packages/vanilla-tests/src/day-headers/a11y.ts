import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryPart, queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { expectScreenReaderText, getScreenReaderEls } from '../lib/text'

describe('day header a11y text', () => {
  const initialDate = '2020-09-07' // a Monday

  it('reads the full date for timeGrid date headers', async () => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', initialDate })
    await waitForSettle()

    const headerEl = queryParts(calendar.el, 'dayHeader').find((el) => el.getAttribute('data-date') === '2020-09-07')!
    expectScreenReaderText(headerEl, 'September 7, 2020')
  })

  it('reads the full weekday for dayGridMonth day-of-week headers', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate })
    await waitForSettle()

    expectScreenReaderText(queryParts(calendar.el, 'dayHeader')[1], 'Monday')
  })

  it('relies on the nav link instead of hidden text when navLinks is enabled', async () => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', initialDate, navLinks: true })
    await waitForSettle()

    const headerEl = queryParts(calendar.el, 'dayHeader').find((el) => el.getAttribute('data-date') === '2020-09-07')!
    expect(getScreenReaderEls(headerEl)).toEqual([])
    expect(headerEl.hasAttribute('aria-label')).toBe(false)
    expect(queryPart(headerEl, 'navLink')!.getAttribute('aria-label')).toBe('September 7, 2020') // no verb
  })
})
