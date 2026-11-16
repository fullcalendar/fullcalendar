import { describe, expect, it, vi } from 'vitest'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { ToolbarModel } from '../lib/models/toolbar'
import { enUsSep } from '../lib/intl'
import { waitForSettle } from '../lib/settle'
import { getActiveRange, getCurrentRange } from '../lib/view-dates'

/*
Moving by the view's dateIncrement with next(), prev(), nextYear(), prevYear() and incrementDate().
The toolbar buttons that call them are in toolbar/navigation.ts.
SEE ALSO: visible-range/ for how the resulting ranges are aligned.
*/
describe('prev and next', () => {
  async function navigate(options: CalendarOptions, action: (calendar: Calendar) => void): Promise<Calendar> {
    const calendar = initCalendar(options)
    await waitForSettle()
    action(calendar)
    await waitForSettle()
    return calendar
  }

  const next = (calendar: Calendar) => calendar.next()
  const prev = (calendar: Calendar) => calendar.prev()

  describe('in a week view', () => {
    const options = { initialView: 'timeGridWeek', initialDate: '2017-06-08' } // 2017-06-04 - 2017-06-11

    it.each([
      ['next, by default a week', {}, next, ['2017-06-11', '2017-06-18']],
      ['next, with dateIncrement as an object', { dateIncrement: { weeks: 2 } }, next, ['2017-06-18', '2017-06-25']],
      ['next, with dateIncrement as a string', { dateIncrement: '14.00:00:00' }, next, ['2017-06-18', '2017-06-25']],
      ['prev, by default a week', {}, prev, ['2017-05-28', '2017-06-04']],
      ['prev, with dateIncrement', { dateIncrement: { weeks: 2 } }, prev, ['2017-05-21', '2017-05-28']],
    ])('%s', async (_desc, extraOptions, action, expectedRange) => {
      const calendar = await navigate({ ...options, ...extraOptions }, action)
      expect(getActiveRange(calendar)).toEqual(expectedRange)
    })

    it('renders the view once, for the new dates', async () => {
      const calendar = await navigate(options, next)

      expect(queryParts(calendar.el, 'view')).toHaveLength(1)
      expect(queryParts(calendar.el, 'dayHeader').map((el) => el.getAttribute('data-date'))).toEqual([
        '2017-06-11', '2017-06-12', '2017-06-13', '2017-06-14', '2017-06-15', '2017-06-16', '2017-06-17',
      ])
    })
  })

  describe('in a month view', () => {
    const options = { initialView: 'dayGridMonth', initialDate: '2017-06-08' }

    it.each([
      ['next, by default a month', {}, next, ['2017-06-25', '2017-08-06'], ['2017-07-01', '2017-08-01']],
      ['next, with dateIncrement', { dateIncrement: { months: 2 } }, next, ['2017-07-30', '2017-09-10'], ['2017-08-01', '2017-09-01']],
      ['prev, by default a month', {}, prev, ['2017-04-30', '2017-06-11'], ['2017-05-01', '2017-06-01']],
    ])('%s', async (_desc, extraOptions, action, expectedActiveRange, expectedCurrentRange) => {
      const calendar = await navigate({ ...options, ...extraOptions }, action)
      expect(getActiveRange(calendar)).toEqual(expectedActiveRange)
      expect(getCurrentRange(calendar)).toEqual(expectedCurrentRange)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4595
    it.each([
      ['prev', prev, ['2019-01-27', '2019-03-10']],
      ['next', next, ['2019-03-31', '2019-05-12']],
    ])('moves by a month with %s when the date is late in the month', async (_desc, action, expectedRange) => {
      const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2019-03-31T12:00' })
      await waitForSettle()
      expect(getActiveRange(calendar)).toEqual(['2019-02-24', '2019-04-07'])

      action(calendar)
      await waitForSettle()
      expect(getActiveRange(calendar)).toEqual(expectedRange)
    })
  })

  describe('in a custom 3-day view', () => {
    const options = { initialView: 'dayGrid', duration: { days: 3 }, initialDate: '2017-06-08' }

    it.each([
      ['by the duration by default', {}, ['2017-06-11', '2017-06-14']],
      ['by dateIncrement', { dateIncrement: { days: 2 } }, ['2017-06-10', '2017-06-13']],
      // starts at 2017-06-04, the start of the week
      ['by a week when week-aligned', { dateAlignment: 'week' }, ['2017-06-11', '2017-06-14']],
    ])('moves next %s', async (_desc, extraOptions, expectedRange) => {
      const calendar = await navigate({ ...options, ...extraOptions }, next)
      expect(getActiveRange(calendar)).toEqual(expectedRange)
    })

    it('doesn\'t move or rerender when dateIncrement is smaller than the alignment', async () => {
      const dayCellDidMount = vi.fn()
      const calendar = initCalendar({
        ...options,
        dateAlignment: 'week',
        dateIncrement: { days: 2 }, // re-aligning to the week goes back to the same range
        dayCellDidMount,
      })
      await waitForSettle()
      expect(dayCellDidMount).toHaveBeenCalledTimes(3) // the anchor: cells do mount

      dayCellDidMount.mockClear()
      calendar.next()
      await waitForSettle()

      expect(getActiveRange(calendar)).toEqual(['2017-06-04', '2017-06-07'])
      expect(dayCellDidMount).not.toHaveBeenCalled()
    })
  })

  it('skips the weekend in a 2-day view with weekends: false', async () => {
    const calendar = await navigate({
      initialView: 'timeGrid',
      duration: { days: 2 },
      weekends: false,
      initialDate: '2017-11-09', // Thursday
    }, next)

    expect(getActiveRange(calendar)).toEqual(['2017-11-13', '2017-11-15'])
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5319
  it('moves back by dateIncrement repeatedly when the duration is longer', async () => {
    const calendar = initCalendar({
      firstDay: 1, // Monday
      initialDate: '2021-06-14',
      initialView: 'dayGridFourWeeks',
      views: {
        dayGridFourWeeks: {
          type: 'dayGrid',
          duration: { weeks: 4 },
          dateIncrement: { weeks: 1 },
        },
      },
    })
    await waitForSettle()
    expect(getActiveRange(calendar)).toEqual(['2021-06-14', '2021-07-12'])

    calendar.prev()
    await waitForSettle()
    expect(getActiveRange(calendar)).toEqual(['2021-06-07', '2021-07-05'])

    calendar.prev()
    await waitForSettle()
    expect(getActiveRange(calendar)).toEqual(['2021-05-31', '2021-06-28'])
  })
})

describe('prevYear and nextYear', () => {
  it.each([
    ['dayGridMonth', 'prevYear', ['2013-05-26', '2013-07-07'], 'June 2013'],
    ['dayGridMonth', 'nextYear', ['2015-05-31', '2015-07-12'], 'June 2015'],
    ['dayGridWeek', 'prevYear', ['2013-05-26', '2013-06-02'], `May${enUsSep}Jun 2013`],
    ['timeGridWeek', 'nextYear', ['2015-05-31', '2015-06-07'], `May${enUsSep}Jun 2015`],
    ['dayGridDay', 'prevYear', ['2013-06-01', '2013-06-02'], 'June 1, 2013'],
    ['timeGridDay', 'nextYear', ['2015-06-01', '2015-06-02'], 'June 1, 2015'],
  ] as const)('in %s, %s moves by a year', async (initialView, method, expectedRange, expectedTitle) => {
    const calendar = initCalendar({ initialView, initialDate: '2014-06-01' })
    await waitForSettle()

    calendar[method]()
    await waitForSettle()

    expect(getActiveRange(calendar)).toEqual(expectedRange)
    expect(ToolbarModel.header(calendar.el)!.getTitleText()).toBe(expectedTitle)
  })
})

describe('incrementDate', () => {
  it.each([
    ['dayGridMonth', { months: -1 }, ['2014-04-27', '2014-06-08'], 'May 2014'],
    ['timeGridWeek', { weeks: -2 }, ['2014-05-18', '2014-05-25'], 'May 2014'],
    ['dayGridDay', { days: 2 }, ['2014-06-03', '2014-06-04'], 'June 3, 2014'],
    ['timeGridDay', '2.00:00:00', ['2014-06-03', '2014-06-04'], 'June 3, 2014'],
    ['timeGridDay', '2.05:30:00', ['2014-06-03', '2014-06-04'], 'June 3, 2014'], // the time doesn't move the range
  ])('in %s, moves by %j', async (initialView, delta, expectedRange, expectedTitle) => {
    const calendar = initCalendar({ initialView, initialDate: '2014-06-01' })
    await waitForSettle()

    calendar.incrementDate(delta)
    await waitForSettle()

    expect(getActiveRange(calendar)).toEqual(expectedRange)
    expect(ToolbarModel.header(calendar.el)!.getTitleText()).toBe(expectedTitle)
  })
})
