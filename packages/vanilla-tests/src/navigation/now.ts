import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { waitForSettle } from '../lib/settle'
import { getTodayDates } from '../lib/view-dates'

describe('now', () => {
  it.each([
    ['dayGridMonth', 'a date string', '2014-05-06'],
    ['timeGridWeek', 'a date-time string', '2014-04-29T12:00:00'],
    ['dayGridMonth', 'a function returning a Date', () => new Date('2014-05-01T00:00:00Z')],
    ['dayGridMonth', 'a function returning a string', () => '2014-05-08'],
  ])('in %s, marks today given %s', async (initialView, _desc, now) => {
    const calendar = initCalendar({ initialView, initialDate: '2014-05-01', now })
    await waitForSettle()

    const nowStr = typeof now === 'function' ? now() : now
    const expectedDate = (typeof nowStr === 'string' ? nowStr : nowStr.toISOString()).slice(0, 10)
    expect(new Set(getTodayDates(calendar.el))).toEqual(new Set([expectedDate]))
  })

  it('decides where the today button goes', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2014-05-01', now: '2014-08-10' })
    await waitForSettle()
    expect(getTodayDates(calendar.el)).toEqual([])

    calendar.today()
    await waitForSettle()

    expect(calendar.view.currentStart.toISOString()).toBe('2014-08-01T00:00:00.000Z')
    expect(getTodayDates(calendar.el)).toEqual(['2014-08-10'])
  })
})
