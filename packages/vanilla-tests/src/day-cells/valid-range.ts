import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { waitForSettle } from '../lib/settle'
import { getDatedDays, getDayRange } from '../lib/dated-days'

describe('validRange rendering', () => {
  it.each([
    ['dayGridMonth', '2017-06-01', { start: '2017-06-07' }, '2017-06-07', '2017-07-09'],
    ['timeGridWeek', '2017-06-08', { start: '2017-06-06' }, '2017-06-06', '2017-06-11'],
    ['dayGridMonth', '2017-06-01', { end: '2017-06-07' }, '2017-05-28', '2017-06-07'],
    ['timeGridWeek', '2017-06-08', { end: '2017-06-06' }, '2017-06-04', '2017-06-06'],
  ])('in %s on %s, with validRange %j, renders only the valid days', async (
    initialView,
    initialDate,
    validRange,
    start,
    end,
  ) => {
    const calendar = initCalendar({ initialView, initialDate, validRange })
    await waitForSettle()

    expect(getDatedDays(calendar.el)).toEqual(getDayRange(start, end))
  })
})
