import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

describe('fixedWeekCount', () => {
  it.each([
    [true, 'a 5-week month', '2014-07-01', 6],
    [false, 'a 5-week month', '2014-07-01', 5],
    [true, 'a 6-week month', '2014-08-01', 6],
    [false, 'a 6-week month', '2014-08-01', 6],
  ])('when %s, renders %s (%s) with %s rows', async (fixedWeekCount, _desc, initialDate, expectedRowCount) => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate, fixedWeekCount })
    await waitForSettle()

    expect(queryParts(calendar.el, 'dayRow')).toHaveLength(expectedRowCount)
  })
})
