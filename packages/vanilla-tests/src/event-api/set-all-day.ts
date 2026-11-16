import { describe, expect, it } from 'vitest'
import { CalendarOptions, EventApi } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'

/*
EventApi.setAllDay. The calendar's timeZone is UTC.
*/
describe('EventApi.setAllDay', () => {
  const allDayEvent = { id: '1', start: '2018-09-03', end: '2018-09-05', allDay: true }
  const timedEvent = { id: '1', start: '2018-09-03T09:00:00', end: '2018-09-05T10:00:00', allDay: false }

  function getEvent(options: CalendarOptions): EventApi {
    return initCalendar({ initialDate: '2018-09-03', ...options }).getEventById('1')!
  }

  function getDates(event: EventApi): [string, string | null, boolean] {
    return [event.startStr, event.end ? event.endStr : null, event.allDay]
  }

  it('changes nothing when setting an all-day event to all-day', () => {
    const event = getEvent({ events: [allDayEvent] })
    event.setAllDay(true)
    expect(getDates(event)).toEqual(['2018-09-03', '2018-09-05', true])
  })

  it('changes nothing when setting a timed event to timed', () => {
    const event = getEvent({ events: [timedEvent] })
    event.setAllDay(false)
    expect(getDates(event)).toEqual(['2018-09-03T09:00:00Z', '2018-09-05T10:00:00Z', false])
  })

  describe('from all-day to timed', () => {
    it('removes the end', () => {
      const event = getEvent({ events: [allDayEvent] })
      event.setAllDay(false)
      expect(getDates(event)).toEqual(['2018-09-03T00:00:00Z', null, false])
    })

    it('keeps the exact duration when maintaining the duration', () => {
      const event = getEvent({ events: [allDayEvent] })
      event.setAllDay(false, { maintainDuration: true })
      expect(getDates(event)).toEqual(['2018-09-03T00:00:00Z', '2018-09-05T00:00:00Z', false])
    })
  })

  describe('from timed to all-day', () => {
    it('removes the end', () => {
      const event = getEvent({ events: [timedEvent] })
      event.setAllDay(true)
      expect(getDates(event)).toEqual(['2018-09-03', null, true])
    })

    it.each<[string, CalendarOptions, { maintainDuration: boolean } | undefined]>([
      ['the maintainDuration argument', {}, { maintainDuration: true }],
      ['the allDayMaintainDuration option', { allDayMaintainDuration: true }, undefined],
    ])('rounds the end down to a whole day when maintaining the duration with %s', (_desc, options, arg) => {
      const event = getEvent({ ...options, events: [timedEvent] })
      event.setAllDay(true, arg)
      expect(getDates(event)).toEqual(['2018-09-03', '2018-09-05', true])
    })
  })
})
