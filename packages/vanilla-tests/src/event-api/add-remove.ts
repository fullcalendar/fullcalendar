import { describe, expect, it, vi } from 'vitest'
import { Calendar, EventInput } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getRenderedEventTitles } from '../lib/event-sources'

/*
Calendar.addEvent, EventApi.remove, removeAllEvents, EventApi.source, and the eventAdd/eventRemove/
eventsSet callbacks.
*/
describe('adding and removing events', () => {
  describe('addEvent', () => {
    const options = {
      initialDate: '2018-09-07',
    }
    const sourceOptions = {
      ...options,
      eventSources: [{ id: '9', events: [{ id: 'a', start: '2018-09-07' }] }],
    }

    it('re-adds an event that was removed, returning the same object', () => {
      const calendar = initCalendar({ ...options, events: [{ id: 'a', start: '2018-09-07' }] })
      const event = calendar.getEventById('a')!
      event.remove()
      expect(calendar.getEvents()).toHaveLength(0)

      const newEvent = calendar.addEvent(event)

      expect(newEvent).toBe(event)
      expect(calendar.getEvents().map((e) => e.id)).toEqual(['a'])
    })

    it('doesn\'t double-add an event it already has', () => {
      const calendar = initCalendar({ ...options, events: [{ id: 'a', start: '2018-09-07' }] })
      const event = calendar.getEventById('a')!

      const newEvent = calendar.addEvent(event)

      expect(newEvent).toBe(event)
      expect(calendar.getEvents()).toHaveLength(1)
    })

    it.each<[string, (calendar: Calendar) => unknown]>([
      ['a string source ID', () => '9'],
      ['a number source ID', () => 9],
      ['a source object', (calendar) => calendar.getEventSourceById('9')],
    ])('adds the event to the source given as %s', (_desc, getSource) => {
      const calendar = initCalendar(sourceOptions)

      const newEvent = calendar.addEvent({ id: 'b', start: '2018-09-10' }, getSource(calendar) as string)!

      expect(newEvent.source!.id).toBe('9')
      expect(calendar.getEventById('b')!.source!.id).toBe('9')
    })

    it('renders the added event', async () => {
      const calendar = initCalendar({ ...options, initialView: 'dayGridMonth' })
      await waitForSettle()
      expect(getEventEls(calendar.el)).toHaveLength(0)

      calendar.addEvent({ title: 'added', start: '2018-09-10' })
      await waitForSettle()

      expect(getRenderedEventTitles(calendar.el)).toEqual(['added'])
    })
  })

  describe('EventApi.source', () => {
    it('is the event\'s source', () => {
      const calendar = initCalendar({
        eventSources: [{ id: 'sourceA', events: [{ id: 'eventA', start: '2018-09-07' }] }],
      })

      expect(calendar.getEventById('eventA')!.source!.id).toBe('sourceA')
    })

    it('is null for an event added without a source', () => {
      const calendar = initCalendar()
      calendar.addEvent({ id: 'eventA', start: '2018-09-07' })

      expect(calendar.getEventById('eventA')).not.toBeNull()
      expect(calendar.getEventById('eventA')!.source).toBeNull()
    })
  })

  describe('removing', () => {
    const options = {
      initialDate: '2014-06-24',
      initialView: 'dayGridMonth',
    }

    /*
    IDs are the index, given as a number (incl. 0) or a string, or absent. The types only allow
    string IDs, but numbers are accepted (coerced to strings), as in legacy code.
    */
    function buildEvents(idType: 'none' | 'number' | 'string'): EventInput[] {
      return [
        { title: 'event zero', start: '2014-06-24' },
        { title: 'event one', start: '2014-06-24' },
        { title: 'event two', start: '2014-06-24' },
      ].map((event, i) => (
        idType === 'none' ? event : { ...event, id: (idType === 'number' ? i : String(i)) as string }
      ))
    }

    /*
    Array sources keep their state across navigation (#2187), so the removal sticks.
    */
    async function expectRenderedAfterNavigating(calendar: Calendar, titles: string[]): Promise<void> {
      expect(getRenderedEventTitles(calendar.el)).toEqual(titles)

      calendar.next()
      await waitForSettle()
      calendar.prev()
      await waitForSettle()

      expect(calendar.getEvents().map((event) => event.title).sort()).toEqual(titles)
      expect(getRenderedEventTitles(calendar.el)).toEqual(titles)
    }

    it.each([
      ['without IDs', 'none'],
      ['with numeric IDs', 'number'],
    ] as const)('removeAllEvents removes all events %s', async (_desc, idType) => {
      const calendar = initCalendar({ ...options, events: buildEvents(idType) })
      await waitForSettle()
      expect(getEventEls(calendar.el)).toHaveLength(3)

      calendar.removeAllEvents()
      await waitForSettle()

      await expectRenderedAfterNavigating(calendar, [])
    })

    it.each([
      ['without IDs', 'none'],
      ['with numeric IDs', 'number'],
    ] as const)('EventApi.remove removes one event %s', async (_desc, idType) => {
      const calendar = initCalendar({ ...options, events: buildEvents(idType) })
      await waitForSettle()

      calendar.getEvents().find((event) => event.title === 'event one')!.remove()
      await waitForSettle()

      await expectRenderedAfterNavigating(calendar, ['event two', 'event zero'])
    })

    it.each<[string, 'number' | 'string', string | number, string]>([
      ['string input IDs, a string ID', 'string', '1', 'event one'],
      ['numeric input IDs, a string ID', 'number', '1', 'event one'],
      ['numeric input IDs, a number ID', 'number', 1, 'event one'],
      ['string input IDs, ID 0', 'string', 0, 'event zero'],
      ['numeric input IDs, ID 0', 'number', 0, 'event zero'], // https://github.com/fullcalendar/fullcalendar/issues/2082
      ['numeric input IDs, ID \'0\'', 'number', '0', 'event zero'],
    ])('removes the event found by getEventById, with %s', async (_desc, idType, id, removedTitle) => {
      const calendar = initCalendar({ ...options, events: buildEvents(idType) })
      await waitForSettle()
      expect(calendar.getEvents().map((event) => event.id)).toEqual(['0', '1', '2']) // stored as strings
      expect(calendar.getEventById(id as string)!.title).toBe(removedTitle)

      calendar.getEventById(id as string)!.remove()
      await waitForSettle()

      const remainingTitles = ['event two', 'event zero', 'event one'].filter((title) => title !== removedTitle).sort()
      await expectRenderedAfterNavigating(calendar, remainingTitles)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/2017
    it.each([
      ['dayGridMonth', '2014-06-25'],
      ['timeGridWeek', '2014-06-25T02:00:00'],
    ])('calls eventWillUnmount when an event is removed, in %s', async (initialView, date) => {
      const eventWillUnmount = vi.fn()
      const calendar = initCalendar({
        ...options,
        initialView,
        scrollTime: '00:00',
        events: [{ id: '1', title: 'event1', date }],
        eventWillUnmount,
      })
      await waitForSettle()
      expect(getEventEls(calendar.el)).toHaveLength(1)
      expect(eventWillUnmount).not.toHaveBeenCalled()

      calendar.getEventById('1')!.remove()
      await waitForSettle()

      expect(getEventEls(calendar.el)).toHaveLength(0)
      expect(eventWillUnmount).toHaveBeenCalled()
      expect(eventWillUnmount.mock.calls[0][0].event.id).toBe('1')
    })
  })

  describe('callbacks', () => {
    const options = {
      initialDate: '2018-09-07',
      initialView: 'dayGridMonth',
    }

    it('calls eventAdd with the added event, whose revert removes it', async () => {
      const eventAdd = vi.fn()
      const calendar = initCalendar({ ...options, eventAdd })
      await waitForSettle()

      calendar.addEvent({ id: 'a', title: 'added', start: '2018-09-10' })
      await waitForSettle()

      expect(eventAdd).toHaveBeenCalledTimes(1)
      const info = eventAdd.mock.calls[0][0]
      expect(info.event.id).toBe('a')
      expect(info.event.startStr).toBe('2018-09-10')
      expect(info.relatedEvents).toEqual([])
      expect(getRenderedEventTitles(calendar.el)).toEqual(['added'])

      info.revert()
      await waitForSettle()
      expect(calendar.getEventById('a')).toBeNull()
      expect(getEventEls(calendar.el)).toHaveLength(0)
    })

    it('doesn\'t call eventAdd for events from sources', async () => {
      const eventAdd = vi.fn()
      const calendar = initCalendar({
        ...options,
        events: [{ id: 'a', start: '2018-09-10' }],
        eventAdd,
      })
      await waitForSettle()
      expect(calendar.getEvents()).toHaveLength(1)

      calendar.addEvent({ id: 'b', start: '2018-09-11' }) // control
      expect(eventAdd).toHaveBeenCalledTimes(1)
      expect(eventAdd.mock.calls[0][0].event.id).toBe('b')
    })

    it('calls eventRemove with the removed event, whose revert restores it', async () => {
      const eventRemove = vi.fn()
      const calendar = initCalendar({
        ...options,
        events: [{ id: 'a', title: 'removed', start: '2018-09-10' }],
        eventRemove,
      })
      await waitForSettle()

      calendar.getEventById('a')!.remove()
      await waitForSettle()

      expect(eventRemove).toHaveBeenCalledTimes(1)
      const info = eventRemove.mock.calls[0][0]
      expect(info.event.id).toBe('a')
      expect(info.relatedEvents).toEqual([])
      expect(getEventEls(calendar.el)).toHaveLength(0)

      info.revert()
      await waitForSettle()
      expect(calendar.getEventById('a')!.title).toBe('removed')
      expect(getRenderedEventTitles(calendar.el)).toEqual(['removed'])
    })

    it('calls eventsSet with all events after they change', async () => {
      const eventsSet = vi.fn()
      const calendar = initCalendar({
        ...options,
        events: [{ id: 'a', start: '2018-09-10' }],
        eventsSet,
      })
      await waitForSettle()
      expect(eventsSet.mock.lastCall![0].map((event) => event.id)).toEqual(['a'])

      calendar.addEvent({ id: 'b', start: '2018-09-11' })
      expect(eventsSet.mock.lastCall![0].map((event) => event.id)).toEqual(['a', 'b'])

      calendar.getEventById('a')!.remove()
      expect(eventsSet.mock.lastCall![0].map((event) => event.id)).toEqual(['b'])
    })
  })
})
