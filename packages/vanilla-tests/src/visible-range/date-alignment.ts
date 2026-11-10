import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { waitForSettle } from '../lib/settle'
import { getActiveRange } from '../lib/view-dates'

/*
SEE ALSO: navigation/prev-next.ts, for dateAlignment and dateIncrement when navigating
*/
describe('dateAlignment', () => {
  it.each([
    ['a 3-day duration', { duration: { days: 3 } }, ['2017-06-11', '2017-06-14']],
    // the first visible day of the week is Monday
    ['a 5-day count without weekends', { dayCount: 5, weekends: false }, ['2017-06-12', '2017-06-17']],
  ])('of a week aligns %s with the week', async (_desc, extraOptions, expectedRange) => {
    const calendar = initCalendar({
      initialView: 'timeGrid',
      dateAlignment: 'week',
      initialDate: '2017-06-15',
      ...extraOptions,
    })
    await waitForSettle()

    expect(getActiveRange(calendar)).toEqual(expectedRange)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4363
  it('of a year aligns with the start of the year', async () => {
    const calendar = initCalendar({
      initialView: 'dayGrid',
      duration: { months: 1 },
      dateAlignment: 'year',
      initialDate: '2017-06-15',
    })
    await waitForSettle()

    expect(getActiveRange(calendar)).toEqual(['2017-01-01', '2017-02-05'])
  })
})
