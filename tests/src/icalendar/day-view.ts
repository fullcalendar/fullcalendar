import { default as XHRMock, once } from 'xhr-mock'
import { default as timeGridPlugin } from '@fullcalendar/timegrid'
import { EventSourceInput } from '@fullcalendar/core'
import { default as iCalendarPlugin } from '@fullcalendar/icalendar'
import { default as oneHourMeeting } from './data/oneHourMeeting.js'
import { default as recurringWeekly } from './data/recurringWeekly.js'
import { default as mungedOneHourMeeting } from './data/mungedOneHourMeeting.js'
import { default as meetingWithMungedStart } from './data/meetingWithMungedStart.js'
import { default as alldayEvent } from './data/alldayEvent.js'
import { default as timedMeetingWithoutEnd } from './data/timedMeetingWithoutEnd.js'
import { default as timedMeetingWithDuration } from './data/timedMeetingWithDuration.js'
import { default as dataWithRecurrenceId } from './data/recurrenceId.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('addICalEventSource with day view', () => {
  const ICAL_MIME_TYPE = 'text/calendar'
  const FEED_URL = '/mock.ics'

  pushOptions({
    plugins: [iCalendarPlugin, timeGridPlugin],
    initialDate: '2019-04-15', // The start of the week for oneHourMeeting
    initialView: 'timeGridDay',
    timeZone: 'Europe/Paris',
  })

  beforeEach(() => { XHRMock.setup() })
  afterEach(() => { XHRMock.teardown() })

  it('adds a one-hour long meeting', (done) => {
    loadICalendarWith(oneHourMeeting, () => {
      setTimeout(() => {
        assertEventCount(1)
        done()
      }, 100)
    })
  })

  it('adds a repeating weekly meeting', (done) => {
    loadICalendarWith(recurringWeekly, () => {
      setTimeout(() => {
        assertEventCount(1)
        const event = currentCalendar.getEvents()[0]
        // test non-date props
        expect(event.title).toBe('Weekly Monday meeting')
        expect(event.url).toBe('https://fullcalendar.io/')
        expect(event.extendedProps.description).toBe('this is the description')
        expect(event.extendedProps.location).toBe('this is the location')
        done()
      }, 100)
    })
  })

  it('adds an all day event', (done) => {
    loadICalendarWith(alldayEvent, () => {
      setTimeout(() => {
        assertEventCount(1)
        const events = currentCalendar.getEvents()
        events.forEach((event) => expect(event.allDay).toBeTruthy())
        // test non-date props
        expect(events[0].title).toBe('First conference')
        expect(events[0].url).toBe('https://fullcalendar.io/')
        expect(events[0].extendedProps.description).toBe('this is the description')
        expect(events[0].extendedProps.location).toBe('this is the location')
        done()
      })
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

  it('ignores a meeting with a munged start', (done) => {
    loadICalendarWith(meetingWithMungedStart, () => {
      setTimeout(() => {
        assertEventCount(0)
        done()
      }, 100)
    })
  })

  it('sets default duration when forceEventDuration is enabled and no end or duration included in the VEVENT', (done) => {
    loadICalendarWith(
      timedMeetingWithoutEnd,
      () => {
        setTimeout(() => {
          assertEventCount(1)
          const event = currentCalendar.getEvents()[0]
          expect(event.end.getHours()).toEqual(event.start.getHours() + 3)
          done()
        }, 100)
      },
      (source) => {
        initCalendar({
          forceEventDuration: true,
          defaultTimedEventDuration: '03:00',
        }).addEventSource(source)
      },
    )
  })

  it('sets end to null when forceEventDuration is disabled and no end or duration included in the VEVENT', (done) => {
    loadICalendarWith(
      timedMeetingWithoutEnd,
      () => {
        setTimeout(() => {
          assertEventCount(1)
          const event = currentCalendar.getEvents()[0]
          expect(event.end).toBe(null)
          done()
        }, 100)
      },
      (source) => {
        initCalendar({
          defaultTimedEventDuration: '03:00',
          forceEventDuration: false,
        }).addEventSource(source)
      },
    )
  })

  it('does not override iCal DURATION in VEVENT', (done) => {
    loadICalendarWith(
      timedMeetingWithDuration,
      () => {
        setTimeout(() => {
          assertEventCount(1)
          const event = currentCalendar.getEvents()[0]
          expect(event.end.getHours()).toEqual(event.start.getHours() + 4)
          done()
        }, 100)
      },
      (source) => {
        initCalendar({
          forceEventDuration: true,
          defaultTimedEventDuration: '03:00',
        }).addEventSource(source)
      },
    )
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6451
  it('respects RECURRENCE-ID and does not render double events', (done) => {
    loadICalendarWith(
      dataWithRecurrenceId,
      () => {
        setTimeout(() => {
          let timeGridWrapper = new TimeGridViewWrapper(currentCalendar).timeGrid
          let eventEls = timeGridWrapper.getEventEls()
          expect(eventEls.length).toBe(1)
          done()
        }, 100)
      },
      (source) => {
        initCalendar({
          initialDate: '2021-07-08',
        }).addEventSource(source)
      },
    )
  })

  it('does not reload data on next', (done) => {
    XHRMock.get(FEED_URL, once((req, res) => {
      expect(req.url().query).toEqual({})

      return res.status(200)
        .header('content-type', ICAL_MIME_TYPE)
        .body(timedMeetingWithDuration)
    }))

    initCalendar().addEventSource({ url: FEED_URL, format: 'ics' } as EventSourceInput)

    setTimeout(() => {
      assertEventCount(1)
      XHRMock.get(FEED_URL, () => Promise.reject(new Error('Calendar.next() should not trigger a new XHR')))
      currentCalendar.next()
      done()
    }, 100)
  })

  function loadICalendarWith(
    rawICal: string,
    assertions: () => void,
    calendarSetup?: (source: EventSourceInput) => void,
  ) {
    XHRMock.get(FEED_URL, (req, res) => {
      expect(req.url().query).toEqual({})

      return res.status(200)
        .header('content-type', ICAL_MIME_TYPE)
        .body(rawICal)
    })

    const source = { url: FEED_URL, format: 'ics' } as EventSourceInput

    if (calendarSetup) {
      calendarSetup(source)
    } else {
      initCalendar().addEventSource(source)
    }

    assertions()
  }

  // Checks to make sure all events have been rendered and that the calendar
  // has internal info on all the events.
  function assertEventCount(expectedCount: number) {
    expect(currentCalendar.getEvents().length).toEqual(expectedCount)

    let calendarWrapper = new CalendarWrapper(currentCalendar)
    expect(calendarWrapper.getEventEls().length).toEqual(expectedCount)
  }
})
