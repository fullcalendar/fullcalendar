import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fetchMock from 'fetch-mock'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls, getResizerEls } from '../lib/models/events'
import { whenLoaded } from '../lib/event-sources'

/*
The Google Calendar plugin, against a mock of the Calendar API's events endpoint.
*/
describe('Google Calendar event source', () => {
  const API_KEY = 'test-api-key'
  const CALENDAR_ID = 'en.usa#holiday@group.v.calendar.google.com'
  const HOLIDAYS = [
    { id: 'mothers-day', summary: 'Mother\'s Day', date: '2025-05-11', end: '2025-05-12' },
    { id: 'armed-forces-day', summary: 'Armed Forces Day', date: '2025-05-17', end: '2025-05-18' },
    { id: 'memorial-day', summary: 'Memorial Day', date: '2025-05-26', end: '2025-05-27' },
  ]
  const options = {
    plugins: [googleCalendarPlugin],
    initialView: 'dayGridMonth',
    initialDate: '2025-05-01',
  }

  let extraItems: unknown[] = [] // raw API items a test adds after the holidays

  beforeEach(() => {
    extraItems = []
    fetchMock.get(/^https:\/\/www\.googleapis\.com\/calendar\/v3\/calendars\//, (requestUrl: string) => {
      const url = new URL(requestUrl)

      if (url.searchParams.get('key') !== API_KEY) {
        return {
          status: 400,
          body: { error: { code: 400, message: 'API key not valid. Please pass a valid API key.' } },
        }
      }

      if (decodeURIComponent(url.pathname.split('/')[4]) !== CALENDAR_ID) {
        return { status: 404, body: { error: { code: 404, message: 'Not Found' } } }
      }

      return {
        body: {
          items: [...HOLIDAYS.map((holiday) => ({
            id: holiday.id,
            summary: holiday.summary,
            start: { date: holiday.date },
            end: { date: holiday.end },
            htmlLink: 'https://www.google.com/calendar/event?eid=' + holiday.id,
          })), ...extraItems],
        },
      }
    })
  })

  afterEach(() => {
    fetchMock.restore()
  })

  function lastRequestParams(): URLSearchParams {
    return new URL(fetchMock.lastUrl()!).searchParams
  }

  it('requests the visible range and parses the items as all-day events', async () => {
    const calendar = initCalendar({
      ...options,
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: CALENDAR_ID },
    })
    await whenLoaded(calendar)

    const params = lastRequestParams()
    expect(params.get('key')).toBe(API_KEY)
    expect(params.get('timeMin')).toBe('2025-04-27T00:00:00Z')
    expect(params.get('timeMax')).toBe('2025-06-08T00:00:00Z')
    expect(params.get('singleEvents')).toBe('true')

    const events = calendar.getEvents()
    expect(events.map((event) => [event.id, event.title, event.startStr, event.endStr, event.allDay])).toEqual([
      ['mothers-day', 'Mother\'s Day', '2025-05-11', '2025-05-12', true],
      ['armed-forces-day', 'Armed Forces Day', '2025-05-17', '2025-05-18', true],
      ['memorial-day', 'Memorial Day', '2025-05-26', '2025-05-27', true],
    ])
    expect(getEventEls(calendar.el)).toHaveLength(3)
  })

  it.each([
    ['UTC', '2025-05-14T14:00:00Z', '2025-05-14T15:30:00Z'],
    ['local', '2025-05-14T10:00:00-04:00', '2025-05-14T11:30:00-04:00'], // the test browser's zone is America/New_York
  ])('parses an item with offset dateTimes as a timed event, in the %s time zone', async (timeZone, startStr, endStr) => {
    extraItems = [{
      id: 'meeting',
      summary: 'Meeting',
      start: { dateTime: '2025-05-14T10:00:00-04:00' },
      end: { dateTime: '2025-05-14T11:30:00-04:00' },
      htmlLink: 'https://www.google.com/calendar/event?eid=meeting',
    }]
    const calendar = initCalendar({
      ...options,
      timeZone,
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: CALENDAR_ID },
    })
    await whenLoaded(calendar)

    const event = calendar.getEventById('meeting')!
    expect([event.title, event.startStr, event.endStr, event.allDay]).toEqual(['Meeting', startStr, endStr, false])
    expect(event.start!.toISOString()).toBe('2025-05-14T14:00:00.000Z')
    expect(event.end!.toISOString()).toBe('2025-05-14T15:30:00.000Z')
    expect(calendar.getEvents()).toHaveLength(4)
    expect(getEventEls(calendar.el, 'meeting')).toHaveLength(1)
  })

  it.each([
    ['local', null],
    ['UTC', 'UTC'],
    ['America/New_York', 'America/New_York'],
  ])('passes the %s time zone to the request and to the event links', async (timeZone, expectedParam) => {
    const calendar = initCalendar({
      ...options,
      timeZone,
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: CALENDAR_ID },
    })
    await whenLoaded(calendar)

    expect(lastRequestParams().get('timeZone')).toBe(expectedParam)

    const urls = calendar.getEvents().map((event) => event.url)
    expect(urls).toHaveLength(3)
    for (const url of urls) {
      if (expectedParam) {
        expect(url).toContain('ctz=' + expectedParam)
      } else {
        expect(url).not.toContain('ctz=')
      }
    }
  })

  // Only the source's (or calendar's) editable setting decides. The plugin sets no default of its own.
  it.each([
    ['not set', {}, false],
    ['true', { editable: true }, true],
  ])('makes events resizable only when the source\'s editable is true (%s)', async (_desc, sourceOptions, isEditable) => {
    const calendar = initCalendar({
      ...options,
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: CALENDAR_ID, ...sourceOptions },
    })
    await whenLoaded(calendar)

    const eventEls = getEventEls(calendar.el)
    expect(eventEls).toHaveLength(3)
    for (const eventEl of eventEls) {
      expect(getResizerEls(eventEl).length > 0).toBe(isEditable)
    }
  })

  /*
  KNOWN BUG (`it.fails` until fixed): the plugin's parseMeta recognizes a string source's URL as a
  calendar ID or Calendar API URL, but never gets the chance. Built-in sources are global plugins,
  which buildPluginHooks adds after the calendar's own plugins, and later-added source defs take
  precedence, so the JSON feed source claims every string and fetches it as a relative URL.
  */
  it.fails.each([
    ['a calendar ID', CALENDAR_ID],
    ['a Calendar API URL', 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(CALENDAR_ID) + '/events'],
  ])('accepts %s as a plain string source', async (_desc, source) => {
    fetchMock.catch({ body: [] }) // what the JSON feed source requests instead
    const calendar = initCalendar({
      ...options,
      googleCalendarApiKey: API_KEY,
      eventSources: [source],
    })
    await whenLoaded(calendar)

    expect(fetchMock.lastUrl()).toMatch(/^https:\/\/www\.googleapis\.com\/calendar\/v3\/calendars\//)
    expect(calendar.getEvents()).toHaveLength(3)
  })

  it('accepts the API key on the event source', async () => {
    const calendar = initCalendar({
      ...options,
      events: { googleCalendarId: CALENDAR_ID, googleCalendarApiKey: API_KEY },
    })
    await whenLoaded(calendar)

    expect(lastRequestParams().get('key')).toBe(API_KEY)
    expect(calendar.getEvents()).toHaveLength(3)
  })

  it.each([
    ['no API key', {}, 0],
    ['a bad API key', { googleCalendarApiKey: 'asdfasdfasdf' }, 1],
  ])('with %s, calls the failure handlers and adds no events', async (_desc, keyOptions, expectedRequests) => {
    const failure = vi.fn()
    const eventSourceFailure = vi.fn()
    const calendar = initCalendar({
      ...options,
      ...keyOptions,
      events: { googleCalendarId: CALENDAR_ID, failure },
      eventSourceFailure,
    })
    if (expectedRequests) {
      await whenLoaded(calendar)
    }

    expect(fetchMock.calls()).toHaveLength(expectedRequests)
    expect(failure).toHaveBeenCalledTimes(1)
    expect(failure.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(eventSourceFailure).toHaveBeenCalledTimes(1)
    expect(eventSourceFailure.mock.calls[0][0]).toBe(failure.mock.calls[0][0])
    expect(calendar.getEvents()).toHaveLength(0)
  })

  it('calls loading with true, then false', async () => {
    const loading = vi.fn()
    const calendar = initCalendar({
      ...options,
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: CALENDAR_ID },
      loading,
    })
    expect(loading.mock.calls).toEqual([[true]])
    await whenLoaded(calendar)

    expect(loading.mock.calls).toEqual([[true], [false]])
  })

  it('removes the source\'s events with EventSourceApi.remove()', async () => {
    const calendar = initCalendar({
      ...options,
      googleCalendarApiKey: API_KEY,
      eventSources: [{ googleCalendarId: CALENDAR_ID }],
    })
    await whenLoaded(calendar)
    expect(calendar.getEvents()).toHaveLength(3)

    calendar.getEventSources()[0].remove()

    expect(calendar.getEvents()).toHaveLength(0)
  })
})
