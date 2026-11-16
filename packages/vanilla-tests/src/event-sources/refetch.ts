import { describe, expect, it, vi } from 'vitest'
import { EventInput } from 'fullcalendar'
import { createCalendarElement, initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getRenderedEventTitles, whenLoaded } from '../lib/event-sources'

type SuccessCallback = (events: EventInput[]) => void

/*
Refetching: refetchEvents, EventSourceApi.refetch, and what doesn't refetch.
*/
describe('refetching events', () => {
  const options = {
    initialDate: '2015-08-07',
    initialView: 'timeGridDay',
    scrollTime: '00:00',
  }

  /*
  Sources whose events are titled `<sourceId>-<fetchId>`, `eventCount` times. The config is read at
  fetch time. With `async`, responses wait in `pending` until the test sends them.
  */
  function createSources(sourceIds: string[], config: { fetchId: number, eventCount: number }) {
    const pending: Record<string, (() => void)[]> = {}
    const asyncIds = new Set<string>()

    const eventSources = sourceIds.map((id) => ({
      id,
      events(_info: unknown, callback: SuccessCallback) {
        const events: EventInput[] = []
        for (let i = 0; i < config.eventCount; i++) {
          events.push({ title: `${id}-${config.fetchId}`, start: '2015-08-07T02:00:00', end: '2015-08-07T03:00:00' })
        }
        if (asyncIds.has(id)) {
          (pending[id] ||= []).push(() => callback(events))
        } else {
          callback(events)
        }
      },
    }))

    return { eventSources, pending, asyncIds }
  }

  describe('EventSourceApi.refetch', () => {
    it('replaces only the refetched source\'s events', async () => {
      const config = { fetchId: 7, eventCount: 1 }
      const { eventSources } = createSources(['green0', 'blue', 'green1'], config)
      const calendar = initCalendar({ ...options, eventSources })
      await waitForSettle()
      expect(getRenderedEventTitles(calendar.el)).toEqual(['blue-7', 'green0-7', 'green1-7'])

      config.fetchId = 8
      config.eventCount = 2
      calendar.getEventSourceById('blue')!.refetch()
      await waitForSettle()

      expect(getRenderedEventTitles(calendar.el)).toEqual(['blue-8', 'blue-8', 'green0-7', 'green1-7'])
    })

    it('replaces the events of each refetched source', async () => {
      const config = { fetchId: 7, eventCount: 1 }
      const { eventSources } = createSources(['green0', 'blue', 'green1'], config)
      const calendar = initCalendar({ ...options, eventSources })
      await waitForSettle()

      config.fetchId = 8
      config.eventCount = 2
      calendar.getEventSourceById('green0')!.refetch()
      calendar.getEventSourceById('green1')!.refetch()
      await waitForSettle()

      expect(getRenderedEventTitles(calendar.el)).toEqual(['blue-7', 'green0-8', 'green0-8', 'green1-8', 'green1-8'])
    })

    it('discards the initial fetch\'s response when refetched while it was pending', async () => {
      const config = { fetchId: 7, eventCount: 1 }
      const { eventSources, pending, asyncIds } = createSources(['green0', 'blue', 'green1'], config)
      asyncIds.add('green0')
      asyncIds.add('green1')
      const calendar = initCalendar({ ...options, eventSources })

      config.fetchId = 8
      config.eventCount = 2
      calendar.getEventSourceById('green0')!.refetch()
      calendar.getEventSourceById('green1')!.refetch()
      expect(pending.green0).toHaveLength(2)
      expect(pending.green1).toHaveLength(2)

      // the newer responses arrive first, then the stale ones
      pending.green0[1]()
      pending.green1[1]()
      pending.green0[0]()
      pending.green1[0]()
      await waitForSettle()

      expect(getRenderedEventTitles(calendar.el)).toEqual(['blue-7', 'green0-8', 'green0-8', 'green1-8', 'green1-8'])
    })
  })

  describe('refetchEvents', () => {
    it('replaces all events at once when every source responds synchronously', async () => {
      const config = { fetchId: 0, eventCount: 1 }
      const { eventSources } = createSources(['source1', 'source2', 'source3'], config)
      const calendar = initCalendar({ ...options, initialView: 'timeGridWeek', eventSources })
      await waitForSettle()
      expect(getRenderedEventTitles(calendar.el)).toEqual(['source1-0', 'source2-0', 'source3-0'])

      config.fetchId = 1
      calendar.refetchEvents()
      await waitForSettle()

      expect(getRenderedEventTitles(calendar.el)).toEqual(['source1-1', 'source2-1', 'source3-1'])
    })

    it('keeps the original events until every source has responded', async () => {
      const config = { fetchId: 0, eventCount: 1 }
      const { eventSources, pending, asyncIds } = createSources(['source1', 'source2', 'source3'], config)
      asyncIds.add('source1')
      const calendar = initCalendar({ ...options, initialView: 'timeGridWeek', eventSources })
      pending.source1[0]()
      await waitForSettle()
      expect(getRenderedEventTitles(calendar.el)).toEqual(['source1-0', 'source2-0', 'source3-0'])

      config.fetchId = 1
      calendar.refetchEvents()
      await waitForSettle()
      expect(pending.source1).toHaveLength(2)
      expect(getRenderedEventTitles(calendar.el)).toEqual(['source1-0', 'source2-0', 'source3-0'])

      pending.source1[1]()
      await waitForSettle()
      expect(getRenderedEventTitles(calendar.el)).toEqual(['source1-1', 'source2-1', 'source3-1'])
    })

    it('keeps the scroll position in dayGrid month', async () => {
      const el = createCalendarElement()
      el.style.width = '300px'
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2017-04-25',
        events: Array.from({ length: 8 }, () => ({ start: '2017-04-04', title: 'event' })),
      }, el)
      await waitForSettle()
      expect(getEventEls(calendar.el)).toHaveLength(8)

      const scrollerEl = getScrollerEl(getEventEls(calendar.el)[0])
      scrollerEl.scrollTop = 1000
      const scrollTop = scrollerEl.scrollTop
      expect(scrollTop).toBeGreaterThan(10)

      calendar.refetchEvents()
      await waitForSettle()

      expect(getEventEls(calendar.el)).toHaveLength(8)
      expect(scrollerEl.scrollTop).toBe(scrollTop)
    })

    it('keeps the scroll position in timeGrid after an async refetch', async () => {
      const callbacks: (() => void)[] = []
      const calendar = initCalendar({
        ...options,
        height: 400,
        events(_info, callback) {
          callbacks.push(() => callback([
            { id: '1', start: '2015-08-07T02:00:00', end: '2015-08-07T07:00:00', title: 'event 1' },
            { id: '2', start: '2015-08-07T05:00:00', end: '2015-08-07T22:00:00', title: 'event 2' },
          ]))
        },
      })
      let loaded = whenLoaded(calendar)
      callbacks[0]()
      await loaded

      const scrollerEl = getScrollerEl(getEventEls(calendar.el, '1')[0])
      scrollerEl.scrollTop = 100
      expect(scrollerEl.scrollTop).toBe(100)

      loaded = whenLoaded(calendar)
      calendar.refetchEvents()
      callbacks[1]()
      await loaded

      expect(getEventEls(calendar.el)).toHaveLength(2)
      expect(scrollerEl.scrollTop).toBe(100)
    })
  })

  it('doesn\'t refetch when an unrelated option changes', async () => {
    const events = vi.fn((_info, callback: SuccessCallback) => callback([]))
    const calendar = initCalendar({ initialView: 'dayGridMonth', events })
    await waitForSettle()
    expect(events).toHaveBeenCalledTimes(1)

    calendar.setOption('selectable', true)
    await waitForSettle()
    expect(events).toHaveBeenCalledTimes(1)

    // positive control: an option that affects fetching does refetch
    calendar.setOption('timeZone', 'America/Chicago')
    await waitForSettle()
    expect(events).toHaveBeenCalledTimes(2)
  })
})

/*
The nearest ancestor that scrolls vertically.
*/
function getScrollerEl(el: HTMLElement): HTMLElement {
  for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
    const { overflowY } = getComputedStyle(ancestor)
    if ((overflowY === 'auto' || overflowY === 'scroll') && ancestor.scrollHeight > ancestor.clientHeight) {
      return ancestor
    }
  }
  throw new Error('No vertical scroller')
}
