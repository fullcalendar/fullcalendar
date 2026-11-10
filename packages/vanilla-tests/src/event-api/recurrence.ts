import { describe, expect, it } from 'vitest'
import { Calendar } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
Simple recurring events (daysOfWeek, startTime/endTime, startRecur/endRecur, duration), expanded over
the visible range.
*/
describe('recurring events', () => {
  function getDates(calendar: Calendar): [string, string | null][] {
    return calendar.getEvents().map((event) => [event.startStr, event.end ? event.endStr : null])
  }

  it('expands timed events in the local time zone', async () => {
    const calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2017-07-03',
      timeZone: 'local',
      events: [{ startTime: '09:00', endTime: '11:00', daysOfWeek: [2, 4] }],
    })
    await waitForSettle()

    expect(getDates(calendar)).toEqual([
      ['2017-07-04T09:00:00-04:00', '2017-07-04T11:00:00-04:00'],
      ['2017-07-06T09:00:00-04:00', '2017-07-06T11:00:00-04:00'],
    ])
    expect(calendar.getEvents()[0].start!.getHours()).toBe(9)
    expect(getEventEls(calendar.el)).toHaveLength(2)
  })

  it.each([
    ['overlapping the recur range', '2017-07-03', ['2017-07-05T09:00:00Z', '2017-07-06T09:00:00Z', '2017-07-07T09:00:00Z']],
    ['outside the recur range', '2017-02-02', []],
  ])('expands within startRecur and endRecur, when the view is %s', async (_desc, initialDate, expectedStarts) => {
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate,
      events: [{ startTime: '09:00', endTime: '11:00', startRecur: '2017-07-05', endRecur: '2017-07-08' }],
    })
    await waitForSettle()

    expect(calendar.getEvents().map((event) => event.startStr)).toEqual(expectedStarts)
    expect(getEventEls(calendar.el)).toHaveLength(expectedStarts.length)
  })

  it('expands an occurrence that starts before the view but extends into it, given a duration', async () => {
    const calendar = initCalendar({
      initialView: 'dayGridWeek',
      initialDate: '2019-06-02', // the week of Jun 2 - Jun 8
      events: [{ daysOfWeek: [6], duration: { days: 2 } }],
    })
    await waitForSettle()

    expect(getDates(calendar)).toEqual([
      ['2019-06-01', '2019-06-03'],
      ['2019-06-08', '2019-06-10'],
    ])
    expect(getEventEls(calendar.el)).toHaveLength(2)
  })
})
