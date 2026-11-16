import { describe, expect, it, vi } from 'vitest'
import { EventApi, EventInput } from 'fullcalendar'
import { strictModeFactor } from 'fullcalendar/protected-api'
import { initCalendar } from '../lib/calendar'
import { waitForSettle } from '../lib/settle'

/*
EventApi.setStart, setEnd and setDates. The calendar's timeZone is UTC.
*/
describe('setting event dates', () => {
  const options = {
    initialDate: '2018-09-03',
    defaultTimedEventDuration: '01:00',
  }

  function getEvent(events: EventInput[], extraOptions = {}): EventApi {
    const calendar = initCalendar({ ...options, ...extraOptions, events })
    return calendar.getEventById('1')!
  }

  function getDates(event: EventApi): [string, string | null] {
    return [event.startStr, event.end ? event.endStr : null]
  }

  function getInstants(event: EventApi): [string, string | null] {
    return [event.start!.toISOString(), event.end ? event.end.toISOString() : null]
  }

  describe('setStart', () => {
    describe('when the event has no end', () => {
      const events = [{ id: '1', start: '2018-09-05T00:00:00' }]

      it('moves the start and gives the event an end, from the default duration', () => {
        const event = getEvent(events)
        event.setStart('2018-09-01')
        expect(getDates(event)).toEqual(['2018-09-01T00:00:00Z', '2018-09-05T01:00:00Z'])
      })

      it('moves the start and keeps no end when maintaining the duration', () => {
        const event = getEvent(events)
        event.setStart('2018-09-01', { maintainDuration: true })
        expect(getDates(event)).toEqual(['2018-09-01T00:00:00Z', null])
      })

      it('is undone when eventChange calls revert()', () => {
        const eventChange = vi.fn((info) => {
          expect(info.event.startStr).toBe('2018-09-01T00:00:00Z')
          expect(info.oldEvent.startStr).toBe('2018-09-05T00:00:00Z')
          info.revert()
        })
        const calendar = initCalendar({ ...options, events, eventChange })

        calendar.getEventById('1')!.setStart('2018-09-01')

        expect(eventChange).toHaveBeenCalledTimes(1)
        const allEvents = calendar.getEvents()
        expect(allEvents).toHaveLength(1)
        expect(getDates(allEvents[0])).toEqual(['2018-09-05T00:00:00Z', null])
      })
    })

    describe('when the event has an end', () => {
      const events = [{ id: '1', start: '2018-09-05T00:00:00', end: '2018-09-07T00:00:00' }]

      it('moves the start and keeps the end', () => {
        const event = getEvent(events)
        event.setStart('2018-09-01')
        expect(getDates(event)).toEqual(['2018-09-01T00:00:00Z', '2018-09-07T00:00:00Z'])
      })

      it('moves the end along when maintaining the duration', () => {
        const event = getEvent(events)
        event.setStart('2018-09-01', { maintainDuration: true })
        expect(getDates(event)).toEqual(['2018-09-01T00:00:00Z', '2018-09-03T00:00:00Z'])
      })
    })

    describe('when the event is all-day', () => {
      const events = [{ id: '1', start: '2018-09-05', end: '2018-09-07', allDay: true }]

      it.each([
        ['an all-day date', '2018-09-01'],
        ['a timed date, rounding it down to the day', '2018-09-01T23:00:00'],
      ])('moves the start to %s and stays all-day', (_desc, newStart) => {
        const event = getEvent(events)
        event.setStart(newStart)
        expect(getDates(event)).toEqual(['2018-09-01', '2018-09-07'])
        expect(event.allDay).toBe(true)
      })
    })

    it('moves the start of events in the same group by the same delta', () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { id: '1', groupId: 'a', start: '2018-09-05T00:00:00', end: '2018-09-10T00:00:00' },
          { id: '2', groupId: 'a', start: '2018-09-06T00:00:00', end: '2018-09-09T00:00:00' },
        ],
      })

      calendar.getEventById('1')!.setStart('2018-09-01') // 4 days earlier

      expect(getDates(calendar.getEventById('1')!)).toEqual(['2018-09-01T00:00:00Z', '2018-09-10T00:00:00Z'])
      expect(getDates(calendar.getEventById('2')!)).toEqual(['2018-09-02T00:00:00Z', '2018-09-09T00:00:00Z'])
    })
  })

  describe('setEnd', () => {
    it.each([
      ['no end', [{ id: '1', start: '2018-09-10T00:00:00' }]],
      ['an end', [{ id: '1', start: '2018-09-10T00:00:00', end: '2018-09-11T00:00:00' }]],
    ])('sets the end and keeps the start when the event has %s', (_desc, events) => {
      const event = getEvent(events)
      event.setEnd('2018-09-12T02:00:00')
      expect(getDates(event)).toEqual(['2018-09-10T00:00:00Z', '2018-09-12T02:00:00Z'])
    })

    it('moves the end of events in the same group by the same delta', () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { id: '1', groupId: 'a', start: '2018-09-10T00:00:00', end: '2018-09-11T00:00:00' },
          { id: '2', groupId: 'a', start: '2018-09-14T00:00:00', end: '2018-09-16T00:00:00' },
        ],
      })

      calendar.getEventById('1')!.setEnd('2018-09-12T02:00:00') // 1 day, 2 hours later

      expect(getDates(calendar.getEventById('1')!)).toEqual(['2018-09-10T00:00:00Z', '2018-09-12T02:00:00Z'])
      expect(getDates(calendar.getEventById('2')!)).toEqual(['2018-09-14T00:00:00Z', '2018-09-17T02:00:00Z'])
    })
  })

  describe('setDates', () => {
    const events = [{ id: '1', start: '2018-09-05T12:00:00' }]

    it.each<[string, [string, string], [string, string | null]]>([
      ['a different start and end', ['2018-09-05T14:00:00', '2018-09-05T16:00:00'], ['2018-09-05T14:00:00Z', '2018-09-05T16:00:00Z']],
      ['the same start and an end of the default duration', ['2018-09-05T12:00:00', '2018-09-05T13:00:00'], ['2018-09-05T12:00:00Z', null]],
      ['a different end', ['2018-09-05T12:00:00', '2018-09-05T18:00:00'], ['2018-09-05T12:00:00Z', '2018-09-05T18:00:00Z']],
      ['a different start and an end of the default duration', ['2018-09-06T01:00:00', '2018-09-06T02:00:00'], ['2018-09-06T01:00:00Z', null]],
    ])('given %s, sets an end only when it differs from the default duration', (_desc, [start, end], expectedDates) => {
      const event = getEvent(events)
      event.setDates(start, end)
      expect(getDates(event)).toEqual(expectedDates)
    })

    it('clears the end when given a null end', () => {
      const event = getEvent([{ id: '1', start: '2018-09-05T12:00:00', end: '2018-09-05T14:00:00' }])
      event.setDates('2018-09-06T01:00:00', null)
      expect(getDates(event)).toEqual(['2018-09-06T01:00:00Z', null])
    })

    it.each<[string, EventInput, [string, string], boolean, [string, string]]>([
      ['true', events[0], ['2018-09-06', '2018-09-10'], true, ['2018-09-06', '2018-09-10']],
      [
        'false',
        { id: '1', start: '2018-09-05', end: '2018-09-08' },
        ['2018-09-06T10:00:00', '2018-09-10T02:00:00'],
        false,
        ['2018-09-06T10:00:00Z', '2018-09-10T02:00:00Z'],
      ],
    ])('can set allDay to %s', (_desc, eventInput, [start, end], allDay, expectedDates) => {
      const event = getEvent([eventInput])
      expect(event.allDay).toBe(!allDay)
      event.setDates(start, end, { allDay })
      expect(getDates(event)).toEqual(expectedDates)
      expect(event.allDay).toBe(allDay)
    })

    it('moves the start and end of events in the same group by the same deltas', () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { id: '1', groupId: 'a', start: '2018-09-03', end: '2018-09-05' },
          { id: '2', groupId: 'a', start: '2018-09-13', end: '2018-09-15' },
        ],
      })

      calendar.getEventById('1')!.setDates('2018-09-02', '2018-09-06') // start a day earlier, end a day later

      // compares instants. See the tests below for the allDay flag
      expect(getInstants(calendar.getEventById('1')!)).toEqual(['2018-09-02T00:00:00.000Z', '2018-09-06T00:00:00.000Z'])
      expect(getInstants(calendar.getEventById('2')!)).toEqual(['2018-09-12T00:00:00.000Z', '2018-09-16T00:00:00.000Z'])
    })

    /*
    BEHAVIOR (it.fails until changed, for v8): without the allDay option, setDates sets the event's
    allDay to undefined (`standardProps = { allDay: options.allDay }`), so an all-day event turns
    into a timed one, and a timed event's allDay isn't false. Apps may rely on timed dates turning an
    all-day event timed (tested below)
    */
    it.fails('keeps an all-day event all-day when allDay isn\'t given', () => {
      const event = getEvent([{ id: '1', start: '2018-09-03', end: '2018-09-05' }])
      event.setDates('2018-09-02', '2018-09-06')
      expect(getDates(event)).toEqual(['2018-09-02', '2018-09-06'])
      expect(event.allDay).toBe(true)
    })

    it.fails('keeps a timed event timed when allDay isn\'t given', () => {
      const event = getEvent(events)
      expect(event.allDay).toBe(false)
      event.setDates('2018-09-06T01:00:00', '2018-09-06T03:00:00')
      expect(getDates(event)).toEqual(['2018-09-06T01:00:00Z', '2018-09-06T03:00:00Z'])
      expect(event.allDay).toBe(false)
    })

    // what apps may rely on: timed dates turn an all-day event timed, even without allDay: false
    it('turns an all-day event timed when given timed dates without allDay', () => {
      const event = getEvent([{ id: '1', start: '2018-09-03', end: '2018-09-05' }])
      event.setDates('2018-09-03T10:00:00', '2018-09-03T12:00:00')
      expect(getDates(event)).toEqual(['2018-09-03T10:00:00Z', '2018-09-03T12:00:00Z'])
      expect(event.allDay).toBeFalsy() // undefined, not false
    })
  })

  /*
  An inverse-background event renders as segments that aren't tied to an instance of the event.
  Mutating the event given to their content hooks does nothing.
  */
  it('ignores date changes made through a non-instance event', async () => {
    let renderCnt = 0
    const calendar = initCalendar({
      initialView: 'dayGridWeek',
      initialDate: '2018-09-03',
      events: [
        { id: '1', start: '2018-09-04', display: 'inverse-background' }, // renders two segments
      ],
      backgroundEventContent(info) {
        renderCnt += 1
        if (renderCnt === 2) {
          info.event.setStart('2018-08-04')
          info.event.setEnd('2018-10-04')
          info.event.setDates('2018-08-04', '2018-10-04')
        }
      },
    })
    await waitForSettle()

    expect(renderCnt).toBe(2 * strictModeFactor)
    const event = calendar.getEventById('1')!
    expect(getDates(event)).toEqual(['2018-09-04', null])
    expect(event.allDay).toBe(true)
  })
})
