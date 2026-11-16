import { describe, expect, it } from 'vitest'
import { Calendar } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventIdOfEl } from '../lib/models/events'
import { findOverlappingEls, getCoveredDates, getVisibleEventEls } from '../lib/models/event-content'
import { waitForSettle } from '../lib/settle'

/*
Event ids, top to bottom, of the visible segments covering the date.
*/
function getStackOrder(calendar: Calendar, date: string): string[] {
  return getVisibleEventEls(calendar.el)
    .filter((el) => getCoveredDates(el).includes(date))
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
    .map(getEventIdOfEl)
}

function getTop(calendar: Calendar, eventId: string, date: string): number {
  const el = getVisibleEventEls(calendar.el).find((eventEl) => (
    getEventIdOfEl(eventEl) === eventId && getCoveredDates(eventEl).includes(date)
  ))!
  return el.getBoundingClientRect().top
}

describe('eventOrder in dayGrid', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2018-01-01',
  }

  it('sorts by start time by default', async () => {
    const calendar = initCalendar({
      ...options,
      events: [
        { id: 'z', title: 'a', start: '2018-01-01T10:00:00' },
        { id: 'y', title: 'b', start: '2018-01-01T09:00:00' },
        { id: 'x', title: 'c', start: '2018-01-01T08:00:00' },
      ],
    })
    await waitForSettle()

    expect(getStackOrder(calendar, '2018-01-01')).toEqual(['x', 'y', 'z'])
  })

  describe('with equal start times', () => {
    const events = [
      { id: 'z', title: 'a', start: '2018-01-01T09:00:00', myOrder: 3 },
      { id: 'y', title: 'b', start: '2018-01-01T09:00:00', myOrder: 1 },
      { id: 'x', title: 'c', start: '2018-01-01T09:00:00', myOrder: 2 },
    ]

    it.each([
      { desc: 'title, by default', extraOptions: {}, order: ['z', 'y', 'x'] },
      { desc: 'a standard prop', extraOptions: { eventOrder: 'id' }, order: ['x', 'y', 'z'] },
      { desc: 'a non-standard prop', extraOptions: { eventOrder: 'myOrder' }, order: ['y', 'x', 'z'] },
    ])('sorts by $desc', async ({ extraOptions, order }) => {
      const calendar = initCalendar({ ...options, ...extraOptions, events })
      await waitForSettle()

      expect(getStackOrder(calendar, '2018-01-01')).toEqual(order)
    })
  })

  it('sorts by a prop over the start date', async () => {
    const calendar = initCalendar({
      ...options,
      eventOrder: 'myOrder',
      events: [
        { id: 'z', start: '2018-01-03T09:00:00', end: '2018-01-06T09:00:00', myOrder: 3 },
        { id: 'y', start: '2018-01-02T09:00:00', end: '2018-01-06T09:00:00', myOrder: 1 },
        { id: 'x', start: '2018-01-01T09:00:00', end: '2018-01-06T09:00:00', myOrder: 2 },
      ],
    })
    await waitForSettle()

    expect(getStackOrder(calendar, '2018-01-03')).toEqual(['y', 'x', 'z'])
  })

  it('sorts by a prop over the duration', async () => {
    const calendar = initCalendar({
      ...options,
      eventOrder: 'myOrder',
      events: [
        { id: 'z', start: '2018-01-01T09:00:00', end: '2018-01-04T09:00:00', myOrder: 3 },
        { id: 'y', start: '2018-01-01T09:00:00', end: '2018-01-02T09:00:00', myOrder: 1 },
        { id: 'x', start: '2018-01-01T09:00:00', end: '2018-01-03T09:00:00', myOrder: 2 },
      ],
    })
    await waitForSettle()

    expect(getStackOrder(calendar, '2018-01-01')).toEqual(['y', 'x', 'z'])
  })

  it('sorts by -duration for an event split across weeks', async () => {
    const calendar = initCalendar({
      ...options,
      eventOrder: '-duration',
      events: [
        { id: 'x', start: '2018-01-06', end: '2018-01-08' },
        { id: 'y', start: '2018-01-06', end: '2018-01-07' },
        { id: 'z', start: '2018-01-07', end: '2018-01-08' },
      ],
    })
    await waitForSettle()

    expect(getStackOrder(calendar, '2018-01-06')).toEqual(['x', 'y'])
    expect(getStackOrder(calendar, '2018-01-07')).toEqual(['x', 'z'])
  })

  describe('with eventOrderStrict', () => {
    it('stacks strictly in order, even when a later event would fit higher', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2020-05-01',
        eventOrder: 'id',
        eventOrderStrict: true,
        events: [
          { id: '1', start: '2020-05-05' },
          { id: '2', start: '2020-05-03', end: '2020-05-08' },
          { id: '3', start: '2020-05-04' },
        ],
      })
      await waitForSettle()

      expect(findOverlappingEls(getVisibleEventEls(calendar.el))).toBeNull()
      expect(getTop(calendar, '1', '2020-05-05')).toBeLessThan(getTop(calendar, '2', '2020-05-05'))
      expect(getTop(calendar, '2', '2020-05-04')).toBeLessThan(getTop(calendar, '3', '2020-05-04'))
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5767
    it('fills the gap left by an event hidden by dayMaxEventRows', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridWeek',
        initialDate: '2020-08-23',
        eventOrder: 'title',
        eventOrderStrict: true,
        dayMaxEventRows: 4,
        events: [
          { id: 'a', title: 'a', start: '2020-08-24', end: '2020-08-27' },
          { id: 'b', title: 'b', start: '2020-08-24', end: '2020-08-27' },
          { id: 'c', title: 'c', start: '2020-08-28', end: '2020-08-29' },
          { id: 'd', title: 'd', start: '2020-08-24', end: '2020-08-29' },
          { id: 'e', title: 'e', start: '2020-08-27', end: '2020-08-29' },
          { id: 'f', title: 'f', start: '2020-08-24', end: '2020-08-29' }, // causes 'e' to hide
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(findOverlappingEls(eventEls)).toBeNull()
      expect(eventEls.map(getEventIdOfEl)).not.toContain('e')

      const dRect = eventEls.find((el) => getEventIdOfEl(el) === 'd')!.getBoundingClientRect()
      const fRect = eventEls.find((el) => getEventIdOfEl(el) === 'f')!.getBoundingClientRect()
      expect(fRect.top - dRect.bottom).toBeLessThan(2)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/6393
    it('doesn\'t overlap timed events', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridWeek',
        initialDate: '2021-06-21',
        eventOrderStrict: true,
        events: [
          { title: 'Busy1', start: '2021-06-21T10:00:00Z', end: '2021-06-21T11:00:00Z' },
          { title: 'Busy2', start: '2021-06-21T08:00:00Z', end: '2021-06-21T10:00:00Z' },
          { title: 'Busy3', start: '2021-06-22T11:00:00Z', end: '2021-06-22T12:00:00Z' },
          { title: 'Busy4', start: '2021-06-24T08:30:00Z', end: '2021-06-24T11:00:00Z' },
          { title: 'Busy5', start: '2021-06-24T16:00:00Z', end: '2021-06-24T16:30:00Z' },
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(5)
      expect(findOverlappingEls(eventEls)).toBeNull()
    })
  })
})
