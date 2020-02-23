import GoogleCalendarPlugin from '@fullcalendar/google-calendar'
import DayGridPlugin from '@fullcalendar/daygrid'
import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'

// HACK: in our CI setup, requests to the google-calendar api were failing for some reason
// (requests to other services were working however)
const SKIP_GCAL = karmaConfig.isCi
if (SKIP_GCAL) {
  console.log('skipping google-calendar')
}

// eslint-disable-next-line
SKIP_GCAL ||
describe('Google Calendar plugin', function() {

  const API_KEY = 'AIzaSyDcnW6WejpTOCffshGDDb4neIrXVUA1EAE'
  const HOLIDAY_CALENDAR_ID = 'en.usa#holiday@group.v.calendar.google.com'

  // Google sometimes stops returning old events. Will need to update this sometimes.
  const DEFAULT_MONTH = '2020-05'
  const NUM_EVENTS = 3 // number of holidays

  let currentWarnArgs
  let oldConsoleWarn

  pushOptions({
    plugins: [ GoogleCalendarPlugin, DayGridPlugin ],
    defaultView: 'dayGridMonth',
    defaultDate: DEFAULT_MONTH + '-01'
  })

  beforeEach(function() {
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
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: HOLIDAY_CALENDAR_ID },
      timeZone: 'local',
      _eventsPositioned() {
        let events = calendar.getEvents()
        let i

        expect(events.length).toBe(NUM_EVENTS)
        for (i = 0; i < events.length; i++) {
          expect(events[i].url).not.toMatch('ctz=')
        }

        done()
      }
    })
  })

  it('request/receives correctly when UTC timezone', function(done) {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: HOLIDAY_CALENDAR_ID },
      timeZone: 'UTC',
      _eventsPositioned() {
        let events = calendar.getEvents()
        let i

        expect(events.length).toBe(NUM_EVENTS)
        for (i = 0; i < events.length; i++) {
          expect(events[i].url).toMatch('ctz=UTC')
        }

        done()
      }
    })
  })

  it('request/receives correctly when named timezone, defaults to not editable', function(done) {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: HOLIDAY_CALENDAR_ID },
      timeZone: 'America/New_York',
      _eventsPositioned() {
        let events = calendar.getEvents()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let eventEls = dayGridWrapper.getEventEls()
        let i

        expect(events.length).toBe(NUM_EVENTS)
        for (i = 0; i < events.length; i++) {
          expect(events[i].url).toMatch('ctz=America/New_York')
        }

        expect(eventEls.length).toBe(NUM_EVENTS)
        expect($('.' + CalendarWrapper.EVENT_RESIZER_CLASSNAME, eventEls[0]).length).toBe(0) // not editable

        done()
      }
    })
  })

  it('allows editable to explicitly be set to true', function(done) {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: {
        googleCalendarId: HOLIDAY_CALENDAR_ID,
        editable: true
      },
      _eventsPositioned() {
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let eventEls = dayGridWrapper.getEventEls()

        expect(eventEls.length).toBe(NUM_EVENTS)

        for (let eventEl of eventEls) {
          expect($('.' + CalendarWrapper.EVENT_RESIZER_CLASSNAME, eventEl).length).toBeGreaterThan(0) // editable!
        }

        done()
      }
    })
  })

  it('fetches events correctly when API key is in the event source', function(done) {
    let calendar = initCalendar({
      events: {
        googleCalendarId: HOLIDAY_CALENDAR_ID,
        googleCalendarApiKey: API_KEY
      },
      _eventsPositioned() {
        let events = calendar.getEvents()
        expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
        done()
      }
    })
  })

  describe('when not given an API key', function() {
    it('calls error handlers, raises warning, and receives no events', function(done) {
      let options = {
        eventSourceFailure: function(err) {
          expect(typeof err).toBe('object')
        },
        events: {
          failure: function(err) {
            expect(typeof err).toBe('object')
          },
          googleCalendarId: HOLIDAY_CALENDAR_ID
        },
        _eventsPositioned() {
          let events = this.getEvents()
          expect(events.length).toBe(0)
          expect(currentWarnArgs.length).toBeGreaterThan(0)
          expect(options.eventSourceFailure).toHaveBeenCalled()
          expect(options.events.failure).toHaveBeenCalled()
          done()
        }
      }
      spyOn(options, 'eventSourceFailure').and.callThrough()
      spyOn(options.events, 'failure').and.callThrough()
      initCalendar(options)
    })
  })

  describe('when given a bad API key', function() {
    it('calls error handlers, raises warning, and receives no event', function(done) {
      let options = {
        googleCalendarApiKey: 'asdfasdfasdf',
        eventSourceFailure(err) {
          expect(typeof err).toBe('object')
        },
        events: {
          failure: function(err) {
            expect(typeof err).toBe('object')
          },
          googleCalendarId: HOLIDAY_CALENDAR_ID
        },
        _eventsPositioned() {
          let events = this.getEvents()
          expect(events.length).toBe(0)
          expect(currentWarnArgs.length).toBeGreaterThan(0)
          expect(options.eventSourceFailure).toHaveBeenCalled()
          expect(options.events.failure).toHaveBeenCalled()
          done()
        }
      }
      spyOn(options, 'eventSourceFailure').and.callThrough()
      spyOn(options.events, 'failure').and.callThrough()
      initCalendar(options)
    })
  })

  it('works when `events` is the actual calendar ID', function(done) {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: HOLIDAY_CALENDAR_ID,
      _eventsPositioned() {
        let events = calendar.getEvents()
        expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
        done()
      }
    })
  })

  it('detects a google-calendar when `events` is the actual calendar ID, with complicated characters (1)', function(done) {
    initCalendar({
      googleCalendarApiKey: API_KEY,
      events: 'arshaw.com_jlr7e6hpcuiald27@whatever.import.calendar.google.com',
      _eventsPositioned() {
        expect(currentWarnArgs.length).toBe(2)
        expect(typeof currentWarnArgs[1]).toBe('object') // sent the request to google, but not-found warning
        done()
      }
    })
  })

  it('detects a google-calendar when `events` is the actual calendar ID, with complicated characters (2)', function(done) {
    initCalendar({
      googleCalendarApiKey: API_KEY,
      events: 'ar-shaw.com_jlr7e6hpcuiald27@calendar.google.com',
      _eventsPositioned() {
        expect(currentWarnArgs.length).toBe(2)
        expect(typeof currentWarnArgs[1]).toBe('object') // sent the request to google, but not-found warning
        done()
      }
    })
  })

  it('detects a google-calendar when `events` is the actual calendar ID, person gmail', function(done) {
    initCalendar({
      googleCalendarApiKey: API_KEY,
      events: 'arshaw.arshaw@gmail.com',
      _eventsPositioned() {
        expect(currentWarnArgs.length).toBe(2)
        expect(typeof currentWarnArgs[1]).toBe('object') // sent the request to google, but not-found warning
        done()
      }
    })
  })

  it('detects a google-calendar when `events` is the actual calendar ID, person googlemail', function(done) {
    initCalendar({
      googleCalendarApiKey: API_KEY,
      events: 'arshaw.arshaw@googlemail.com',
      _eventsPositioned() {
        expect(currentWarnArgs.length).toBe(2)
        expect(typeof currentWarnArgs[1]).toBe('object') // sent the request to google, but not-found warning
        done()
      }
    })
  })

  it('works with requesting an HTTP V1 API feed URL', function(done) {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: 'http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic',
      _eventsPositioned() {
        let events = calendar.getEvents()
        expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
        done()
      }
    })
  })

  it('works with requesting an HTTPS V1 API feed URL', function(done) {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: 'https://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic',
      _eventsPositioned() {
        let events = calendar.getEvents()
        expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
        done()
      }
    })
  })

  it('works with requesting an V3 API feed URL', function(done) {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: 'https://www.googleapis.com/calendar/v3/calendars/usa__en%40holiday.calendar.google.com/events',
      _eventsPositioned() {
        let events = calendar.getEvents()
        expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
        done()
      }
    })
  })

  it('calls loading with true then false', function(done) {
    let cmds = []

    initCalendar({
      googleCalendarApiKey: API_KEY,
      events: 'https://www.googleapis.com/calendar/v3/calendars/usa__en%40holiday.calendar.google.com/events',
      loading(bool) {
        cmds.push(bool)

        if (cmds.length === 1) {
          expect(cmds).toEqual([ true ])
        } else if (cmds.length === 2) {
          expect(cmds).toEqual([ true, false ])
          done()
        }
      }
    })
  })

  describe('EventSource::remove', function() {

    it('works when specifying only the Google Calendar ID', function(done) {
      let called = false
      let calendar = initCalendar({
        googleCalendarApiKey: API_KEY,
        eventSources: [ { googleCalendarId: HOLIDAY_CALENDAR_ID } ],
        _eventsPositioned() {
          let events

          if (called) { return } // only the first time
          called = true

          events = calendar.getEvents()
          expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)

          setTimeout(function() {
            calendar.getEventSources()[0].remove()
            events = calendar.getEvents()
            expect(events.length).toBe(0)
            done()
          }, 0)
        }
      })
    })

    it('works when specifying a raw Google Calendar source object', function(done) {
      let googleSource = { googleCalendarId: HOLIDAY_CALENDAR_ID }
      let called = false
      let calendar = initCalendar({
        googleCalendarApiKey: API_KEY,
        eventSources: [ googleSource ],
        _eventsPositioned() {
          let events

          if (called) { return } // only the first time
          called = true

          events = calendar.getEvents()
          expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)

          setTimeout(function() {
            calendar.getEventSources()[0].remove()
            events = calendar.getEvents()
            expect(events.length).toBe(0)
            done()
          }, 0)
        }
      })
    })
  })

})
