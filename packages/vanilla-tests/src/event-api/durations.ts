import { describe, expect, it } from 'vitest'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
Events without an end: forceEventDuration, defaultAllDayEventDuration, defaultTimedEventDuration.
The calendar's timeZone is UTC.
*/
describe('event durations', () => {
  const options = {
    initialDate: '2014-05-01',
    initialView: 'dayGridMonth',
  }

  describe('forceEventDuration', () => {
    it.each([
      [false, [null, null]],
      [true, ['2014-05-11', '2014-05-10T15:00:00Z']],
    ])('when %s, sets ends for events without one', (forceEventDuration, expectedEnds) => {
      const calendar = initCalendar({
        ...options,
        forceEventDuration,
        events: [
          { id: '1', start: '2014-05-10' },
          { id: '2', start: '2014-05-10T14:00:00' },
        ],
      })

      expect(calendar.getEvents().map((event) => (event.end ? event.endStr : null))).toEqual(expectedEnds)
    })
  })

  describe('with forceEventDuration, computes the end', () => {
    it.each<[string, CalendarOptions, string]>([
      ['defaultAllDayEventDuration as an object', { defaultAllDayEventDuration: { days: 2 } }, '2014-05-07'],
      ['defaultAllDayEventDuration as a string', { defaultAllDayEventDuration: '3.00:00:00' }, '2014-05-08'],
    ])('of an all-day event from %s', (_desc, durationOptions, expectedEnd) => {
      const calendar = initCalendar({
        ...options,
        ...durationOptions,
        forceEventDuration: true,
        events: [{ allDay: true, start: '2014-05-05' }],
      })

      expect(calendar.getEvents()[0].endStr).toBe(expectedEnd)
    })

    it.each<[string, CalendarOptions, string]>([
      ['defaultTimedEventDuration as an object', { defaultTimedEventDuration: { hours: 2, minutes: 30 } }, '2014-05-05T06:30:00Z'],
      ['defaultTimedEventDuration as a string', { defaultTimedEventDuration: '03:15:00' }, '2014-05-05T07:15:00Z'],
    ])('of a timed event from %s', (_desc, durationOptions, expectedEnd) => {
      const calendar = initCalendar({
        ...options,
        ...durationOptions,
        forceEventDuration: true,
        events: [{ allDay: false, start: '2014-05-05T04:00:00' }],
      })

      expect(calendar.getEvents()[0].endStr).toBe(expectedEnd)
    })
  })

  /*
  Without forceEventDuration, the end stays null but the event renders with the default duration.
  Each test has a control event with that duration as an explicit end.
  */
  describe('without forceEventDuration, renders an event without an end with the default duration', () => {
    function getRect(calendar: Calendar, eventId: string): DOMRect {
      const eventEls = getEventEls(calendar.el, eventId)
      expect(eventEls).toHaveLength(1)
      return eventEls[0].getBoundingClientRect()
    }

    it.each(['dayGridWeek', 'timeGridWeek'])('for all-day events, in %s', async (initialView) => {
      const calendar = initCalendar({
        ...options,
        initialView,
        forceEventDuration: false,
        defaultAllDayEventDuration: { days: 2 },
        events: [
          { id: 'control', allDay: true, start: '2014-04-28', end: '2014-04-30' },
          { id: 'test', allDay: true, start: '2014-04-28' },
        ],
      })
      await waitForSettle()

      expect(calendar.getEventById('test')!.end).toBeNull()
      const controlRect = getRect(calendar, 'control')
      const testRect = getRect(calendar, 'test')
      expect(controlRect.width).toBeGreaterThan(0)
      expect(testRect.left).toBe(controlRect.left)
      expect(testRect.width).toBe(controlRect.width)
    })

    it('for timed events, in timeGridWeek', async () => {
      const calendar = initCalendar({
        ...options,
        initialView: 'timeGridWeek',
        scrollTime: '00:00',
        forceEventDuration: false,
        defaultTimedEventDuration: '01:15:00',
        events: [
          { id: 'control', allDay: false, start: '2014-05-01T04:00:00', end: '2014-05-01T05:15:00' },
          { id: 'test', allDay: false, start: '2014-05-02T04:00:00' }, // the next day
        ],
      })
      await waitForSettle()

      expect(calendar.getEventById('test')!.end).toBeNull()
      const controlRect = getRect(calendar, 'control')
      const testRect = getRect(calendar, 'test')
      expect(controlRect.height).toBeGreaterThan(0)
      expect(testRect.top).toBe(controlRect.top)
      expect(testRect.height).toBe(controlRect.height)
    })

    it('for timed events, in dayGridWeek', async () => {
      const calendar = initCalendar({
        ...options,
        initialView: 'dayGridWeek',
        forceEventDuration: false,
        defaultTimedEventDuration: { days: 2 },
        events: [
          { id: 'control', allDay: false, start: '2014-04-28T04:00:00', end: '2014-04-30T04:00:00' },
          { id: 'test', allDay: false, start: '2014-04-28T04:00:00' },
        ],
      })
      await waitForSettle()

      expect(calendar.getEventById('test')!.end).toBeNull()
      const controlRect = getRect(calendar, 'control')
      const testRect = getRect(calendar, 'test')
      expect(controlRect.width).toBeGreaterThan(0)
      expect(testRect.left).toBe(controlRect.left)
      expect(testRect.width).toBe(controlRect.width)
    })
  })
})
