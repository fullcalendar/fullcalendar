import { describe, expect, it } from 'vitest'
import arLocale from 'fullcalendar/locales/ar'
import { initCalendar } from '../lib/calendar'
import { waitForSettle } from '../lib/settle'

describe('direction', () => {
  it.each([
    ['en', undefined, 'ltr', null],
    ['ar', arLocale, 'rtl', 'rtl'],
  ])('defaults to the %s locale\'s direction', async (_code, locale, expected, expectedDirAttr) => {
    const calendar = initCalendar({ locale })
    await waitForSettle()

    expect(calendar.getOption('direction')).toBe(expected)
    expect(calendar.el.getAttribute('dir')).toBe(expectedDirAttr)
  })

  it('can be set dynamically', async () => {
    const calendar = initCalendar({ direction: 'ltr' })
    await waitForSettle()
    expect(calendar.el.getAttribute('dir')).toBe(null) // ltr is the document default, so no attribute

    calendar.setOption('direction', 'rtl')
    await waitForSettle()
    expect(calendar.el.getAttribute('dir')).toBe('rtl')
  })
})
