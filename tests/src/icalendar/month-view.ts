import XHRMock from 'xhr-mock'
import dayGridMonth from '@fullcalendar/daygrid'
import { EventSourceInput } from '@fullcalendar/core'
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
    plugins: [iCalendarPlugin, dayGridMonth],
    initialDate: '2019-04-10', // the start of the three-day event in the feed
    initialView: 'dayGridMonth',
  })

  beforeEach(() => { XHRMock.setup() })
  afterEach(() => { XHRMock.teardown() })

  it('adds an all day event', (done) => {
    loadICalendarWith(alldayEvent, () => {
      setTimeout(() => {
        let events = currentCalendar.getEvents()
        expect(events[0].end).toBe(null)
        events.forEach((event) => expect(event.allDay).toBeTruthy())
        assertEventCount(1)
        done()
      }, 100)
    })
  })

  it('adds a single multi-day event', (done) => {
    loadICalendarWith(multidayEvent, () => {
      setTimeout(() => {
        assertEventCount(1)
        currentCalendar.getEvents().forEach((event) => expect(event.allDay).toBeTruthy())
        done()
      }, 100)
    })
  })

  it('adds multiple multi-day events', (done) => {
    loadICalendarWith(multipleMultidayEvents, () => {
      setTimeout(() => {
        assertEventCount(2)
        currentCalendar.getEvents().forEach((event) => expect(event.allDay).toBeTruthy())
        done()
      }, 100)
    })
  })

  it('adds a one-hour long meeting', (done) => {
    loadICalendarWith(oneHourMeeting, () => {
      setTimeout(() => {
        let events = currentCalendar.getEvents()
        expect(events[0].start).toEqualDate('2019-04-15T09:30:00')
        expect(events[0].end).toEqualDate('2019-04-15T10:30:00')
        assertEventCount(1)
        currentCalendar.getEvents().forEach((event) => expect(event.allDay).not.toBeTruthy())
        done()
      }, 100)
    })
  })

  it('adds a repeating weekly meeting', (done) => {
    loadICalendarWith(recurringWeekly, () => {
      setTimeout(() => {
        let events = currentCalendar.getEvents()
        expect(events[0].start).toEqualDate('2019-04-01T17:30:00')
        expect(events[0].end).toEqualDate('2019-04-01T18:30:00')
        assertEventCount(6)
        done()
      }, 100)
    })
  })

  it('adds a repeating weekly meeting, with null end', (done) => {
    loadICalendarWith(recurringWeeklyWithoutEnd, () => {
      setTimeout(() => {
        let events = currentCalendar.getEvents()
        expect(events[0].start).toEqualDate('2019-04-01T17:30:00')
        expect(events[0].end).toBe(null)
        assertEventCount(6)
        done()
      }, 100)
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6190
  // this feed starts at beginning of previous month (March 2019) and has 9 total occurences,
  // 5 of which will be visible in the current month (April 2019)
  it('adds a repeating weekly meeting, limited by COUNT, but across months', (done) => {
    loadICalendarWith(recurringWeeklyWithCount, () => {
      setTimeout(() => {
        assertEventCount(5)
        done()
      }, 100)
    })
  })

  it('ignores a munged event', (done) => {
    loadICalendarWith(mungedOneHourMeeting, () => {
      setTimeout(() => {
        assertEventCount(0)
        done()
      }, 100)
    })
  })

  it('adds a valid event and ignores a munged event', (done) => {
    loadICalendarWith(multipleEventsOneMunged, () => {
      setTimeout(() => {
        assertEventCount(1)
        done()
      }, 100)
    })
  })

  it('defaultAllDayEventDuration overrides ical default all day length of one day', (done) => {
    loadICalendarWith(
      alldayEvent,
      () => {
        setTimeout(() => {
          assertEventCount(1)
          const event = currentCalendar.getEvents()[0]
          expect(event.end.getDate()).toEqual(event.start.getDate() + 2)
          done()
        }, 100)
      },
      (source) => {
        initCalendar({
          forceEventDuration: true,
          defaultAllDayEventDuration: { days: 2 },
        }).addEventSource(source)
      },
    )
  })

  it('calling refetchEvents request ical feed again', (done) => {
    const feedUrl = '/mock.ics'
    let fetchCnt = 0

    XHRMock.get(feedUrl, (req, res) => {
      fetchCnt += 1
      return res.status(200)
        .header('content-type', ICAL_MIME_TYPE)
        .body(oneHourMeeting)
    })

    const calendar = initCalendar({
      events: {
        url: feedUrl,
        format: 'ics',
      },
    })

    setTimeout(() => {
      expect(fetchCnt).toBe(1)
      expect(calendar.getEvents().length).toBe(1)
      calendar.refetchEvents()

      setTimeout(() => {
        expect(fetchCnt).toBe(2)
        expect(calendar.getEvents().length).toBe(1)
        done()
      }, 100)
    }, 100)
  })

  function loadICalendarWith(rawICal: string, assertions: () => void, calendarSetup?: (source: EventSourceInput) => void) {
    const feedUrl = '/mock.ics'

    XHRMock.get(feedUrl, (req, res) => {
      expect(req.url().query).toEqual({})
      return res.status(200)
        .header('content-type', ICAL_MIME_TYPE)
        .body(rawICal)
    })

    const source = { url: feedUrl, format: 'ics' } as EventSourceInput

    if (calendarSetup) {
      calendarSetup(source)
    } else {
      initCalendar().addEventSource(source)
    }

    assertions()
  }

  // Checks to make sure all events have been rendered and that the calendar
  // has internal info on all the events.
  // TODO: don't use currentCalendar
  function assertEventCount(expectedCount: number) {
    expect(currentCalendar.getEvents().length).toEqual(expectedCount)

    let calendarWrapper = new CalendarWrapper(currentCalendar)
    expect(calendarWrapper.getEventEls().length).toEqual(expectedCount)
  }
})
