import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getActiveRange, getDayCellDates } from '../lib/view-dates'

describe('duration', () => {
  it.each([
    ['1 week, which aligns with the week', { weeks: 1 }, ['2017-03-12', '2017-03-19']],
    ['7 days, which starts on the date', { days: 7 }, ['2017-03-15', '2017-03-22']],
  ])('given %s', async (_desc, duration, expectedRange) => {
    const calendar = initCalendar({ initialView: 'timeGrid', initialDate: '2017-03-15', duration })
    await waitForSettle()

    expect(getActiveRange(calendar)).toEqual(expectedRange)
  })

  describe('of a custom dayGrid view', () => {
    it.each([
      // starts on the date
      ['4 days', { days: 4 }, { initialDate: '2014-12-25' }, 1, '2014-12-25', '2014-12-28'],
      // starts on the week's start, which is a Tuesday
      ['2 weeks', { weeks: 2 }, { initialDate: '2014-12-25', firstDay: 2 }, 2, '2014-12-23', '2015-01-05'],
      ['2 months', { months: 2 }, { initialDate: '2014-11-27' }, 10, '2014-10-26', '2015-01-03'],
      ['1 year', { years: 1 }, { initialDate: '2014-11-27' }, 53, '2013-12-29', '2015-01-03'],
    ])('renders %s', async (_desc, duration, extraOptions, rowCount, firstDate, lastDate) => {
      const calendar = initCalendar({
        views: {
          custom: { type: 'dayGrid', duration },
        },
        initialView: 'custom',
        ...extraOptions,
      })
      await waitForSettle()

      const rowEls = queryParts(calendar.el, 'dayRow')
      const dates = getDayCellDates(calendar.el)
      expect(rowEls).toHaveLength(rowCount)
      expect(dates).toHaveLength(rowCount === 1 ? 4 : rowCount * 7)
      expect(dates[0]).toBe(firstDate)
      expect(dates[dates.length - 1]).toBe(lastDate)
    })
  })

  describe('of a custom timeGrid view', () => {
    it.each([
      // starts on the date
      ['4 days', { days: 4 }, '2014-12-25', 4, '2014-12-25', '2014-12-28'],
      // starts on the week's start
      ['2 weeks', { weeks: 2 }, '2014-12-25', 14, '2014-12-21', '2015-01-03'],
      ['2 months', { months: 2 }, '2014-11-27', 61, '2014-11-01', '2014-12-31'],
    ])('renders %s in one row', async (_desc, duration, initialDate, dayCount, firstDate, lastDate) => {
      const calendar = initCalendar({
        views: {
          custom: { type: 'timeGrid', duration },
        },
        initialView: 'custom',
        initialDate,
      })
      await waitForSettle()

      const laneDates = queryParts(calendar.el, 'dayLane').map((el) => el.getAttribute('data-date'))
      expect(laneDates).toHaveLength(dayCount)
      expect(laneDates[0]).toBe(firstDate)
      expect(laneDates[dayCount - 1]).toBe(lastDate)

      expect(queryParts(calendar.el, 'dayRow')).toHaveLength(1) // the all-day row
      expect(getDayCellDates(calendar.el)).toEqual(laneDates)
    })
  })
})
