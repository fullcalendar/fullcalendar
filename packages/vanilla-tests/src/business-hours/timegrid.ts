import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { getCoveredDates } from '../lib/models/event-content'
import { queryParts } from '../lib/models/events'
import { getSlotLaneEls, getSlotTop } from '../lib/models/slots'
import { TimeGridModel } from '../lib/models/time-grid'
import { waitForSettle } from '../lib/settle'

type TimeRange = [string, string] // `HH:mm` start and end, where the end can be 24:00

/*
Throws unless the day's lane has non-business fills covering exactly the time ranges.
*/
function expectNonBusinessHours(root: HTMLElement, date: string, ranges: TimeRange[]): void {
  const laneEl = new TimeGridModel(root).getDayLane(date)
  const slotEls = getSlotLaneEls(root)
  const dayEndY = slotEls[slotEls.length - 1].getBoundingClientRect().bottom
  const getY = (time: string) => (time === '24:00' ? dayEndY : getSlotTop(root, time + ':00'))

  const actual = queryParts(laneEl, 'nonBusinessHours')
    .map((el) => el.getBoundingClientRect())
    .sort((a, b) => a.top - b.top)

  expect(actual.length, `fills on ${date}`).toBe(ranges.length)
  ranges.forEach(([start, end], i) => {
    expect(Math.abs(actual[i].top - getY(start)), `top of fill ${i} on ${date}`).toBeLessThan(2)
    expect(Math.abs(actual[i].bottom - getY(end)), `bottom of fill ${i} on ${date}`).toBeLessThan(2)
  })
}

/*
The dates of the all-day cells that have a non-business fill.
*/
function getAllDayFillDates(root: HTMLElement): string[] {
  return queryParts(root, 'dayCell')
    .filter((el) => queryParts(el, 'nonBusinessHours').length)
    .map((el) => el.getAttribute('data-date')!)
}

const WHOLE_DAY: TimeRange[] = [['00:00', '24:00']]

describe('businessHours in timeGrid', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-12-07',
    scrollTime: '00:00',
  }

  it('fills the time outside the default business hours', async () => {
    const calendar = initCalendar({ ...options, businessHours: true })
    await waitForSettle()

    const weekdayRanges: TimeRange[] = [['00:00', '09:00'], ['17:00', '24:00']]
    expectNonBusinessHours(calendar.el, '2014-12-07', WHOLE_DAY)
    for (const date of ['2014-12-08', '2014-12-09', '2014-12-10', '2014-12-11', '2014-12-12']) {
      expectNonBusinessHours(calendar.el, date, weekdayRanges)
    }
    expectNonBusinessHours(calendar.el, '2014-12-13', WHOLE_DAY)

    expect(getAllDayFillDates(calendar.el)).toEqual(['2014-12-07', '2014-12-13']) // the weekend
  })

  it('renders correctly after starting out in a larger month range', async () => {
    const calendar = initCalendar({
      ...options,
      initialView: 'dayGridMonth',
      initialDate: '2014-11-25',
      businessHours: true,
    })
    await waitForSettle()

    calendar.changeView('timeGridWeek')
    calendar.next() // move out of the original month range...
    calendar.next() // ...and further out
    await waitForSettle()

    expect(calendar.view.currentStart).toEqual(new Date('2014-12-07T00:00:00Z'))
    expectNonBusinessHours(calendar.el, '2014-12-07', WHOLE_DAY)
    expectNonBusinessHours(calendar.el, '2014-12-08', [['00:00', '09:00'], ['17:00', '24:00']])
    expectNonBusinessHours(calendar.el, '2014-12-13', WHOLE_DAY)
    expect(getAllDayFillDates(calendar.el)).toEqual(['2014-12-07', '2014-12-13'])
  })

  it.each<{ direction: 'ltr' | 'rtl' }>([
    { direction: 'ltr' },
    { direction: 'rtl' },
  ])('fills around custom hours, joining consecutive all-day days ($direction)', async ({ direction }) => {
    const calendar = initCalendar({
      ...options,
      direction,
      businessHours: { startTime: '02:00', endTime: '06:00', daysOfWeek: [1, 2, 3, 4] }, // Mon-Thu
    })
    await waitForSettle()

    expectNonBusinessHours(calendar.el, '2014-12-07', WHOLE_DAY)
    for (const date of ['2014-12-08', '2014-12-09', '2014-12-10', '2014-12-11']) {
      expectNonBusinessHours(calendar.el, date, [['00:00', '02:00'], ['06:00', '24:00']])
    }
    expectNonBusinessHours(calendar.el, '2014-12-12', WHOLE_DAY)
    expectNonBusinessHours(calendar.el, '2014-12-13', WHOLE_DAY)

    // each stretch of whole days is one all-day element
    const allDayFillEls = queryParts(calendar.el, 'nonBusinessHours').filter((el) => el.closest('.test-part-dayCell'))
    expect(allDayFillEls.map(getCoveredDates)).toEqual([['2014-12-07'], ['2014-12-12', '2014-12-13']])
  })

  it('renders several day-of-week groups', async () => {
    const calendar = initCalendar({
      ...options,
      businessHours: [
        { daysOfWeek: [1, 2, 3], startTime: '08:00', endTime: '18:00' },
        { daysOfWeek: [4, 5], startTime: '10:00', endTime: '16:00' },
      ],
    })
    await waitForSettle()

    expectNonBusinessHours(calendar.el, '2014-12-07', WHOLE_DAY)
    for (const date of ['2014-12-08', '2014-12-09', '2014-12-10']) {
      expectNonBusinessHours(calendar.el, date, [['00:00', '08:00'], ['18:00', '24:00']])
    }
    for (const date of ['2014-12-11', '2014-12-12']) {
      expectNonBusinessHours(calendar.el, date, [['00:00', '10:00'], ['16:00', '24:00']])
    }
    expectNonBusinessHours(calendar.el, '2014-12-13', WHOLE_DAY)
  })

  it('ignores definitions without daysOfWeek', async () => {
    const calendar = initCalendar({
      ...options,
      businessHours: [
        { startTime: '08:00', endTime: '18:00' }, // invalid
        { daysOfWeek: [4, 5], startTime: '10:00', endTime: '16:00' },
      ],
    })
    await waitForSettle()

    for (const date of ['2014-12-07', '2014-12-08', '2014-12-09', '2014-12-10', '2014-12-13']) {
      expectNonBusinessHours(calendar.el, date, WHOLE_DAY)
    }
    for (const date of ['2014-12-11', '2014-12-12']) {
      expectNonBusinessHours(calendar.el, date, [['00:00', '10:00'], ['16:00', '24:00']])
    }
  })

  it('fills the whole of a day view with no business hours', async () => {
    const calendar = initCalendar({
      ...options,
      initialView: 'timeGridDay',
      initialDate: '2016-07-23', // a Saturday
      businessHours: true,
    })
    await waitForSettle()

    expectNonBusinessHours(calendar.el, '2016-07-23', WHOLE_DAY)
  })

  it.each([
    [false, true],
    [true, false],
  ])('can be changed dynamically from %s to %s', async (initial, changed) => {
    const calendar = initCalendar({ ...options, businessHours: initial })
    await waitForSettle()
    expect(queryParts(calendar.el, 'nonBusinessHours').length > 0).toBe(initial)

    calendar.setOption('businessHours', changed)
    await waitForSettle()

    expect(queryParts(calendar.el, 'nonBusinessHours').length > 0).toBe(changed)
  })
})
