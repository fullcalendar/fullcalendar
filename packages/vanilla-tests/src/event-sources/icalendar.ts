import { afterEach, describe, expect, it } from 'vitest'
import fetchMock from 'fetch-mock'
import { Calendar, CalendarOptions } from 'fullcalendar'
import iCalendarPlugin from '@fullcalendar/icalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { whenLoaded } from '../lib/event-sources'
import { getEventTitles } from '../lib/models/event-content'
import allDayEvent from './icalendar-data/all-day-event.ics?raw'
import meetingWithMungedStart from './icalendar-data/meeting-with-munged-start.ics?raw'
import multidayEvent from './icalendar-data/multiday-event.ics?raw'
import multipleEventsOneMunged from './icalendar-data/multiple-events-one-munged.ics?raw'
import multipleMultidayEvents from './icalendar-data/multiple-multiday-events.ics?raw'
import mungedOneHourMeeting from './icalendar-data/munged-one-hour-meeting.ics?raw'
import oneHourMeeting from './icalendar-data/one-hour-meeting.ics?raw'
import recurrenceId from './icalendar-data/recurrence-id.ics?raw'
import recurringWeekly from './icalendar-data/recurring-weekly.ics?raw'
import recurringWeeklyWithCount from './icalendar-data/recurring-weekly-with-count.ics?raw'
import recurringWeeklyWithoutEnd from './icalendar-data/recurring-weekly-without-end.ics?raw'
import timedMeetingWithDuration from './icalendar-data/timed-meeting-with-duration.ics?raw'
import timedMeetingWithoutEnd from './icalendar-data/timed-meeting-without-end.ics?raw'

/*
iCalendar feeds (format: 'ics'), with fetch mocked.
*/
describe('iCalendar event source', () => {
  const FEED_URL = 'https://feed.test/my-feed.ics'
  const options = {
    plugins: [iCalendarPlugin],
    initialView: 'dayGridMonth',
    initialDate: '2019-04-10', // the month shows Mar 31 - May 11
  }

  afterEach(() => {
    fetchMock.restore()
  })

  function mockFeed(ics: string): void {
    fetchMock.get(/my-feed\.ics/, {
      headers: { 'content-type': 'text/calendar' },
      body: ics,
    })
  }

  async function loadFeed(ics: string, extraOptions: CalendarOptions = {}): Promise<Calendar> {
    mockFeed(ics)
    const calendar = initCalendar({
      ...options,
      ...extraOptions,
      events: { url: FEED_URL, format: 'ics' },
    })
    await whenLoaded(calendar)
    return calendar
  }

  function getEventSummaries(calendar: Calendar): [string, string, string | null, boolean][] {
    return calendar.getEvents().map((event) => [event.title, event.startStr, event.endStr || null, event.allDay])
  }

  it('requests the feed URL without range params', async () => {
    const calendar = await loadFeed(oneHourMeeting)

    expect(fetchMock.calls()).toHaveLength(1)
    expect(fetchMock.lastUrl()).toBe(FEED_URL)
    expect(calendar.getEvents()).toHaveLength(1)
  })

  it('adds a timed meeting', async () => {
    const calendar = await loadFeed(oneHourMeeting)

    expect(getEventSummaries(calendar)).toEqual([
      ['Hour long meeting', '2019-04-15T09:30:00Z', '2019-04-15T10:30:00Z', false],
    ])
    expect(getEventEls(calendar.el)).toHaveLength(1)
  })

  it('adds a timed meeting in a named time zone', async () => {
    const calendar = await loadFeed(oneHourMeeting, { timeZone: 'Europe/Paris' })

    expect(getEventSummaries(calendar)).toEqual([
      ['Hour long meeting', '2019-04-15T11:30:00+02:00', '2019-04-15T12:30:00+02:00', false],
    ])
  })

  it('adds an all-day event, with its non-date props', async () => {
    const calendar = await loadFeed(allDayEvent)

    expect(getEventSummaries(calendar)).toEqual([
      ['First conference', '2019-04-15', null, true],
    ])
    const event = calendar.getEvents()[0]
    expect(event.url).toBe('https://fullcalendar.io/')
    expect(event.extendedProps.description).toBe('this is the description')
    expect(event.extendedProps.location).toBe('this is the location')
    expect(getEventEls(calendar.el)).toHaveLength(1)
  })

  it('adds a multi-day event', async () => {
    const calendar = await loadFeed(multidayEvent)

    expect(getEventSummaries(calendar)).toEqual([
      ['First conference', '2019-04-10', '2019-04-13', true],
    ])
    expect(getEventEls(calendar.el)).toHaveLength(1)
  })

  it('adds multiple multi-day events', async () => {
    const calendar = await loadFeed(multipleMultidayEvents)

    expect(getEventSummaries(calendar)).toEqual([
      ['First conference', '2019-04-10', '2019-04-13', true],
      ['Second conference', '2019-04-16', '2019-04-17', true],
    ])
    expect(getEventEls(calendar.el)).toHaveLength(2)
  })

  it('expands a weekly recurring meeting in the visible range, with its non-date props', async () => {
    const calendar = await loadFeed(recurringWeekly)

    const events = calendar.getEvents()
    expect(events.map((event) => event.startStr)).toEqual([
      '2019-04-01T17:30:00Z',
      '2019-04-08T17:30:00Z',
      '2019-04-15T17:30:00Z',
      '2019-04-22T17:30:00Z',
      '2019-04-29T17:30:00Z',
      '2019-05-06T17:30:00Z',
    ])
    expect(events[0].endStr).toBe('2019-04-01T18:30:00Z')
    expect(events[0].title).toBe('Weekly Monday meeting')
    expect(events[0].url).toBe('https://fullcalendar.io/')
    expect(events[0].extendedProps.description).toBe('this is the description')
    expect(events[0].extendedProps.location).toBe('this is the location')
    expect(getEventEls(calendar.el)).toHaveLength(6)
  })

  it('expands a weekly recurring meeting without an end, leaving the end null', async () => {
    const calendar = await loadFeed(recurringWeeklyWithoutEnd)

    const events = calendar.getEvents()
    expect(events).toHaveLength(6)
    expect(events[0].startStr).toBe('2019-04-01T17:30:00Z')
    expect(events[0].end).toBeNull()
    expect(getEventEls(calendar.el)).toHaveLength(6)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6190
  // The 9 occurrences start in March. 5 of them fall in April's visible range.
  it('limits a recurring meeting by COUNT across months', async () => {
    const calendar = await loadFeed(recurringWeeklyWithCount)

    expect(calendar.getEvents().map((event) => event.startStr)).toEqual([
      '2019-04-01T17:30:00Z',
      '2019-04-08T17:30:00Z',
      '2019-04-15T17:30:00Z',
      '2019-04-22T17:30:00Z',
      '2019-04-29T17:30:00Z',
    ])
    expect(getEventEls(calendar.el)).toHaveLength(5)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6451
  it('lets a RECURRENCE-ID event replace its occurrence instead of doubling it', async () => {
    const calendar = await loadFeed(recurrenceId, {
      initialView: 'timeGridDay',
      initialDate: '2021-07-08',
      timeZone: 'Europe/Berlin',
    })

    // the plugin expands a day beyond each side of the range, so neighboring occurrences are present
    expect(getEventSummaries(calendar)).toEqual([
      ['Daily Recurring', '2021-07-07T14:00:00+02:00', '2021-07-07T14:30:00+02:00', false],
      ['Daily Recurring (Update-1)', '2021-07-08T14:15:00+02:00', '2021-07-08T14:45:00+02:00', false],
      ['Daily Recurring', '2021-07-09T14:00:00+02:00', '2021-07-09T14:30:00+02:00', false],
    ])
    const eventEls = getEventEls(calendar.el)
    expect(eventEls).toHaveLength(1)
    expect(eventEls[0].textContent).toContain('Daily Recurring (Update-1)')
  })

  it.each([
    ['without a DTSTART', mungedOneHourMeeting],
    ['with an invalid DTSTART', meetingWithMungedStart],
  ])('ignores an event %s', async (_desc, ics) => {
    const calendar = await loadFeed(ics)

    expect(calendar.getEvents()).toHaveLength(0)
    expect(getEventEls(calendar.el)).toHaveLength(0)
  })

  it('adds the valid event of a feed that also has an invalid one', async () => {
    const calendar = await loadFeed(multipleEventsOneMunged)

    expect(getEventSummaries(calendar)).toEqual([
      ['Valid conference', '2019-04-16', '2019-04-17', true],
    ])
    expect(getEventEls(calendar.el)).toHaveLength(1)
  })

  describe('durations', () => {
    it.each([
      [true, '2019-04-15T12:30:00Z'],
      [false, null],
    ])('with forceEventDuration %s, gives an event without DTEND or DURATION the default duration or null', async (
      forceEventDuration,
      expectedEnd,
    ) => {
      const calendar = await loadFeed(timedMeetingWithoutEnd, {
        forceEventDuration,
        defaultTimedEventDuration: '03:00',
      })

      expect(getEventSummaries(calendar)).toEqual([
        ['Hour long meeting', '2019-04-15T09:30:00Z', expectedEnd, false],
      ])
    })

    it('keeps the DURATION instead of the default duration', async () => {
      const calendar = await loadFeed(timedMeetingWithDuration, {
        forceEventDuration: true,
        defaultTimedEventDuration: '03:00',
      })

      expect(getEventSummaries(calendar)).toEqual([
        ['Hour long meeting', '2019-04-15T09:30:00Z', '2019-04-15T13:30:00Z', false],
      ])
    })

    it('gives an all-day event without an end defaultAllDayEventDuration', async () => {
      const calendar = await loadFeed(allDayEvent, {
        forceEventDuration: true,
        defaultAllDayEventDuration: { days: 2 },
      })

      expect(getEventSummaries(calendar)).toEqual([
        ['First conference', '2019-04-15', '2019-04-17', true],
      ])
    })
  })

  describe('fetching', () => {
    it('doesn\'t request the feed again when navigating', async () => {
      const calendar = await loadFeed(recurringWeekly)
      expect(calendar.getEvents()[0].startStr).toBe('2019-04-01T17:30:00Z')

      const loaded = whenLoaded(calendar)
      calendar.next()
      await loaded

      expect(fetchMock.calls()).toHaveLength(1)
      // May's view, expanded from the already-fetched feed
      expect(calendar.getEvents().map((event) => event.startStr)).toEqual([
        '2019-04-29T17:30:00Z',
        '2019-05-06T17:30:00Z',
        '2019-05-13T17:30:00Z',
        '2019-05-20T17:30:00Z',
        '2019-05-27T17:30:00Z',
        '2019-06-03T17:30:00Z',
      ])
    })

    it('requests the feed again on refetchEvents, replacing the events with the new data', async () => {
      const feeds = [oneHourMeeting, allDayEvent] // the feed changes between requests
      let requestCount = 0
      fetchMock.get(/my-feed\.ics/, () => ({
        headers: { 'content-type': 'text/calendar' },
        body: feeds[requestCount++],
      }))
      const calendar = initCalendar({ ...options, events: { url: FEED_URL, format: 'ics' } })
      await whenLoaded(calendar)
      expect(fetchMock.calls()).toHaveLength(1)
      expect(getEventSummaries(calendar)).toEqual([
        ['Hour long meeting', '2019-04-15T09:30:00Z', '2019-04-15T10:30:00Z', false],
      ])
      expect(getEventTitles(getEventEls(calendar.el))).toEqual(['Hour long meeting'])

      const loaded = whenLoaded(calendar)
      calendar.refetchEvents()
      await loaded

      expect(fetchMock.calls()).toHaveLength(2)
      expect(getEventSummaries(calendar)).toEqual([
        ['First conference', '2019-04-15', null, true],
      ])
      expect(getEventTitles(getEventEls(calendar.el))).toEqual(['First conference'])
    })
  })
})
