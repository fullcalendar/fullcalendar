import XHRMock from 'xhr-mock'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import dayGridMonth from '@fullcalendar/daygrid'
import { EventSourceInput } from '@fullcalendar/core'
import iCalendarPlugin from '../../../icalendar/main'

import singleCalendar from './data/singleCalendar'

fdescribe('addICalEventSource', function() {
  const ICAL_MIME_TYPE = 'text/calendar'

  pushOptions({
    plugins: [ iCalendarPlugin, dayGridMonth ],
    initialDate: '2019-04-10', // the start of the three-day event in the feed
    initialView: 'dayGridMonth',
  })

  beforeEach(function() {
    XHRMock.setup()
  })

  afterEach(function() {
    XHRMock.teardown()
  })

  it('correctly adds an ical feed source', async (done) => {
    XHRMock.get('/mock.ics', function(req, res) {
      expect(req.url().query).toEqual({})

      return res.status(200)
        .header('content-type', ICAL_MIME_TYPE)
        .body(singleCalendar)
    })

    const calendar = initCalendar()

    calendar.addEventSource(
      { 
        feedUrl: '/mock.ics',
      } as EventSourceInput
    )
    
    setTimeout(() => {
      checkAllEvents()
      done()
    }, 200)
  })

  // Checks to make sure all events have been rendered and that the calendar
  // has internal info on all the events.
  function checkAllEvents() {
    expect(currentCalendar.getEvents().length).toEqual(1)

    let calendarWrapper = new CalendarWrapper(currentCalendar)
    expect(calendarWrapper.getEventEls().length).toEqual(1)
  }
})
