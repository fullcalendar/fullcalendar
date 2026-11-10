import { afterEach, describe, expect, it, vi } from 'vitest'
import fetchMock from 'fetch-mock'
import { JsonRequestError } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { whenLoaded } from '../lib/event-sources'

/*
Events from a JSON feed URL. fetch is mocked.
*/
describe('events as a JSON feed', () => {
  const FEED_URL = 'https://feed.test/my-feed.php'
  const options = {
    initialDate: '2014-05-01',
    initialView: 'dayGridMonth',
  }

  afterEach(() => {
    fetchMock.restore()
  })

  function lastRequestParams(): URLSearchParams {
    return new URL(fetchMock.lastUrl()!).searchParams
  }

  describe('request params', () => {
    // the month view shows Apr 27 - Jun 8
    it.each([
      ['local', '2014-04-27T00:00:00-04:00', '2014-06-08T00:00:00-04:00', null],
      ['UTC', '2014-04-27T00:00:00Z', '2014-06-08T00:00:00Z', 'UTC'],
      ['America/Chicago', '2014-04-27T00:00:00-05:00', '2014-06-08T00:00:00-05:00', 'America/Chicago'],
    ])('sends the range and time zone when the timeZone is %s', async (timeZone, start, end, timeZoneParam) => {
      fetchMock.get(/my-feed\.php/, { body: [] })
      const calendar = initCalendar({ ...options, timeZone, events: FEED_URL })
      await whenLoaded(calendar)

      const params = lastRequestParams()
      expect(params.get('start')).toBe(start)
      expect(params.get('end')).toBe(end)
      expect(params.get('timeZone')).toBe(timeZoneParam)
    })

    it('uses custom startParam, endParam and timeZoneParam names', async () => {
      fetchMock.get(/my-feed\.php/, { body: [] })
      const calendar = initCalendar({
        ...options,
        timeZone: 'America/Los_Angeles',
        events: FEED_URL,
        startParam: 'mystart',
        endParam: 'myend',
        timeZoneParam: 'currtz',
      })
      await whenLoaded(calendar)

      const params = lastRequestParams()
      expect(params.get('mystart')).toBe('2014-04-27T00:00:00-07:00')
      expect(params.get('myend')).toBe('2014-06-08T00:00:00-07:00')
      expect(params.get('currtz')).toBe('America/Los_Angeles')
      expect(params.has('start')).toBe(false)
    })

    it('prefers the source\'s startParam, endParam and timeZoneParam names over the calendar\'s', async () => {
      fetchMock.get(/my-feed\.php/, { body: [] })
      const calendar = initCalendar({
        ...options,
        timeZone: 'America/Los_Angeles',
        startParam: 'mystart',
        endParam: 'myend',
        timeZoneParam: 'currtz',
        eventSources: [{
          url: FEED_URL,
          startParam: 'feedstart',
          endParam: 'feedend',
          timeZoneParam: 'feedctz',
        }],
      })
      await whenLoaded(calendar)

      const params = lastRequestParams()
      expect(params.get('feedstart')).toBe('2014-04-27T00:00:00-07:00')
      expect(params.get('feedend')).toBe('2014-06-08T00:00:00-07:00')
      expect(params.get('feedctz')).toBe('America/Los_Angeles')
      expect(params.has('mystart')).toBe(false)
    })

    it('sends a POST with the params in the body', async () => {
      fetchMock.post(/my-feed\.php/, { body: [] })
      const calendar = initCalendar({
        ...options,
        events: { url: FEED_URL, method: 'POST' },
      })
      await whenLoaded(calendar)

      const [url, requestOptions] = fetchMock.lastCall()!
      expect(new URL(url).searchParams.toString()).toBe('')
      expect(requestOptions!.body!.toString())
        .toBe('start=2014-04-27T00%3A00%3A00Z&end=2014-06-08T00%3A00%3A00Z&timeZone=UTC')
    })

    it.each([
      ['an object', { customParam: 'yes' }, 'yes'],
      ['a function', () => ({ customParam: 'heckyeah' }), 'heckyeah'],
    ])('adds extraParams given as %s', async (_desc, extraParams, expectedValue) => {
      fetchMock.get(/my-feed\.php/, { body: [] })
      const calendar = initCalendar({
        ...options,
        eventSources: [{ url: FEED_URL, extraParams }],
      })
      await whenLoaded(calendar)

      const params = lastRequestParams()
      expect(params.get('start')).toBe('2014-04-27T00:00:00Z')
      expect(params.get('end')).toBe('2014-06-08T00:00:00Z')
      expect(params.get('timeZone')).toBe('UTC')
      expect(params.get('customParam')).toBe(expectedValue)
    })
  })

  it('renders the events with the extended source\'s className', async () => {
    fetchMock.get(/my-feed\.php/, {
      body: [{ title: 'my event', start: '2014-05-21' }],
    })
    const calendar = initCalendar({
      ...options,
      eventSources: [{ url: FEED_URL, className: 'customeventclass' }],
    })
    await whenLoaded(calendar)
    await waitForSettle()

    const eventEls = getEventEls(calendar.el)
    expect(eventEls).toHaveLength(1)
    expect(eventEls[0].textContent).toContain('my event')
    expect(eventEls[0].classList).toContain('customeventclass')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5485
  it('refetches and parses events in the new time zone after timeZone changes', async () => {
    fetchMock.get(/my-feed\.php/, (url: string) => ({
      body: [
        new URL(url).searchParams.get('timeZone') === 'America/Chicago'
          ? { start: '2014-06-08T01:00:00' }
          : { start: '2014-06-08T03:00:00' },
      ],
    }))
    const calendar = initCalendar({ ...options, timeZone: 'America/Chicago', events: FEED_URL })
    await whenLoaded(calendar)
    expect(calendar.getEvents().map((event) => event.startStr)).toEqual(['2014-06-08T01:00:00-05:00'])

    const loaded = whenLoaded(calendar)
    calendar.setOption('timeZone', 'America/New_York')
    await loaded
    expect(fetchMock.calls()).toHaveLength(2)
    expect(calendar.getEvents().map((event) => event.startStr)).toEqual(['2014-06-08T03:00:00-04:00'])
  })

  it('calls loading with true, then false', async () => {
    fetchMock.get(/my-feed\.php/, { body: [] })
    const loading = vi.fn()
    const calendar = initCalendar({ ...options, events: { url: FEED_URL }, loading })
    await whenLoaded(calendar)

    expect(loading.mock.calls).toEqual([[true], [false]])
  })

  it('exposes the url on the EventSourceApi', () => {
    fetchMock.get(/my-feed\.php/, { body: [] })
    const calendar = initCalendar({ ...options, events: { url: FEED_URL } })

    expect(calendar.getEventSources()[0].url).toBe(FEED_URL)
  })

  it('reports a JsonRequestError to eventSourceFailure for mangled JSON', async () => {
    fetchMock.get(/my-feed\.php/, { body: '[{title:' })
    const eventSourceFailure = vi.fn()
    const calendar = initCalendar({ ...options, events: { url: FEED_URL }, eventSourceFailure })
    await whenLoaded(calendar)

    expect(eventSourceFailure).toHaveBeenCalledTimes(1)
    const error = eventSourceFailure.mock.calls[0][0]
    expect(error).toBeInstanceOf(JsonRequestError)
    expect(error.message).toBe('Failure parsing JSON')
    expect(error.response.status).toBe(200)
    expect(calendar.getEvents()).toHaveLength(0)
  })

  it('reports a JsonRequestError to eventSourceFailure for an error status', async () => {
    fetchMock.get(/my-feed\.php/, { status: 500, body: [] })
    const eventSourceFailure = vi.fn()
    const calendar = initCalendar({ ...options, events: { url: FEED_URL }, eventSourceFailure })
    await whenLoaded(calendar)

    expect(eventSourceFailure).toHaveBeenCalledTimes(1)
    const error = eventSourceFailure.mock.calls[0][0]
    expect(error).toBeInstanceOf(JsonRequestError)
    expect(error.message).toBe('Request failed')
    expect(error.response.status).toBe(500)
  })
})
