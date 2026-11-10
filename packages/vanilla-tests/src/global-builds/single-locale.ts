import { beforeAll, describe, expect, it } from 'vitest'
import { appendTestElement } from '../lib/calendar'
import { getGlobalFullCalendar, loadScript } from '../lib/global-build'

describe('global build with a single locale', () => {
  beforeAll(async () => {
    await loadScript(new URL('../../node_modules/fullcalendar/all/global.js', import.meta.url))
    await loadScript(new URL('../../node_modules/fullcalendar/locales/ar/global.js', import.meta.url))
  })

  it('registers only that locale, besides the built-in en', () => {
    const FullCalendar = getGlobalFullCalendar()
    const calendar = new FullCalendar.Calendar(document.createElement('div'))

    expect(calendar.getAvailableLocaleCodes()).toEqual(['en', 'ar'])
  })

  it('renders with the locale', async () => {
    const FullCalendar = getGlobalFullCalendar()
    const el = appendTestElement(document.createElement('div'))
    const calendar = new FullCalendar.Calendar(el, { locale: 'ar', initialDate: '2014-05-01' })
    calendar.render()

    // the global build has its own settle tracker, which waitForSettle() can't see
    await expect.poll(() => el.textContent).toContain('مايو') // May
    expect(el.getAttribute('dir')).toBe('rtl')
    calendar.destroy()
  })
})
