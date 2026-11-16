import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getVisibleText } from '../lib/text'

describe('day headers', () => {
  it.each([
    ['dayGridMonth', true, 7],
    ['dayGridMonth', false, 0],
    ['dayGridDay', true, 1],
    ['dayGridDay', false, 0],
    ['timeGridDay', true, 1],
    ['timeGridDay', false, 0],
  ])('in %s with dayHeaders:%s, renders %i headers', async (initialView, dayHeaders, count) => {
    const calendar = initCalendar({ initialView, initialDate: '2014-05-11', dayHeaders })
    await waitForSettle()

    expect(queryParts(calendar.el, 'dayHeader').length).toBe(count)
  })

  it('orders a week\'s days from Sunday to Saturday', async () => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', initialDate: '2014-05-13' })
    await waitForSettle()

    const headerEls = queryParts(calendar.el, 'dayHeader')
    expect(headerEls.map((el) => el.getAttribute('data-date'))).toEqual([
      '2014-05-11', '2014-05-12', '2014-05-13', '2014-05-14', '2014-05-15', '2014-05-16', '2014-05-17',
    ])
    expect(headerEls.map(getVisibleText)).toEqual([
      'Sun 11', 'Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16', 'Sat 17',
    ])
  })

  it('marks only today\'s header as the current date', async () => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', now: '2018-05-28' }) // a Monday
    await waitForSettle()

    const currentEls = queryParts(calendar.el, 'dayHeader').filter((el) => el.getAttribute('aria-current') === 'date')
    expect(currentEls.map((el) => el.getAttribute('data-date'))).toEqual(['2018-05-28'])
  })
})
