import { describe, expect, it } from 'vitest'
import { CalendarOptions, EventApi, EventInput } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'

/*
Parsing event inputs into events: dates, allDay guessing, defaultAllDay, other props, eventDataTransform.
The calendar's timeZone is UTC.
*/
describe('event parsing', () => {
  function parseEvents(events: EventInput[], options: CalendarOptions = {}): EventApi[] {
    return initCalendar({ initialDate: '2014-05-01', ...options, events }).getEvents()
  }

  function parseEvent(eventInput: EventInput, options: CalendarOptions = {}): EventApi | undefined {
    return parseEvents([eventInput], options)[0]
  }

  function getDates(event: EventApi): [string, string | null, boolean] {
    return [event.startStr, event.end ? event.endStr : null, event.allDay]
  }

  describe('dates', () => {
    it('accepts `date` as an alias for `start`', () => {
      expect(getDates(parseEvent({ date: '2014-05-05' })!)).toEqual(['2014-05-05', null, true])
    })

    it.each([
      ['an invalid Date', new Date('asdf')],
      ['an invalid string', 'asdfasdfasdf'],
    ])('produces no event given %s start', (_desc, start) => {
      const events = parseEvents([{ start }, { start: '2014-05-01' }]) // the second is a control
      expect(events.map((event) => event.startStr)).toEqual(['2014-05-01'])
    })

    it.each<[string, EventInput, [string, null, boolean]]>([
      ['an invalid Date end', { start: '2014-05-01', end: new Date('asdf') }, ['2014-05-01', null, true]],
      ['an invalid string end', { start: '2014-05-01', end: 'asdfasdfasdf' }, ['2014-05-01', null, true]],
      ['a timed end before the start', { start: '2014-05-02T00:00:00', end: '2014-05-01T23:00:00' }, ['2014-05-02T00:00:00Z', null, false]],
      ['a timed end equal to the start', { start: '2014-05-02T00:00:00', end: '2014-05-02T00:00:00' }, ['2014-05-02T00:00:00Z', null, false]],
      ['an all-day end before the start', { start: '2014-05-02', end: '2014-05-01' }, ['2014-05-02', null, true]],
      ['an all-day end equal to the start', { start: '2014-05-02', end: '2014-05-02' }, ['2014-05-02', null, true]],
    ])('produces a null end given %s', (_desc, eventInput, expectedDates) => {
      expect(getDates(parseEvent(eventInput)!)).toEqual(expectedDates)
    })

    it('strips the times of an all-day event\'s dates', () => {
      const event = parseEvent({
        start: '2014-05-01T01:00:00-12:00',
        end: '2014-05-02T01:00:00-12:00',
        allDay: true,
      })!
      expect(getDates(event)).toEqual(['2014-05-01', '2014-05-02', true])
    })

    it('gives a timed event\'s dates without times 00:00', () => {
      const event = parseEvent({ start: '2014-05-01', end: '2014-05-03', allDay: false })!
      expect(getDates(event)).toEqual(['2014-05-01T00:00:00Z', '2014-05-03T00:00:00Z', false])
    })

    it('gives an all-day event with a timed same-day start and end a null end', () => {
      const event = parseEvent({
        allDay: true,
        start: new Date(2017, 10, 1, 10, 0, 0),
        end: new Date(2017, 10, 1, 18, 0, 0),
      }, { timeZone: 'local' })!
      expect(getDates(event)).toEqual(['2017-11-01', null, true])
      expect(event.start!.getTime()).toBe(new Date(2017, 10, 1).getTime())
    })
  })

  describe('allDay guessing', () => {
    it.each<[string, EventInput, boolean]>([
      ['a time in the ISO8601 start', { start: '2014-05-01T06:00:00' }, false],
      ['a time in the ISO8601 end', { start: '2014-05-01', end: '2014-05-01T08:00:00' }, false],
      ['an ISO8601 start without a time and no end', { start: '2014-05-01' }, true],
      ['ISO8601 start and end without times', { start: '2014-05-01', end: '2014-05-03' }, true],
      ['a timestamp start, which implies a time', { start: 1398902400000, end: '2014-05-03' }, false],
      ['a timestamp end, which implies a time', { start: '2014-05-01', end: 1399075200000 }, false],
    ])('guesses from %s', (_desc, eventInput, allDay) => {
      expect(parseEvent(eventInput)!.allDay).toBe(allDay)
    })
  })

  describe('defaultAllDay', () => {
    it.each<[string, CalendarOptions & { sourceDefaultAllDay?: boolean }, EventInput, boolean]>([
      ['the calendar\'s, when the event\'s allDay is unset', { defaultAllDay: false }, { start: '2014-05-01' }, false],
      ['the calendar\'s, not when the event\'s allDay is set', { defaultAllDay: false }, { start: '2014-05-01T00:00:00', allDay: true }, true],
      ['the source\'s, when the event\'s allDay is unset', { sourceDefaultAllDay: false }, { start: '2014-05-01' }, false],
      ['the source\'s true, over the calendar\'s false', { defaultAllDay: false, sourceDefaultAllDay: true }, { start: '2014-05-01T06:00:00' }, true],
      ['the source\'s false, over the calendar\'s true', { defaultAllDay: true, sourceDefaultAllDay: false }, { start: '2014-05-01' }, false],
      ['the source\'s, not when the event\'s allDay is set', { sourceDefaultAllDay: true }, { start: '2014-05-01', allDay: false }, false],
    ])('applies %s', (_desc, { sourceDefaultAllDay, ...options }, eventInput, allDay) => {
      const event = initCalendar({
        ...options,
        eventSources: [{ defaultAllDay: sourceDefaultAllDay, events: [eventInput] }],
      }).getEvents()[0]
      expect(event.allDay).toBe(allDay)
    })
  })

  describe('other props', () => {
    it('keeps a string className', () => {
      expect(parseEvent({ start: '2014-05-01', className: 'class1 class2' })!.className).toBe('class1 class2')
    })

    it('puts unknown props in extendedProps, including _id', () => {
      const event = parseEvent({ start: '2014-05-01', _id: 'a', prop1: 'prop1val', prop2: ['a', 'b'] })!
      expect(event.extendedProps).toEqual({ _id: 'a', prop1: 'prop1val', prop2: ['a', 'b'] })
    })
  })

  describe('eventDataTransform', () => {
    function transform(raw: EventInput): EventInput {
      return { ...raw, title: 'transformed', was_processed: true }
    }

    it.each<[string, CalendarOptions]>([
      ['the calendar', { events: [{ start: '2017-10-23' }], eventDataTransform: transform }],
      ['an event source', { eventSources: [{ events: [{ start: '2017-10-23' }], eventDataTransform: transform }] }],
    ])('transforms the input when set on %s', (_desc, options) => {
      const event = initCalendar(options).getEvents()[0]
      expect(event.title).toBe('transformed')
      expect(event.extendedProps.was_processed).toBe(true)
    })
  })
})
