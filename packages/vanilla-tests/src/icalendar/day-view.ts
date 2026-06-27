import fetchMock from 'fetch-mock'
import timeGridPlugin from 'fullcalendar/timegrid'
import { EventSourceInput } from 'fullcalendar'
import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import iCalendarPlugin from '@fullcalendar/icalendar'
import oneHourMeeting from './data/oneHourMeeting'
import recurringWeekly from './data/recurringWeekly'
import mungedOneHourMeeting from './data/mungedOneHourMeeting'
import meetingWithMungedStart from './data/meetingWithMungedStart'
import alldayEvent from './data/alldayEvent'
import timedMeetingWithoutEnd from './data/timedMeetingWithoutEnd'
import timedMeetingWithDuration from './data/timedMeetingWithDuration'
import dataWithRecurrenceId from './data/recurrenceId'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('addICalEventSource with day view', () => {
  const ICAL_MIME_TYPE = 'text/calendar'

  pushOptions({
    plugins: [iCalendarPlugin, classicThemePlugin, themeForTestsPlugin, timeGridPlugin],
    initialDate: '2019-04-15', // The start of the week for oneHourMeeting
    initialView: 'timeGridDay',
    timeZone: 'Europe/Paris',
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('adds a one-hour long meeting', (done) => {
    loadICalendarWith(oneHourMeeting, (calendar) => {
      setTimeout(() => {
        assertEventCount(calendar, 1)
        done()
      }, 100)
    })
  })

  it('adds a repeating weekly meeting', (done) => {
    loadICalendarWith(recurringWeekly, (calendar) => {
      setTimeout(() => {
        assertEventCount(calendar, 1)
        const event = calendar.getEvents()[0]
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
    loadICalendarWith(alldayEvent, (calendar) => {
      setTimeout(() => {
        assertEventCount(calendar, 1)
        const events = calendar.getEvents()
        events.forEach((event) => expect(event.allDay).toBeTruthy())
        // test non-date props
        expect(events[0].title).toBe('First conference')
        expect(events[0].url).toBe('https://fullcalendar.io/')
        expect(events[0].extendedProps.description).toBe('this is the description')
        expect(events[0].extendedProps.location).toBe('this is the location')
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

  it('ignores a meeting with a munged start', (done) => {
    loadICalendarWith(meetingWithMungedStart, (calendar) => {
      setTimeout(() => {
        assertEventCount(calendar, 0)
        done()
      }, 100)
    })
  })

  it('sets default duration when forceEventDuration is enabled and no end or duration included in the VEVENT', (done) => {
    loadICalendarWith(
      timedMeetingWithoutEnd,
      (calendar) => {
        setTimeout(() => {
          assertEventCount(calendar, 1)
          const event = calendar.getEvents()[0]
          expect(event.end.getHours()).toEqual(event.start.getHours() + 3)
          done()
        }, 100)
      },
      (source) => {
        const calendar = initCalendar({
          forceEventDuration: true,
          defaultTimedEventDuration: '03:00',
        })
        calendar.addEventSource(source)
        return calendar
      },
    )
  })

  it('sets end to null when forceEventDuration is disabled and no end or duration included in the VEVENT', (done) => {
    loadICalendarWith(
      timedMeetingWithoutEnd,
      (calendar) => {
        setTimeout(() => {
          assertEventCount(calendar, 1)
          const event = calendar.getEvents()[0]
          expect(event.end).toBe(null)
          done()
        }, 100)
      },
      (source) => {
        const calendar = initCalendar({
          defaultTimedEventDuration: '03:00',
          forceEventDuration: false,
        })
        calendar.addEventSource(source)
        return calendar
      },
    )
  })

  it('does not override iCal DURATION in VEVENT', (done) => {
    loadICalendarWith(
      timedMeetingWithDuration,
      (calendar) => {
        setTimeout(() => {
          assertEventCount(calendar, 1)
          const event = calendar.getEvents()[0]
          expect(event.end.getHours()).toEqual(event.start.getHours() + 4)
          done()
        }, 100)
      },
      (source) => {
        const calendar = initCalendar({
          forceEventDuration: true,
          defaultTimedEventDuration: '03:00',
        })
        calendar.addEventSource(source)
        return calendar
      },
    )
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6451
  it('respects RECURRENCE-ID and does not render double events', (done) => {
    loadICalendarWith(
      dataWithRecurrenceId,
      (calendar) => {
        setTimeout(() => {
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          let eventEls = timeGridWrapper.getEventEls()
          expect(eventEls.length).toBe(1)
          done()
        }, 100)
      },
      (source) => {
        const calendar = initCalendar({
          initialDate: '2021-07-08',
        })
        calendar.addEventSource(source)
        return calendar
      },
    )
  })

  it('does not reload data on next', (done) => {
    let requestCnt = 0

    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, () => {
      requestCnt++
      return {
        headers: { 'content-type': ICAL_MIME_TYPE },
        body: timedMeetingWithDuration,
      }
    })

    const calendar = initCalendar()
    calendar.addEventSource({ url: givenUrl, format: 'ics' } as EventSourceInput)

    setTimeout(() => {
      assertEventCount(calendar, 1)
      calendar.next()
      expect(requestCnt).toBe(1)
      done()
    }, 100)
  })

  function loadICalendarWith(
    rawICal: string,
    assertions: (calendar) => void,
    calendarSetup?: (source: EventSourceInput) => any,
  ) {
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
