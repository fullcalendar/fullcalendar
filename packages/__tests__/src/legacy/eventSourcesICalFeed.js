import XHRMock from 'xhr-mock'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('addICalEventSource', function() {
  // This is a bit gross to dump straight in the test. Could it be pulled out
  // to a separate file, or put somewhere neater?
  const ICAL_FEED = `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:events@fullcalendar.test
X-WR-TIMEZONE:Europe/Paris
BEGIN:VEVENT
DTSTART;VALUE=DATE:20190410
DTEND;VALUE=DATE:20190413
DTSTAMP:20201006T124223Z
UID:5pll5td7cag5rkdm988j2d0vc7@google.com
CREATED:20190408T110429Z
DESCRIPTION:
LAST-MODIFIED:20190409T110738Z
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Multi-day conference
TRANSP:OPAQUE
END:VEVENT
`

  const iCalFeedSource = {
    feedUrl: '/mock.ics',
    method: 'GET',
  }

  pushOptions({
    initialDate: '2019-04-10', // the start of the three-day event in the feed
    initialView: 'dayGridMonth'
  })

  beforeEach(function() {
    XHRMock.setup()
  })

  afterEach(function() {
    XHRMock.teardown()
  })

  it('correctly adds an array source', function(done) {
    XHRMock.get(/^mock.ics/, function(req, res) {
      expect(req.url().query).toEqual({})

      done()
      return res.status(200)
        .header('content-type', 'application/json')
        .body(ICAL_FEED)
    })
    go(
      function() {
        currentCalendar.addEventSource(iCalFeedSource)
      },
      null,
      done
    )
  })

  function go(addFunc, extraTestFunc, doneFunc) {
    initCalendar()
    addFunc()

    checkAllEvents()
    if (extraTestFunc) {
      extraTestFunc()
    }

    setTimeout(function() {

      checkAllEvents()
      if (extraTestFunc) {
        extraTestFunc()
      }

      doneFunc()
    }, 0)
  }

  // Checks to make sure all events have been rendered and that the calendar
  // has internal info on all the events.
  function checkAllEvents() {
    expect(currentCalendar.getEvents().length).toEqual(1)

    let calendarWrapper = new CalendarWrapper(currentCalendar)
    expect(calendarWrapper.getEventEls().length).toEqual(1)
  }
})
