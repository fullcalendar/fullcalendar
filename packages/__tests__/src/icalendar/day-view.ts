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

  it('correctly adds a one-hour long meeting', async (done) => {
    loadICalendarWith(oneHourMeeting, () => {
      setTimeout(() => {
        assertEventCount(1)
        done()
      }, 200)
    })
	})

  it('correctly adds a repeating weekly meeting', async (done) => {
    loadICalendarWith(recurringWeeklyMeeting, () => {
      setTimeout(() => {
        assertEventCount(1)
        done()
      }, 200)
    })
	})

  it('adds an all day event', async (done) => {
    loadICalendarWith(alldayEvent, () => {
      setTimeout(() => {
        assertEventCount(1)
        currentCalendar.getEvents().forEach(event => expect(event.allDay).toBeTruthy())
        done()
      })
    })
  })

  it('ignores a munged event', async (done) => {
    loadICalendarWith(mungedOneHourMeeting, () => {
      setTimeout(() => {
        assertEventCount(0)
        done()
      }, 200)
		})
	})

  it('ignores a meeting with a munged start', async (done) => {
    loadICalendarWith(meetingWithMungedStart, () => {
      setTimeout(() => {
        assertEventCount(0)
        done()
      }, 200)
		})
	})

  function loadICalendarWith(rawICal: string, assertions: () => void) {
    const feedUrl = '/mock.ics'

    XHRMock.get(feedUrl, function(req, res) {
      expect(req.url().query).toEqual({})

      return res.status(200)
        .header('content-type', ICAL_MIME_TYPE)
        .body(rawICal)
    })

    initCalendar().addEventSource(
      { feedUrl } as EventSourceInput
    )

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
