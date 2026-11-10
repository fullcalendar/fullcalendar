import { describe, expect, it } from 'vitest'
import { Calendar, EventInput } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { getLeafTexts } from '../lib/intl'
import { waitForSettle } from '../lib/settle'

/*
What happens to already-parsed timed events when the timeZone option changes.
*/
describe('changing the timeZone', () => {
  const options = {
    timeZone: 'America/New_York',
    initialView: 'timeGridWeek',
    initialDate: '2023-02-07',
  }

  function getRenderedTimes(calendar: Calendar): string[][] {
    return getEventEls(calendar.el).map((el) => getLeafTexts(el))
  }

  function getInstants(calendar: Calendar): string[] {
    return calendar.getEvents().map((event) => event.start!.toISOString())
  }

  it.each<[string, EventInput]>([
    ['a non-recurring event', { title: 'e', start: '2023-02-07T12:00:00' }],
    ['a recurring event', { title: 'e', startTime: '12:00', daysOfWeek: [2] }],
  ])('keeps the instant of %s whose dates had no offset', async (_desc, eventInput) => {
    const calendar = initCalendar({ ...options, events: [eventInput] })
    await waitForSettle()
    expect(getInstants(calendar)).toEqual(['2023-02-07T17:00:00.000Z'])
    expect(getRenderedTimes(calendar)).toEqual([['12:00', 'e']])

    calendar.setOption('timeZone', 'America/Chicago')
    await waitForSettle()

    expect(getInstants(calendar)).toEqual(['2023-02-07T17:00:00.000Z'])
    expect(calendar.getEvents()[0].startStr).toBe('2023-02-07T11:00:00-06:00')
    expect(getRenderedTimes(calendar)).toEqual([['11:00', 'e']])
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5273 (fixed in v6.1.17; also #7635, #7704)
  it('keeps recurrences anchored to the original time zone after navigating', async () => {
    const calendar = initCalendar({ ...options, events: [{ title: 'e', startTime: '12:00', daysOfWeek: [2] }] })
    await waitForSettle()
    calendar.setOption('timeZone', 'America/Chicago')
    await waitForSettle()

    calendar.next()
    await waitForSettle()
    expect(getInstants(calendar)).toEqual(['2023-02-14T17:00:00.000Z'])
    expect(getRenderedTimes(calendar)).toEqual([['11:00', 'e']])

    calendar.prev()
    await waitForSettle()
    expect(getInstants(calendar)).toEqual(['2023-02-07T17:00:00.000Z'])
    expect(getRenderedTimes(calendar)).toEqual([['11:00', 'e']])
  })
})
