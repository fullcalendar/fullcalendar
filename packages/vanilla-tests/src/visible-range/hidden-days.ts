import { describe, expect, it } from 'vitest'
import { CalendarOptions } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getActiveRange, getCurrentRange, getDayCellDates } from '../lib/view-dates'

// the day-of-week header texts of a month view
async function getDowTexts(options: CalendarOptions): Promise<string[]> {
  const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2014-06-01', ...options })
  await waitForSettle()
  return queryParts(calendar.el, 'dayHeaderInner').map((el) => el.textContent!)
}

describe('hiddenDays', () => {
  it.each([
    ['default', {}, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']],
    ['empty', { hiddenDays: [] }, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']],
    ['[1]', { hiddenDays: [1] }, ['Sun', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']],
    ['[3, 5]', { hiddenDays: [3, 5] }, ['Sun', 'Mon', 'Tue', 'Thu', 'Sat']],
  ])('when %s, shows the other days', async (_desc, options, expectedTexts) => {
    expect(await getDowTexts(options)).toEqual(expectedTexts)
  })

  it('throws when every day is hidden', () => {
    expect(() => {
      initCalendar({ hiddenDays: [0, 1, 2, 3, 4, 5, 6] })
    }).toThrow(new Error('invalid hiddenDays'))
  })
})

describe('weekends', () => {
  it.each([
    [true, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']],
    [false, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']],
  ])('when %s, shows the right days', async (weekends, expectedTexts) => {
    expect(await getDowTexts({ weekends })).toEqual(expectedTexts)
  })
})

describe('when the current date is a hidden day', () => {
  describe('in month view', () => {
    it.each([
      // the month starts on a hidden day
      ['2014-06-01', ['2014-06-02', '2014-07-12'], ['2014-06-01', '2014-07-01']],
      // the view starts in the previous month
      ['2014-05-04', ['2014-04-28', '2014-06-07'], ['2014-05-01', '2014-06-01']],
    ])('shows the month of %s', async (date, expectedActiveRange, expectedCurrentRange) => {
      const calendar = initCalendar({ initialView: 'dayGridMonth', now: date, initialDate: date, weekends: false })
      await waitForSettle()

      expect(getActiveRange(calendar)).toEqual(expectedActiveRange)
      expect(getCurrentRange(calendar)).toEqual(expectedCurrentRange)
    })

    it('doesn\'t skip a month when navigating back to a month that starts on a hidden day', async () => {
      const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2014-07-07', weekends: false })
      await waitForSettle()
      expect(getCurrentRange(calendar)).toEqual(['2014-07-01', '2014-08-01'])

      calendar.prev() // to 2014-06-01, a Sunday
      await waitForSettle()

      expect(getCurrentRange(calendar)).toEqual(['2014-06-01', '2014-07-01'])
    })
  })

  it('in day view, shows the next visible day', async () => {
    const calendar = initCalendar({
      initialView: 'dayGridDay',
      now: '2014-06-01', // a Sunday
      initialDate: '2014-06-01',
      weekends: false,
    })
    await waitForSettle()

    expect(getActiveRange(calendar)).toEqual(['2014-06-02', '2014-06-03'])
    expect(getCurrentRange(calendar)).toEqual(['2014-06-02', '2014-06-03'])
    expect(getDayCellDates(calendar.el)).toEqual(['2014-06-02'])
  })
})
