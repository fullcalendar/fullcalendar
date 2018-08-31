
// HACK: in TravisCI, requests to the gcal api were failing for some reason
// (requests to other services were working however)
const SKIP_GCAL = karmaConfig.isTravis
if (SKIP_GCAL) {
  console.log('skipping gcal')
}

// eslint-disable-next-line
SKIP_GCAL ||
xdescribe('Google Calendar plugin', function() {

  var API_KEY = 'AIzaSyDcnW6WejpTOCffshGDDb4neIrXVUA1EAE'
  var HOLIDAY_CALENDAR_ID = 'en.usa#holiday@group.v.calendar.google.com'

  // Google sometimes stops returning old events. Will need to update this sometimes.
  var DEFAULT_MONTH = '2018-01'
  // var REQUEST_START = '2017-12-30T00:00:00Z' // one day before, by design
  // var REQUEST_END = '2018-02-12T00:00:00Z' // one day before, by design
  var NUM_EVENTS = 3

  var options
  var currentWarnArgs
  var oldConsoleWarn

  beforeEach(function() {

    options = {
      defaultView: 'month',
      defaultDate: DEFAULT_MONTH + '-01'
    }

    // Intercept calls to console.warn
    currentWarnArgs = null
    oldConsoleWarn = console.warn
    console.warn = function() {
      currentWarnArgs = arguments
    }
  })

  afterEach(function() {
    console.warn = oldConsoleWarn
  })

  it('request/receives correctly when local timezone', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = { googleCalendarId: HOLIDAY_CALENDAR_ID }
    options.timeZone = 'local'
    options.eventAfterAllRender = function() {
      var events = currentCalendar.getEvents()
      var i

      expect(events.length).toBe(NUM_EVENTS)
      for (i = 0; i < events.length; i++) {
        expect(events[i].url).not.toMatch('ctz=')
      }

      done()
    }
    initCalendar(options)
  })

  it('request/receives correctly when UTC timezone', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = { googleCalendarId: HOLIDAY_CALENDAR_ID }
    options.timeZone = 'UTC'
    options.eventAfterAllRender = function() {
      var events = currentCalendar.getEvents()
      var i

      expect(events.length).toBe(NUM_EVENTS)
      for (i = 0; i < events.length; i++) {
        expect(events[i].url).toMatch('ctz=UTC')
      }

      done()
    }
    initCalendar(options)
  })

  it('request/receives correctly when named timezone, defaults to not editable', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = { googleCalendarId: HOLIDAY_CALENDAR_ID }
    options.timeZone = 'America/New York'
    options.eventAfterAllRender = function() {
      var events = currentCalendar.getEvents()
      var eventEls = $('.fc-event')
      var i

      expect(events.length).toBe(NUM_EVENTS)
      for (i = 0; i < events.length; i++) {
        expect(events[i].url).toMatch('ctz=America/New_York')
      }

      expect(eventEls.length).toBe(NUM_EVENTS)
      expect(eventEls.find('.fc-resizer').length).toBe(0) // not editable

      done()
    }
    initCalendar(options)
  })

  it('allows editable to explicitly be set to true', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = {
      googleCalendarId: HOLIDAY_CALENDAR_ID,
      editable: true
    }
    options.eventAfterAllRender = function() {
      var eventEls = $('.fc-event')
      expect(eventEls.length).toBe(NUM_EVENTS)
      expect(eventEls.find('.fc-resizer').length).toBeGreaterThan(0) // editable!
      done()
    }
    initCalendar(options)
  })

  it('fetches events correctly when API key is in the event source', function(done) {
    options.events = {
      googleCalendarId: HOLIDAY_CALENDAR_ID,
      googleCalendarApiKey: API_KEY
    }
    options.eventAfterAllRender = function() {
      var events = currentCalendar.getEvents()
      expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
      done()
    }
    initCalendar(options)
  })

  describe('when not given an API key', function() {
    it('calls error handlers, raises warning, and receives no events', function(done) {
      options.eventSourceFailure = function(err) {
        expect(typeof err).toBe('object')
      }
      options.events = {
        failure: function(err) {
          expect(typeof err).toBe('object')
        },
        googleCalendarId: HOLIDAY_CALENDAR_ID
      }
      options.eventAfterAllRender = function() {
        var events = currentCalendar.getEvents()

        expect(events.length).toBe(0)
        expect(currentWarnArgs.length).toBeGreaterThan(0)
        expect(options.eventSourceFailure).toHaveBeenCalled()
        expect(options.events.failure).toHaveBeenCalled()

        done()
      }
      spyOn(options, 'eventSourceFailure').and.callThrough()
      spyOn(options.events, 'failure').and.callThrough()
      initCalendar(options)
    })
  })

  describe('when given a bad API key', function() {
    it('calls error handlers, raises warning, and receives no event', function(done) {
      options.googleCalendarApiKey = 'asdfasdfasdf'
      options.eventSourceFailure = function(err) {
        expect(typeof err).toBe('object')
      }
      options.events = {
        failure: function(err) {
          expect(typeof err).toBe('object')
        },
        googleCalendarId: HOLIDAY_CALENDAR_ID
      }
      options.eventAfterAllRender = function() {
        var events = currentCalendar.getEvents()

        expect(events.length).toBe(0)
        expect(currentWarnArgs.length).toBeGreaterThan(0)
        expect(options.eventSourceFailure).toHaveBeenCalled()
        expect(options.events.failure).toHaveBeenCalled()

        done()
      }
      spyOn(options, 'eventSourceFailure').and.callThrough()
      spyOn(options.events, 'failure').and.callThrough()
      initCalendar(options)
    })
  })

  it('works when `events` is the actual calendar ID', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = HOLIDAY_CALENDAR_ID
    options.eventAfterAllRender = function() {
      var events = currentCalendar.getEvents()
      expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
      done()
    }
    initCalendar(options)
  })

  it('detects a gcal when `events` is the actual calendar ID, with complicated characters (1)', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = 'arshaw.com_jlr7e6hpcuiald27@whatever.import.calendar.google.com'
    options.eventAfterAllRender = function() {
      expect(currentWarnArgs.length).toBe(2)
      expect(typeof currentWarnArgs[1]).toBe('object') // sent the request to google, but not-found warning
      done()
    }
    initCalendar(options)
  })

  it('detects a gcal when `events` is the actual calendar ID, with complicated characters (2)', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = 'ar-shaw.com_jlr7e6hpcuiald27@calendar.google.com'
    options.eventAfterAllRender = function() {
      expect(currentWarnArgs.length).toBe(2)
      expect(typeof currentWarnArgs[1]).toBe('object') // sent the request to google, but not-found warning
      done()
    }
    initCalendar(options)
  })

  it('detects a gcal when `events` is the actual calendar ID, person gmail', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = 'arshaw.arshaw@gmail.com'
    options.eventAfterAllRender = function() {
      expect(currentWarnArgs.length).toBe(2)
      expect(typeof currentWarnArgs[1]).toBe('object') // sent the request to google, but not-found warning
      done()
    }
    initCalendar(options)
  })

  it('detects a gcal when `events` is the actual calendar ID, person googlemail', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = 'arshaw.arshaw@googlemail.com'
    options.eventAfterAllRender = function() {
      expect(currentWarnArgs.length).toBe(2)
      expect(typeof currentWarnArgs[1]).toBe('object') // sent the request to google, but not-found warning
      done()
    }
    initCalendar(options)
  })

  it('works with requesting an HTTP V1 API feed URL', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = 'http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic'
    options.eventAfterAllRender = function() {
      var events = currentCalendar.getEvents()
      expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
      done()
    }
    initCalendar(options)
  })

  it('works with requesting an HTTPS V1 API feed URL', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events = 'https://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic'
    options.eventAfterAllRender = function() {
      var events = currentCalendar.getEvents()
      expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
      done()
    }
    initCalendar(options)
  })

  it('works with requesting an V3 API feed URL', function(done) {
    options.googleCalendarApiKey = API_KEY
    options.events =
      'https://www.googleapis.com/calendar/v3/calendars/usa__en%40holiday.calendar.google.com/events'
    options.eventAfterAllRender = function() {
      var events = currentCalendar.getEvents()
      expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
      done()
    }
    initCalendar(options)
  })

  it('calls loading with true then false', function(done) {
    var cmds = []

    options.googleCalendarApiKey = API_KEY
    options.events =
      'https://www.googleapis.com/calendar/v3/calendars/usa__en%40holiday.calendar.google.com/events'

    options.loading = function(bool) {
      cmds.push(bool)

      if (cmds.length === 1) {
        expect(cmds).toEqual([ true ])
      } else if (cmds.length === 2) {
        expect(cmds).toEqual([ true, false ])
        done()
      }
    }
    initCalendar(options)
  })

  describe('EventSource::remove', function() {

    it('works when specifying only the Google Calendar ID', function(done) {
      var called = false

      options.googleCalendarApiKey = API_KEY
      options.eventSources = [ { googleCalendarId: HOLIDAY_CALENDAR_ID } ]
      options.eventAfterAllRender = function() {
        var events

        if (called) { return } // only the first time
        called = true

        events = currentCalendar.getEvents()
        expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)

        setTimeout(function() {
          currentCalendar.getEventSources()[0].remove()
          events = currentCalendar.getEvents()
          expect(events.length).toBe(0)
          done()
        }, 0)
      }

      initCalendar(options)
    })

    it('works when specifying a raw Google Calendar source object', function(done) {
      var googleSource = { googleCalendarId: HOLIDAY_CALENDAR_ID }
      var called = false

      options.googleCalendarApiKey = API_KEY
      options.eventSources = [ googleSource ]
      options.eventAfterAllRender = function() {
        var events

        if (called) { return } // only the first time
        called = true

        events = currentCalendar.getEvents()
        expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)

        setTimeout(function() {
          currentCalendar.getEventSources()[0].remove()
          events = currentCalendar.getEvents()
          expect(events.length).toBe(0)
          done()
        }, 0)
      }

      initCalendar(options)
    })
  })

})
