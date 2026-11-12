import { describe, expect, it } from 'vitest'
import { Calendar } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
nextDayThreshold: the time of day an exclusive end must reach for an event to occupy that day.
*/
describe('nextDayThreshold', () => {
  /*
  The dates whose day cells the event's segments are over.
  */
  function getCoveredDates(calendar: Calendar, dates: string[]): string[] {
    const dayGrid = new DayGridModel(calendar.el)
    const eventRects = getEventEls(calendar.el).map((el) => el.getBoundingClientRect())

    return dates.filter((date) => {
      const cellRect = dayGrid.getDayCell(date).getBoundingClientRect()
      const centerX = cellRect.left + cellRect.width / 2
      return eventRects.some((rect) => (
        rect.left <= centerX && centerX <= rect.right && rect.top >= cellRect.top && rect.bottom <= cellRect.bottom
      ))
    })
  }

  it.each([
    ['before', '2014-06-10T09:00:00', ['2014-06-08', '2014-06-09']],
    ['equal to', '2014-06-10T10:00:00', ['2014-06-08', '2014-06-09', '2014-06-10']],
    ['after', '2014-06-10T11:00:00', ['2014-06-08', '2014-06-09', '2014-06-10']],
  ])('renders an event ending %s the threshold', async (_desc, end, expectedDates) => {
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2014-06-01',
      nextDayThreshold: '10:00:00',
      events: [{ title: 'event1', start: '2014-06-08T22:00:00', end }],
    })
    await waitForSettle()

    expect(getCoveredDates(calendar, ['2014-06-07', '2014-06-08', '2014-06-09', '2014-06-10', '2014-06-11']))
      .toEqual(expectedDates)
  })

  it('doesn\'t render an event that ends before the threshold of the first visible day', async () => {
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2017-10-01',
      nextDayThreshold: '09:00:00',
      events: [
        { id: '1', start: '2017-09-30T08:00:00', end: '2017-10-01T08:00:00' },
        { id: 'control', start: '2017-09-30T08:00:00', end: '2017-10-01T09:00:00' },
      ],
    })
    await waitForSettle()

    expect(getEventEls(calendar.el, '1')).toHaveLength(0)
    expect(getEventEls(calendar.el, 'control')).toHaveLength(1)
  })
})
