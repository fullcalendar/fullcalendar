import { describe, expect, it } from 'vitest'
import { Calendar } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getLeafTexts } from '../lib/intl'
import { DayGridModel } from '../lib/models/day-grid'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
How the timeZone option interprets received event dates and where they render.
The browser runs in America/New_York, so `local` means EDT (-04:00) for these dates.
Named time zones need no plugin: the library resolves them itself.
*/
describe('timeZone', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-05-01',
    events: [
      { id: 'allDay', title: 'all day event', start: '2014-05-02' },
      { id: 'timed', title: 'timed event', start: '2014-05-10T12:00:00' },
      { id: 'zoned', title: 'timed and zoned event', start: '2014-05-10T14:00:00+11:00' }, // 03:00Z
    ],
  }

  function getStarts(calendar: Calendar) {
    return ['allDay', 'timed', 'zoned'].map((id) => {
      const event = calendar.getEventById(id)!
      return { allDay: event.allDay, start: event.start!.toISOString() }
    })
  }

  it.each([
    ['local', '2014-05-02T04:00:00.000Z', '2014-05-10T16:00:00.000Z'],
    ['UTC', '2014-05-02T00:00:00.000Z', '2014-05-10T12:00:00.000Z'],
    ['America/Chicago', '2014-05-02T05:00:00.000Z', '2014-05-10T17:00:00.000Z'],
  ])('interprets zoneless event dates in the %s time zone', async (timeZone, allDayStart, timedStart) => {
    const calendar = initCalendar({ ...options, timeZone })
    await waitForSettle()

    expect(getStarts(calendar)).toEqual([
      { allDay: true, start: allDayStart },
      { allDay: false, start: timedStart },
      { allDay: false, start: '2014-05-10T03:00:00.000Z' }, // an explicit offset is the same instant everywhere
    ])
  })

  it.each([
    ['UTC', '2014-05-10', '3a'],
    ['local', '2014-05-09', '11p'],
    ['America/Chicago', '2014-05-09', '10p'],
  ])('renders an event with an explicit offset at its time in the %s time zone', async (timeZone, day, timeText) => {
    const calendar = initCalendar({ ...options, timeZone })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const eventEl = getEventEls(calendar.el, 'zoned')[0]
    expect(dayGrid.getDayCell(day).contains(eventEl)).toBe(true)
    expect(getLeafTexts(eventEl)).toEqual([timeText, 'timed and zoned event'])
  })

  it('can be set dynamically, keeping already-parsed instants', async () => {
    const calendar = initCalendar({ ...options, timeZone: 'local' })
    await waitForSettle()

    expect(getStarts(calendar)).toEqual([
      { allDay: true, start: '2014-05-02T04:00:00.000Z' },
      { allDay: false, start: '2014-05-10T16:00:00.000Z' },
      { allDay: false, start: '2014-05-10T03:00:00.000Z' },
    ])

    calendar.setOption('timeZone', 'UTC')
    await waitForSettle()

    expect(getStarts(calendar)).toEqual([
      { allDay: true, start: '2014-05-02T00:00:00.000Z' }, // all-day dates keep their date
      { allDay: false, start: '2014-05-10T16:00:00.000Z' }, // was parsed as local, so the instant stays
      { allDay: false, start: '2014-05-10T03:00:00.000Z' },
    ])
    expect(getLeafTexts(getEventEls(calendar.el, 'timed')[0])).toEqual(['4p', 'timed event'])
  })
})
