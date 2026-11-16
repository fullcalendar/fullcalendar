import { beforeAll, describe, expect, it } from 'vitest'
import { appendTestElement } from '../lib/calendar'
import { getGlobalFullCalendar, loadScript } from '../lib/global-build'

describe('global build with all locales', () => {
  beforeAll(async () => {
    await loadScript(new URL('../../node_modules/fullcalendar/all/global.js', import.meta.url))
    await loadScript(new URL('../../node_modules/fullcalendar/locales-all/global.js', import.meta.url))
  })

  it('registers every locale', () => {
    const FullCalendar = getGlobalFullCalendar()
    const calendar = new FullCalendar.Calendar(document.createElement('div'))
    const localeCodes = calendar.getAvailableLocaleCodes()

    expect(localeCodes).toContain('es')
    expect(localeCodes).toContain('fr')
    expect(localeCodes.length).toBeGreaterThan(50)
  })

  it('renders with a locale', async () => {
    const FullCalendar = getGlobalFullCalendar()
    const el = appendTestElement(document.createElement('div'))
    const calendar = new FullCalendar.Calendar(el, { locale: 'es', initialDate: '2014-05-01' })
    calendar.render()

    // the global build has its own settle tracker, which waitForSettle() can't see
    await expect.poll(() => el.textContent).toContain('mayo')
    calendar.destroy()
  })
})
