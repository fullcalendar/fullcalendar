import { describe, expect, it } from 'vitest'
import esLocale from 'fullcalendar/locales/es'
import { initCalendar } from '../lib/calendar'
import { queryPart, queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { expectScreenReaderText, getScreenReaderEls, getVisibleText } from '../lib/text'

describe('week numbers in timeGrid', () => {
  const options = { initialView: 'timeGridWeek', initialDate: '2014-05-01' }

  it.each([
    [{}, []], // the default: false
    [{ weekNumbers: false }, []],
    [{ weekNumbers: true }, ['W 18']],
  ])('with %j, labels the header corner %j', async (extraOptions, texts) => {
    const calendar = initCalendar({ ...options, ...extraOptions })
    await waitForSettle()

    expect(queryParts(calendar.el, 'dayHeader').length).toBe(7)
    expect(queryParts(calendar.el, 'weekNumberHeader').map(getVisibleText)).toEqual(texts)
  })

  it.each([
    ['by default', {}, 'W 18'],
    ['for a locale', { locale: esLocale }, 'Sm 18'],
    ['with weekTextShort', { weekTextShort: 'YO' }, 'YO 18'],
    ['with weekTextShort in RTL', { weekTextShort: 'YO', direction: 'rtl' }, 'YO 18'],
  ] as const)('are prefixed %s', async (_desc, extraOptions, text) => {
    const calendar = initCalendar({ ...options, weekNumbers: true, ...extraOptions })
    await waitForSettle()

    expect(getVisibleText(queryPart(calendar.el, 'weekNumberHeader')!)).toBe(text)
  })

  it('read hidden text in the header', async () => {
    const calendar = initCalendar({ ...options, weekNumbers: true })
    await waitForSettle()

    expectScreenReaderText(queryPart(calendar.el, 'weekNumberHeader')!, 'Week 18')
  })

  it('rely on the nav link instead of hidden text when navLinks is enabled', async () => {
    const calendar = initCalendar({ ...options, initialView: 'timeGridDay', weekNumbers: true, navLinks: true })
    await waitForSettle()

    const headerEl = queryPart(calendar.el, 'weekNumberHeader')!
    expect(getScreenReaderEls(headerEl)).toEqual([])
    expect(headerEl.hasAttribute('aria-label')).toBe(false)
    expect(queryPart(headerEl, 'navLink')!.getAttribute('aria-label')).toBe('Week 18') // no verb
  })
})
