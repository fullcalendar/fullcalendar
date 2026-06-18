import fetchMock from 'fetch-mock'
import dayGridMonth from 'fullcalendar/daygrid'
import { EventSourceInput } from 'fullcalendar'
import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import iCalendarPlugin from '@fullcalendar/icalendar'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import alldayEvent from './data/alldayEvent'
import multidayEvent from './data/multidayEvent'
import multipleMultidayEvents from './data/multipleMultidayEvents'
import multipleEventsOneMunged from './data/multipleEventsOneMunged'
import oneHourMeeting from './data/oneHourMeeting'
import recurringWeekly from './data/recurringWeekly'
import recurringWeeklyWithoutEnd from './data/recurringWeeklyWithoutEnd'
import recurringWeeklyWithCount from './data/recurringWeeklyWithCount'
import mungedOneHourMeeting from './data/mungedOneHourMeeting'

describe('addICalEventSource with month view', () => {
  const ICAL_MIME_TYPE = 'text/calendar'

  pushOptions({
    plugins: [iCalendarPlugin, dayGridMonth, classicThemePlugin, themeForTestsPlugin],
    initialDate: '2019-04-10', // the start of the three-day event in the feed
    initialView: 'dayGridMonth',
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('adds an all day event', (done) => {
    loadICalendarWith(alldayEvent, (calendar) => {
      setTimeout(() => {
        let events = calendar.getEvents()
        expect(events[0].end).toBe(null)
        events.forEach((event) => expect(event.allDay).toBeTruthy())
        assertEventCount(calendar, 1)
        done()
      }, 100)
    })
  })

  it('adds a single multi-day event', (done) => {
    loadICalendarWith(multidayEvent, (calendar) => {
      setTimeout(() => {
        assertEventCount(calendar, 1)
        calendar.getEvents().forEach((event) => expect(event.allDay).toBeTruthy())
        done()
      }, 100)
    })
  })

  it('adds multiple multi-day events', (done) => {
    loadICalendarWith(multipleMultidayEvents, (calendar) => {
      setTimeout(() => {
        assertEventCount(calendar, 2)
        calendar.getEvents().forEach((event) => expect(event.allDay).toBeTruthy())
        done()
      }, 100)
    })
  })

  it('adds a one-hour long meeting', (done) => {
    loadICalendarWith(oneHourMeeting, (calendar) => {
      setTimeout(() => {
        let events = calendar.getEvents()
        expect(events[0].start).toEqualDate('2019-04-15T09:30:00')
        expect(events[0].end).toEqualDate('2019-04-15T10:30:00')
        assertEventCount(calendar, 1)
        calendar.getEvents().forEach((event) => expect(event.allDay).not.toBeTruthy())
        done()
      }, 100)
    })
  })

  it('adds a repeating weekly meeting', (done) => {
    loadICalendarWith(recurringWeekly, (calendar) => {
      setTimeout(() => {
        let events = calendar.getEvents()
        expect(events[0].start).toEqualDate('2019-04-01T17:30:00')
        expect(events[0].end).toEqualDate('2019-04-01T18:30:00')
        assertEventCount(calendar, 6)
        done()
      }, 100)
    })
  })

  it('adds a repeating weekly meeting, with null end', (done) => {
    loadICalendarWith(recurringWeeklyWithoutEnd, (calendar) => {
      setTimeout(() => {
        let events = calendar.getEvents()
        expect(events[0].start).toEqualDate('2019-04-01T17:30:00')
        expect(events[0].end).toBe(null)
        assertEventCount(calendar, 6)
        done()
      }, 100)
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6190
  // this feed starts at beginning of previous month (March 2019) and has 9 total occurences,
  // 5 of which will be visible in the current month (April 2019)
  it('adds a repeating weekly meeting, limited by COUNT, but across months', (done) => {
    loadICalendarWith(recurringWeeklyWithCount, (calendar) => {
      setTimeout(() => {
        assertEventCount(calendar, 5)
        done()
      }, 100)
    })
  })

  it('ignores a munged event', (done) => {
    loadICalendarWith(mungedOneHourMeeting, (calendar) => {
      setTimeout(() => {
        assertEventCount(calendar, 0)
        done()
      }, 100)
    })
  })

  it('adds a valid event and ignores a munged event', (done) => {
    loadICalendarWith(multipleEventsOneMunged, (calendar) => {
      setTimeout(() => {
        assertEventCount(calendar, 1)
        done()
      }, 100)
    })
  })

  it('defaultAllDayEventDuration overrides ical default all day length of one day', (done) => {
    loadICalendarWith(
      alldayEvent,
      (calendar) => {
        setTimeout(() => {
          assertEventCount(calendar, 1)
          const event = calendar.getEvents()[0]
          expect(event.end.getDate()).toEqual(event.start.getDate() + 2)
          done()
        }, 100)
      },
      (source) => {
        const calendar = initCalendar({
          forceEventDuration: true,
          defaultAllDayEventDuration: { days: 2 },
        })
        calendar.addEventSource(source)
        return calendar
      },
    )
  })

  it('calling refetchEvents request ical feed again', (done) => {
    let requestCnt = 0

    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, () => {
      requestCnt++
      return {
        headers: { 'content-type': ICAL_MIME_TYPE },
        body: oneHourMeeting,
      }
    })

    const calendar = initCalendar({
      events: {
        url: givenUrl,
        format: 'ics',
      },
    })

    setTimeout(() => {
      expect(requestCnt).toBe(1)
      expect(calendar.getEvents().length).toBe(1)
      calendar.refetchEvents()

      setTimeout(() => {
        expect(requestCnt).toBe(2)
        expect(calendar.getEvents().length).toBe(1)
        done()
      }, 100)
    }, 100)
  })

  function loadICalendarWith(rawICal: string, assertions: (calendar) => void, calendarSetup?: (source: EventSourceInput) => any) {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, {
      headers: { 'content-type': ICAL_MIME_TYPE },
      body: rawICal,
    })

    const source = { url: givenUrl, format: 'ics' } as EventSourceInput

    let calendar

    if (calendarSetup) {
      calendar = calendarSetup(source)
    } else {
      calendar = initCalendar()
      calendar.addEventSource(source)
    }

    const [requestUrl] = fetchMock.lastCall()
    const requestParamStr = new URL(requestUrl).searchParams.toString()
    expect(requestParamStr).toBe('')

    assertions(calendar)
  }

  // Checks to make sure all events have been rendered and that the calendar
  // has internal info on all the events.
  function assertEventCount(calendar, expectedCount: number) {
    expect(calendar.getEvents().length).toEqual(expectedCount)

    let calendarWrapper = new CalendarWrapper(calendar)
    expect(calendarWrapper.getEventEls().length).toEqual(expectedCount)
  }
})
