import XHRMock from 'xhr-mock'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import dayGridMonth from '@fullcalendar/daygrid'
import { EventSourceInput } from '@fullcalendar/core'
import iCalendarPlugin from '../../../icalendar/main'

import singleEvent from './data/singleEvent'
import multipleEvents from './data/multipleEvents'

describe('addICalEventSource', function() {
  const ICAL_MIME_TYPE = 'text/calendar'

  pushOptions({
    plugins: [ iCalendarPlugin, dayGridMonth ],
    initialDate: '2019-04-10', // the start of the three-day event in the feed
    initialView: 'dayGridMonth',
  })

  beforeEach(function() { XHRMock.setup() })

  afterEach(function() { XHRMock.teardown() })

  it('correctly adds a single event', async (done) => {
    loadICalendarWith(singleEvent, () => {
      setTimeout(() => {
        assertEventCount(1)
        done()
      }, 200)
    })
  })

  it('correctly adds multiple events', async (done) => {
    loadICalendarWith(multipleEvents, () => {
      setTimeout(() => {
        assertEventCount(2)
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
  function assertEventCount(expectedCount) {
    expect(currentCalendar.getEvents().length).toEqual(expectedCount)

    let calendarWrapper = new CalendarWrapper(currentCalendar)
    expect(calendarWrapper.getEventEls().length).toEqual(expectedCount)
  }
})
