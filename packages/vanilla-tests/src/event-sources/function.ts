import { describe, expect, it, vi } from 'vitest'
import { EventInput, EventSourceFunc, EventSourceFuncInfo } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { createDeferred, whenLoaded } from '../lib/event-sources'

type SuccessCallback = (events: EventInput[]) => void

/*
Events from a function, and the callbacks around fetching (loading, eventSourceSuccess, eventSourceFailure).
*/
describe('events as a function', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-05-01', // the month shows Apr 27 - Jun 8
  }

  function getFetchArg(events: ReturnType<typeof vi.fn>, callIndex = 0): EventSourceFuncInfo {
    return events.mock.calls[callIndex][0]
  }

  describe('the fetch info', () => {
    it.each([
      ['local', '2014-04-27T00:00:00-04:00', '2014-04-27T04:00:00.000Z', '2014-06-08T00:00:00-04:00', '2014-06-08T04:00:00.000Z'],
      ['UTC', '2014-04-27T00:00:00Z', '2014-04-27T00:00:00.000Z', '2014-06-08T00:00:00Z', '2014-06-08T00:00:00.000Z'],
      ['America/Chicago', '2014-04-27T00:00:00-05:00', '2014-04-27T05:00:00.000Z', '2014-06-08T00:00:00-05:00', '2014-06-08T05:00:00.000Z'],
    ])('has the range in the %s time zone', (timeZone, startStr, startIso, endStr, endIso) => {
      const events = vi.fn((_info, callback: SuccessCallback) => callback([]))
      initCalendar({ ...options, timeZone, events })

      expect(events).toHaveBeenCalledTimes(1)
      const info = getFetchArg(events)
      expect(info.timeZone).toBe(timeZone)
      expect(info.startStr).toBe(startStr)
      expect(info.start.toISOString()).toBe(startIso)
      expect(info.endStr).toBe(endStr)
      expect(info.end.toISOString()).toBe(endIso)
      expect(typeof events.mock.calls[0][1]).toBe('function')
    })

    it('refetches with the new time zone when timeZone changes', async () => {
      const events = vi.fn((_info, callback: SuccessCallback) => callback([]))
      const calendar = initCalendar({ ...options, timeZone: 'America/Chicago', events })
      await waitForSettle()

      calendar.setOption('timeZone', 'UTC')
      await waitForSettle()

      expect(events).toHaveBeenCalledTimes(2)
      expect(getFetchArg(events, 0).timeZone).toBe('America/Chicago')
      expect(getFetchArg(events, 0).start.toISOString()).toBe('2014-04-27T05:00:00.000Z')
      expect(getFetchArg(events, 1).timeZone).toBe('UTC')
      expect(getFetchArg(events, 1).start.toISOString()).toBe('2014-04-27T00:00:00.000Z')
      expect(getFetchArg(events, 1).end.toISOString()).toBe('2014-06-08T00:00:00.000Z')
    })

    it.each([
      [
        'excludes hidden days at the start and end of the month',
        // June 2013 starts on a Saturday and ends on a Sunday
        { initialDate: '2013-06-01', weekends: false, fixedWeekCount: false },
        '2013-06-03T00:00:00Z',
        '2013-06-29T00:00:00Z',
      ],
      [
        'excludes dates hidden by showNonCurrentDates: false',
        { initialDate: '2013-06-01', showNonCurrentDates: false },
        '2013-06-01T00:00:00Z',
        '2013-07-01T00:00:00Z',
      ],
      [
        'starts before the first day when slotMinTime is negative',
        { initialView: 'timeGridWeek', initialDate: '2017-06-08', slotMinTime: { hours: -2 } },
        '2017-06-03T22:00:00Z',
        '2017-06-11T00:00:00Z',
      ],
      [
        'ends after the last day when slotMaxTime exceeds 24 hours',
        { initialView: 'timeGridWeek', initialDate: '2017-06-08', slotMaxTime: '26:00' },
        '2017-06-04T00:00:00Z',
        '2017-06-11T02:00:00Z',
      ],
    ])('has a range that %s', (_desc, rangeOptions, startStr, endStr) => {
      const events = vi.fn((_info, callback: SuccessCallback) => callback([]))
      initCalendar({ ...options, ...rangeOptions, events })

      expect(events).toHaveBeenCalledTimes(1)
      expect(getFetchArg(events).startStr).toBe(startStr)
      expect(getFetchArg(events).endStr).toBe(endStr)
    })
  })

  it('renders events from the extended source form, with its className', async () => {
    const events = vi.fn((_info, callback: SuccessCallback) => {
      callback([{ title: 'event1', start: '2014-05-10' }])
    })
    const calendar = initCalendar({
      ...options,
      eventSources: [{ className: 'customeventclass', events }],
    })
    await waitForSettle()

    expect(events).toHaveBeenCalledTimes(1)
    expect(getFetchArg(events).startStr).toBe('2014-04-27T00:00:00Z')
    const eventEls = getEventEls(calendar.el)
    expect(eventEls).toHaveLength(1)
    expect(eventEls[0].textContent).toContain('event1')
    expect(eventEls[0].classList).toContain('customeventclass')
  })

  /*
  A minimal non-native thenable: only a then(onFulfilled, onRejected) method.
  */
  function createThenable(): { promise: Promise<EventInput[]>, resolve: (events: EventInput[]) => void } {
    let onFulfilledSaved: ((events: EventInput[]) => void) | null = null
    const thenable = {
      then(onFulfilled: (events: EventInput[]) => void, _onRejected: (error: unknown) => void) {
        onFulfilledSaved = onFulfilled
      },
    }
    return {
      promise: thenable as unknown as Promise<EventInput[]>,
      resolve: (events) => onFulfilledSaved!(events),
    }
  }

  it.each([
    ['promise', () => createDeferred<EventInput[]>()],
    ['non-native thenable', createThenable],
  ])('accepts a returned %s', async (_desc, createResult) => {
    const result = createResult()
    const calendar = initCalendar({ ...options, events: () => result.promise })
    expect(calendar.getEvents()).toHaveLength(0)

    const loaded = whenLoaded(calendar)
    result.resolve([{ start: '2014-05-04' }])
    await loaded

    expect(calendar.getEvents().map((event) => event.startStr)).toEqual(['2014-05-04'])
    expect(getEventEls(calendar.el)).toHaveLength(1)
  })

  it('calls eventSourceFailure when a returned promise rejects, and finishes loading', async () => {
    const error = new Error('my error')
    const deferred = createDeferred<EventInput[]>()
    const loading = vi.fn()
    const eventSourceFailure = vi.fn()
    const calendar = initCalendar({ ...options, loading, eventSourceFailure, events: () => deferred.promise })
    expect(loading.mock.calls).toEqual([[true]])

    const loaded = whenLoaded(calendar)
    deferred.reject(error)
    await loaded

    expect(eventSourceFailure).toHaveBeenCalledTimes(1)
    expect(eventSourceFailure.mock.calls[0][0]).toBe(error)
    expect(loading.mock.calls).toEqual([[true], [false]])
    expect(calendar.getEvents()).toHaveLength(0)
    expect(getEventEls(calendar.el)).toHaveLength(0)
  })

  describe('loading', () => {
    it('is called with true when fetching starts and false when the callback is called', async () => {
      const loading = vi.fn()
      const deferred = createDeferred()
      const calendar = initCalendar({
        ...options,
        loading,
        events(_info, callback) {
          deferred.promise.then(() => callback([]))
        },
      })
      expect(loading.mock.calls).toEqual([[true]])

      const loaded = whenLoaded(calendar)
      deferred.resolve()
      await loaded

      expect(loading.mock.calls).toEqual([[true], [false]])
    })

    it('is called only once each way for multiple sources', async () => {
      const loading = vi.fn()
      const deferred0 = createDeferred()
      const deferred1 = createDeferred()
      const calendar = initCalendar({
        ...options,
        loading,
        eventSources: [
          (_info, callback) => {
            deferred0.promise.then(() => callback([]))
          },
          (_info, callback) => {
            deferred1.promise.then(() => callback([]))
          },
        ],
      })

      deferred0.resolve()
      await deferred0.promise
      await waitForSettle()
      expect(loading.mock.calls).toEqual([[true]]) // still waiting on the second source

      const loaded = whenLoaded(calendar)
      deferred1.resolve()
      await loaded
      expect(loading.mock.calls).toEqual([[true], [false]])
    })
  })

  it('passes an error given to the failure callback to eventSourceFailure', () => {
    const error = new Error('my error')
    const eventSourceFailure = vi.fn()
    const calendar = initCalendar({
      ...options,
      events(_info, _successCallback, failureCallback) {
        failureCallback(error)
      },
      eventSourceFailure,
    })

    expect(eventSourceFailure).toHaveBeenCalledTimes(1)
    expect(eventSourceFailure.mock.calls[0][0]).toBe(error)
    expect(calendar.getEvents()).toHaveLength(0)
  })

  describe('eventSourceSuccess', () => {
    // EventSourceFunc types the callback's arg as EventInput[], though a success transform accepts any response
    const fetchWrapped = ((_info: EventSourceFuncInfo, callback: (response: unknown) => void) => {
      callback({ something: [{ title: 'hi', start: '2014-05-01' }] })
    }) as EventSourceFunc

    it('transforms the response when set on the calendar', () => {
      const eventSourceSuccess = vi.fn((response) => response.something)
      const calendar = initCalendar({ ...options, eventSources: [fetchWrapped], eventSourceSuccess })

      expect(eventSourceSuccess).toHaveBeenCalledTimes(1)
      expect(calendar.getEvents().map((event) => event.title)).toEqual(['hi'])
    })

    it('transforms the response when set on the source as success', () => {
      const success = vi.fn((response) => response.something)
      const calendar = initCalendar({ ...options, eventSources: [{ events: fetchWrapped, success }] })

      expect(success).toHaveBeenCalledTimes(1)
      expect(calendar.getEvents().map((event) => event.title)).toEqual(['hi'])
    })
  })
})
