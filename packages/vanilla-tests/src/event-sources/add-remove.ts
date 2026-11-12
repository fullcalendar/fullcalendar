import { describe, expect, it } from 'vitest'
import { Calendar, EventInput, EventSourceInput } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { createDeferred, getRenderedEventTitles } from '../lib/event-sources'

/*
Adding, getting and removing event sources.
*/
describe('event sources', () => {
  describe('addEventSource', () => {
    const options = {
      initialDate: '2014-06-24',
      initialView: 'dayGridMonth',
    }
    const eventArray: EventInput[] = [
      { id: '0', title: 'event zero', start: '2014-06-24' },
      { id: '1', title: 'event one', start: '2014-06-24' },
      { id: '2', title: 'event two', start: '2014-06-24' },
    ]

    it.each<[string, EventSourceInput, string | null]>([
      ['an array', eventArray, null],
      ['a function', (_info, callback) => callback(eventArray), null],
      ['an extended array source', { className: 'arraysource', events: eventArray }, 'arraysource'],
      ['an extended function source', {
        className: 'funcsource',
        events: (_info, callback) => callback(eventArray),
      }, 'funcsource'],
    ])('adds %s, whose events stay after navigating away and back', async (_desc, source, className) => {
      const calendar = initCalendar(options)
      await waitForSettle()
      expect(getEventEls(calendar.el)).toHaveLength(0)

      calendar.addEventSource(source)
      await waitForSettle()
      expectAllEvents(calendar, className)

      // https://github.com/fullcalendar/fullcalendar/issues/2191
      calendar.next()
      await waitForSettle()
      expect(getEventEls(calendar.el)).toHaveLength(0)
      calendar.prev()
      await waitForSettle()
      expectAllEvents(calendar, className)
    })

    function expectAllEvents(calendar: Calendar, className: string | null): void {
      expect(calendar.getEvents()).toHaveLength(3)
      expect(getRenderedEventTitles(calendar.el)).toEqual(['event one', 'event two', 'event zero'])

      if (className) {
        for (const el of getEventEls(calendar.el)) {
          expect(el.classList).toContain(className)
        }
      }
    }

    it('re-adds a source API object after it was removed', () => {
      const calendar = initCalendar({
        eventSources: [{ id: 'sourceA', events: [] }],
      })
      const source = calendar.getEventSourceById('sourceA')!
      source.remove()
      expect(calendar.getEventSources()).toHaveLength(0)

      const newSource = calendar.addEventSource(source)

      expect(calendar.getEventSources()).toHaveLength(1)
      expect(newSource).toBe(source)
    })

    it('doesn\'t re-add a source it already has', () => {
      const calendar = initCalendar({
        eventSources: [{ id: 'sourceA', events: [] }],
      })
      const source = calendar.getEventSourceById('sourceA')!

      const newSource = calendar.addEventSource(source)

      expect(calendar.getEventSources()).toHaveLength(1)
      expect(newSource).toBe(source)
    })
  })

  describe('getEventSources and getEventSourceById', () => {
    const eventSources = [
      { id: 'source1', events: [{ id: '1', start: '2015-08-07T02:00:00', title: 'event A' }] },
      { id: 'source2', events: [{ id: '2', start: '2015-08-07T03:00:00', title: 'event B' }] },
      { id: 'source3', events: [{ id: '3', start: '2015-08-07T04:00:00', title: 'event C' }] },
    ]

    it('getEventSourceById retrieves the source with the id', () => {
      const calendar = initCalendar({ eventSources })

      expect(calendar.getEventSourceById('source1')!.id).toBe('source1')
      expect(calendar.getEventSourceById('source2')!.id).toBe('source2')
      expect(calendar.getEventSourceById('nope')).toBeNull()
    })

    it('getEventSources returns a copy that removing a source doesn\'t mutate', () => {
      const calendar = initCalendar({ eventSources })
      const sources = calendar.getEventSources()
      expect(sources.map((source) => source.id)).toEqual(['source1', 'source2', 'source3'])

      sources[0].remove()

      expect(sources).toHaveLength(3)
      expect(calendar.getEventSources().map((source) => source.id)).toEqual(['source2', 'source3'])
    })
  })

  describe('removing', () => {
    const options = {
      initialDate: '2014-08-01',
      initialView: 'timeGridDay',
      scrollTime: '00:00',
    }

    // the types only allow string IDs, but numbers are accepted (coerced to strings), as in legacy code
    function buildSource(id: string | number) {
      return {
        id: id as string,
        events: [{ title: 'event' + id, start: '2014-08-01T02:00:00' }],
      }
    }

    it.each<[string, string | number, string | number, string]>([
      ['string source IDs, a string ID', '1', '1', 'event2'],
      ['numeric source IDs, a string ID', 1, '1', 'event2'],
      ['numeric source IDs, a number ID', 1, 1, 'event2'],
      ['numeric source IDs, ID 0', 0, 0, 'event1'], // https://github.com/fullcalendar/fullcalendar/issues/2082
      ['numeric source IDs, ID \'0\'', 0, '0', 'event1'],
    ])('removes the events of sources given at init, with %s', async (_desc, firstId, lookupId, remainingTitle) => {
      const secondId = typeof firstId === 'number' ? firstId + 1 : String(Number(firstId) + 1)
      const calendar = initCalendar({ ...options, eventSources: [buildSource(firstId), buildSource(secondId)] })
      await waitForSettle()
      expect(calendar.getEventSources().map((source) => source.id)).toEqual([String(firstId), String(secondId)]) // stored as strings
      expect(getRenderedEventTitles(calendar.el)).toEqual(['event' + firstId, 'event' + secondId])

      calendar.getEventSourceById(lookupId as string)!.remove()
      await waitForSettle()

      expect(calendar.getEventSources().map((source) => source.id)).toEqual([String(secondId)])
      expect(calendar.getEvents().map((event) => event.title)).toEqual([remainingTitle])
      expect(getRenderedEventTitles(calendar.el)).toEqual([remainingTitle])
    })

    it('removeAllEventSources removes every source\'s events', async () => {
      const calendar = initCalendar({
        ...options,
        eventSources: [buildSource(1), buildSource(2), buildSource(3)],
      })
      await waitForSettle()
      expect(getEventEls(calendar.el)).toHaveLength(3)

      calendar.removeAllEventSources()
      await waitForSettle()

      expect(calendar.getEventSources()).toHaveLength(0)
      expect(calendar.getEvents()).toHaveLength(0)
      expect(getEventEls(calendar.el)).toHaveLength(0)
    })

    it('doesn\'t render a removed source\'s events when its pending fetch finishes', async () => {
      const deferred1 = createDeferred()
      const deferred2 = createDeferred()
      const calendar = initCalendar({
        ...options,
        eventSources: [{
          id: '1',
          events(_info, callback) {
            deferred1.promise.then(() => callback([{ title: 'event1', start: '2014-08-01T02:00:00' }]))
          },
        }],
      })

      calendar.getEventSourceById('1')!.remove()
      calendar.addEventSource({
        id: '2',
        events(_info, callback) {
          deferred2.promise.then(() => callback([{ title: 'event2', start: '2014-08-01T02:00:00' }]))
        },
      })
      deferred1.resolve()
      deferred2.resolve()
      await Promise.all([deferred1.promise, deferred2.promise])
      await waitForSettle()

      expect(calendar.getEvents().map((event) => event.title)).toEqual(['event2'])
      expect(getRenderedEventTitles(calendar.el)).toEqual(['event2'])
    })
  })
})
