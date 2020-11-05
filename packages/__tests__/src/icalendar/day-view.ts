import XHRMock from 'xhr-mock'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import timeGridPlugin from '@fullcalendar/timegrid'
import { EventSourceInput } from '@fullcalendar/core'
import iCalendarPlugin from '../../../icalendar/main'

import oneHourMeeting from './data/oneHourMeeting'
import recurringWeeklyMeeting from './data/recurringWeeklyMeeting'
import mungedOneHourMeeting from './data/mungedOneHourMeeting'
import meetingWithMungedStart from './data/meetingWithMungedStart'
import alldayEvent from './data/alldayEvent'
import timedMeetingWithoutEnd from './data/timedMeetingWithoutEnd'
import timedMeetingWithDuration from './data/timedMeetingWithDuration'

describe('addICalEventSource with week view', function() {
  const ICAL_MIME_TYPE = 'text/calendar'

  pushOptions({
    plugins: [ iCalendarPlugin, timeGridPlugin ],
    initialDate: '2019-04-15', // The start of the week for oneHourMeeting
    initialView: 'timeGridDay',
    timeZone: 'Europe/Paris',
  })

  beforeEach(function() { XHRMock.setup() })

  afterEach(function() { XHRMock.teardown() })

  it('correctly adds a one-hour long meeting', (done) => {
    loadICalendarWith(oneHourMeeting, () => {
      setTimeout(() => {
        assertEventCount(1)
        done()
      }, 100)
    })
	})

  xit('correctly adds a repeating weekly meeting', (done) => {
    // I want to test that the event for the current week is visible but 
    // am unsure how to do this.
    loadICalendarWith(recurringWeeklyMeeting, () => {
      setTimeout(() => {
        assertEventCount(1)
        done()
      }, 100)
    })
	})

  it('adds an all day event', (done) => {
    loadICalendarWith(alldayEvent, () => {
      setTimeout(() => {
        assertEventCount(1)
        currentCalendar.getEvents().forEach(event => expect(event.allDay).toBeTruthy())
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
    loadICalendarWith(timedMeetingWithoutEnd,
      () => {
        setTimeout(() => {
          assertEventCount(1)
          // check that event has been given a two day length
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
      })
  })

  it('sets end to null when forceEventDuration is disabled and no end or duration included in the VEVENT', (done) => {
    loadICalendarWith(timedMeetingWithoutEnd,
      () => {
        setTimeout(() => {
          assertEventCount(1)
          // check that event has been given a two day length
          const event = currentCalendar.getEvents()[0]
          expect(event.end).toBeNull()
          done()
        }, 100)
      },
      (source) => {
        initCalendar({
          defaultTimedEventDuration: '03:00',
        }).addEventSource(source)
      })
  })
  
  it('does not override iCal DURATION in VEVENT', (done) => {
    loadICalendarWith(timedMeetingWithDuration,
      () => {
        setTimeout(() => {
          assertEventCount(1)
          // check that event has been given a two day length
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
      })
  })
  function loadICalendarWith(rawICal: string, assertions: () => void, calendarSetup?: (source: EventSourceInput) => void) {
    const feedUrl = '/mock.ics'

    XHRMock.get(feedUrl, function(req, res) {
      expect(req.url().query).toEqual({})

      return res.status(200)
        .header('content-type', ICAL_MIME_TYPE)
        .body(rawICal)
    })

    const source = { feedUrl } as EventSourceInput

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
