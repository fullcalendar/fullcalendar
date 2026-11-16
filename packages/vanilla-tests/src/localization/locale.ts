import { describe, expect, it } from 'vitest'
import esLocale from 'fullcalendar/locales/es'
import frLocale from 'fullcalendar/locales/fr'
import arLocale from 'fullcalendar/locales/ar'
import { initCalendar } from '../lib/calendar'
import { getLeafTexts } from '../lib/intl'
import { getEventEls, queryPart, queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

describe('locale', () => {
  const locales = [esLocale, frLocale, arLocale]

  it('falls back to Intl formatting when the locale has no FullCalendar settings', async () => {
    const calendar = initCalendar({
      locales,
      locale: 'en-asdf',
      initialView: 'timeGridWeek',
      initialDate: '2014-12-25',
      events: [{ id: '1', title: 'Christmas', start: '2014-12-25T10:00:00' }],
    })
    await waitForSettle()

    expect(queryParts(calendar.el, 'dayHeaderInner')[0].textContent).toMatch(/^Sun\.? 21$/)
    expect(getLeafTexts(getEventEls(calendar.el, '1')[0])).toEqual(['10:00', 'Christmas'])
  })

  it('can be set dynamically', async () => {
    const calendar = initCalendar({
      locales,
      locale: 'es',
      initialDate: '2016-07-10',
      initialView: 'dayGridMonth',
    })
    await waitForSettle()

    const getTitle = () => queryPart(calendar.el, 'toolbarTitle')!.textContent
    expect(getTitle()).toBe('julio de 2016')
    expect(calendar.getOption('direction')).toBe('ltr')

    calendar.setOption('locale', 'fr')
    await waitForSettle()
    expect(getTitle()).toBe('juillet 2016')

    calendar.setOption('locale', 'ar')
    await waitForSettle()
    expect(calendar.getOption('direction')).toBe('rtl')
    expect(calendar.el.getAttribute('dir')).toBe('rtl')
  })
})
