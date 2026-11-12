import { describe, expect, it } from 'vitest'
import enGbLocale from 'fullcalendar/locales/en-gb'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

describe('firstDay', () => {
  const DOW_TEXTS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function rotateDows(firstDay: number): string[] {
    return [...DOW_TEXTS.slice(firstDay), ...DOW_TEXTS.slice(0, firstDay)]
  }

  it.each([
    ['default', {}, 0],
    ['0', { firstDay: 0 }, 0],
    ['1', { firstDay: 1 }, 1],
    ['3', { firstDay: 3 }, 3],
    ['ISO week numbering', { weekNumberCalculation: 'ISO' as const }, 1],
    ['2, with ISO week numbering', { firstDay: 2, weekNumberCalculation: 'ISO' as const }, 2],
    ['the en-gb locale\'s default', { locale: enGbLocale }, 1],
  ])('when %s, starts the week on day %s', async (_desc, options, expectedFirstDay) => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2014-06-01', ...options })
    await waitForSettle()

    expect(queryParts(calendar.el, 'dayHeaderInner').map((el) => el.textContent)).toEqual(rotateDows(expectedFirstDay))
  })

  it('in RTL, starts the week on the right', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2014-06-01', firstDay: 2, direction: 'rtl' })
    await waitForSettle()

    const headerEls = queryParts(calendar.el, 'dayHeaderInner')
    const textsRightToLeft = headerEls
      .sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left)
      .map((el) => el.textContent)
    expect(textsRightToLeft).toEqual(rotateDows(2))
  })
})
