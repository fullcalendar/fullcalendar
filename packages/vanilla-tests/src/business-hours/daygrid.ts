import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

function getNonBusinessDates(root: HTMLElement): string[] {
  return queryParts(root, 'dayCell')
    .filter((el) => queryParts(el, 'nonBusinessHours').length)
    .map((el) => el.getAttribute('data-date')!)
}

describe('businessHours in dayGrid', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-11-25',
  }
  const weekendDates = [
    '2014-10-26', '2014-11-01', '2014-11-02', '2014-11-08', '2014-11-09', '2014-11-15',
    '2014-11-16', '2014-11-22', '2014-11-23', '2014-11-29', '2014-11-30', '2014-12-06',
  ]

  it.each([
    [false, true],
    [true, false],
  ])('can be changed dynamically from %s to %s', async (initial, changed) => {
    const calendar = initCalendar({ ...options, businessHours: initial })
    await waitForSettle()
    expect(getNonBusinessDates(calendar.el)).toEqual(initial ? weekendDates : [])

    calendar.setOption('businessHours', changed)
    await waitForSettle()

    expect(getNonBusinessDates(calendar.el)).toEqual(changed ? weekendDates : [])
  })

  // KNOWN BUG (`it.fails` until fixed): a range crossing a week boundary leaves the Sunday unshaded.
  // dayGridWeek (Sun..Sat) shades both weekend days.
  it.fails('shades both days of a weekend that crosses a week boundary', async () => {
    const calendar = initCalendar({
      initialView: 'dayGridTwoDay',
      initialDate: '2015-11-21', // a Saturday
      businessHours: true,
      views: { dayGridTwoDay: { type: 'dayGrid', duration: { days: 2 } } },
    })
    await waitForSettle()

    expect(getNonBusinessDates(calendar.el)).toEqual(['2015-11-21', '2015-11-22'])
  })
})
