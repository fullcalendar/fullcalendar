import { describe, expect, it, vi } from 'vitest'
import { Calendar } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getActiveRange, getDayHeaderDates } from '../lib/view-dates'

/*
validRange limits the active range. Views still render their whole aligned range, with the days outside
validRange disabled.
SEE ALSO: toolbar/button-state.ts, for whether prev/next/today can leave the range
*/
describe('validRange', () => {
  // the first and last rendered days, and the dates of the days that are enabled
  function getRenderedRange(calendar: Calendar): { first: string, last: string, enabled: string[] } {
    const headerDates = getDayHeaderDates(calendar.el)
    const enabled = queryParts(calendar.el, 'dayLane')
      .filter((el) => el.getAttribute('aria-disabled') !== 'true' && el.hasAttribute('data-date'))
      .map((el) => el.getAttribute('data-date')!)
    return { first: headerDates[0], last: headerDates[headerDates.length - 1], enabled }
  }

  describe('in a week view', () => { // a view that aligns with the week
    const options = { initialView: 'timeGridWeek', initialDate: '2017-06-08' } // 2017-06-04 - 2017-06-11

    it.each([
      ['partly before validRange', { start: '2017-06-06' }, ['2017-06-04', '2017-06-10'], ['2017-06-06', '2017-06-11']],
      ['partly after validRange', { end: '2017-06-05' }, ['2017-06-04', '2017-06-10'], ['2017-06-04', '2017-06-05']],
      // moves to the earliest partly valid week. 2017-06-14 is a Wednesday
      ['entirely before validRange', { start: '2017-06-14' }, ['2017-06-11', '2017-06-17'], ['2017-06-14', '2017-06-18']],
      // moves to the latest partly valid week. 2017-05-24 is a Wednesday
      ['entirely after validRange', { end: '2017-05-24' }, ['2017-05-21', '2017-05-27'], ['2017-05-21', '2017-05-24']],
    ])('when the initial week is %s, renders the whole week but limits the active range', async (
      _desc, validRange, [expectedFirst, expectedLast], expectedActiveRange,
    ) => {
      const calendar = initCalendar({ ...options, validRange })
      await waitForSettle()

      const { first, last, enabled } = getRenderedRange(calendar)
      expect([first, last]).toEqual([expectedFirst, expectedLast])
      expect(getActiveRange(calendar)).toEqual(expectedActiveRange)
      expect(enabled[0]).toBe(expectedActiveRange[0])
      expect(enabled).toHaveLength(
        (Date.parse(expectedActiveRange[1]) - Date.parse(expectedActiveRange[0])) / 86400000,
      )
    })

    it.each([
      ['strings', { start: '2017-06-06' }],
      ['Dates', { start: new Date('2017-06-06T00:00:00Z') }],
    ])('can be a function returning a range of %s', async (_desc, range) => {
      const validRange = vi.fn(() => range)
      const calendar = initCalendar({ ...options, validRange })
      await waitForSettle()

      expect(validRange).toHaveBeenCalled()
      expect(getActiveRange(calendar)).toEqual(['2017-06-06', '2017-06-11'])
    })

    it('calls the function with the start of today', async () => {
      const validRange = vi.fn((_nowDate: Date) => ({}))
      initCalendar({ ...options, now: '2017-06-09T10:00:00', validRange })
      await waitForSettle()

      const nowDate = validRange.mock.calls[0][0]
      expect(nowDate).toBeInstanceOf(Date)
      expect(nowDate.toISOString()).toBe('2017-06-09T00:00:00.000Z')
    })
  })

  describe('in a 3-day view', () => { // a view that doesn't align
    const options = { initialView: 'timeGrid', duration: { days: 3 }, initialDate: '2017-06-08' }

    it.each([
      ['entirely before validRange, renders the first 3 valid days', { start: '2017-06-14' }, ['2017-06-14', '2017-06-16'], ['2017-06-14', '2017-06-17']],
      // the last valid day and two invalid days
      ['entirely after validRange, renders up to the last valid day', { end: '2017-05-31' }, ['2017-05-30', '2017-06-01'], ['2017-05-30', '2017-05-31']],
    ])('when the initial range is %s', async (_desc, validRange, [expectedFirst, expectedLast], expectedActiveRange) => {
      const calendar = initCalendar({ ...options, validRange })
      await waitForSettle()

      const { first, last } = getRenderedRange(calendar)
      expect([first, last]).toEqual([expectedFirst, expectedLast])
      expect(getActiveRange(calendar)).toEqual(expectedActiveRange)
    })
  })

  it('moves to the nearest range with visible days when hiddenDays empties the initial range', async () => {
    const calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2017-10-04',
      hiddenDays: [6], // Saturday. validRange starts on Saturday 2036-05-03, so that week has no visible valid day
      validRange: { start: '2036-05-03', end: '2036-06-01' },
    })
    await waitForSettle()

    expect(getDayHeaderDates(calendar.el)).toEqual([
      '2036-05-04', '2036-05-05', '2036-05-06', '2036-05-07', '2036-05-08', '2036-05-09',
    ])
    expect(getActiveRange(calendar)).toEqual(['2036-05-04', '2036-05-10'])
  })
})
