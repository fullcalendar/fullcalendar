import { describe, expect, it } from 'vitest'
import { EventApi, EventInput } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'

/*
EventApi.moveStart, moveEnd and moveDates. The calendar's timeZone is UTC.
*/
describe('moving event dates', () => {
  const options = {
    initialDate: '2018-09-03',
    defaultTimedEventDuration: '01:00',
  }
  const eventWithoutEnd = { id: '1', start: '2018-09-03T12:00:00' }
  const eventWithEnd = { id: '1', start: '2018-09-03T12:00:00', end: '2018-09-03T15:00:00' }

  function getEvent(eventInput: EventInput): EventApi {
    const calendar = initCalendar({ ...options, events: [eventInput] })
    return calendar.getEventById('1')!
  }

  function getDates(event: EventApi): [string, string | null] {
    return [event.startStr, event.end ? event.endStr : null]
  }

  describe('moveStart', () => {
    it('moves the start and gives an event without an end one, from the default duration', () => {
      const event = getEvent(eventWithoutEnd)
      event.moveStart({ hours: -5 })
      expect(getDates(event)).toEqual(['2018-09-03T07:00:00Z', '2018-09-03T13:00:00Z'])
    })

    it('moves the start and keeps the end', () => {
      const event = getEvent(eventWithEnd)
      event.moveStart({ hours: -5 })
      expect(getDates(event)).toEqual(['2018-09-03T07:00:00Z', '2018-09-03T15:00:00Z'])
    })

    it('resets the end to the default duration when moving the start past it', () => {
      const event = getEvent(eventWithEnd)
      event.moveStart({ days: 1 })
      expect(getDates(event)).toEqual(['2018-09-04T12:00:00Z', '2018-09-04T13:00:00Z'])
    })
  })

  describe('moveEnd', () => {
    it('moves the end of an event without one from the default duration', () => {
      const event = getEvent(eventWithoutEnd)
      event.moveEnd('01:00')
      expect(getDates(event)).toEqual(['2018-09-03T12:00:00Z', '2018-09-03T14:00:00Z'])
    })

    it('moves the end', () => {
      const event = getEvent(eventWithEnd)
      event.moveEnd('01:00')
      expect(getDates(event)).toEqual(['2018-09-03T12:00:00Z', '2018-09-03T16:00:00Z'])
    })
  })

  describe('moveDates', () => {
    it('moves the start and keeps a null end', () => {
      const event = getEvent({ id: '1', start: '2018-09-03T00:00:00' })
      event.moveDates({ days: 1, hours: 1 })
      expect(getDates(event)).toEqual(['2018-09-04T01:00:00Z', null])
    })

    it('moves the start and end by the same delta', () => {
      const event = getEvent({ id: '1', start: '2018-09-03T00:00:00', end: '2018-09-04T12:00:00' })
      event.moveDates({ days: 1, hours: 1 })
      expect(getDates(event)).toEqual(['2018-09-04T01:00:00Z', '2018-09-05T13:00:00Z'])
    })

    it('moves events in the same group by the same delta, but not others', () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { id: '1', groupId: 'a', start: '2018-09-03T00:00:00', end: '2018-09-04T12:00:00' },
          { id: '2', groupId: 'a', start: '2018-10-03T00:00:00', end: '2018-10-04T12:00:00' },
          { id: '3', groupId: 'bbb', start: '2018-10-03T00:00:00', end: '2018-10-04T12:00:00' },
        ],
      })

      calendar.getEventById('1')!.moveDates({ days: 1, hours: 1 })

      expect(getDates(calendar.getEventById('1')!)).toEqual(['2018-09-04T01:00:00Z', '2018-09-05T13:00:00Z'])
      expect(getDates(calendar.getEventById('2')!)).toEqual(['2018-10-04T01:00:00Z', '2018-10-05T13:00:00Z'])
      expect(getDates(calendar.getEventById('3')!)).toEqual(['2018-10-03T00:00:00Z', '2018-10-04T12:00:00Z'])
    })
  })
})
