import googleCalendarPlugin from '@fullcalendar/google-calendar'
import dayGridPlugin from '@fullcalendar/daygrid'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

// HACK: in our CI setup, requests to the google-calendar api were failing for some reason
// (requests to other services were working however)
const SKIP_GCAL = window.karmaConfig.isCi // maybe use webpack for this???
if (SKIP_GCAL) {
  console.log('skipping google-calendar') // eslint-disable-line no-console
}

// eslint-disable-next-line
SKIP_GCAL ||
describe('Google Calendar plugin', () => {
  const API_KEY = 'AIzaSyDcnW6WejpTOCffshGDDb4neIrXVUA1EAE'
  const HOLIDAY_CALENDAR_ID = 'en.usa#holiday@group.v.calendar.google.com'

  // Google sometimes stops returning old events. Will need to update this sometimes.
  const DEFAULT_MONTH = '2020-05'
  const NUM_EVENTS = 5 // number of holidays

  let currentWarnArgs
  let oldConsoleWarn

  pushOptions({
    plugins: [googleCalendarPlugin, dayGridPlugin],
    initialView: 'dayGridMonth',
    initialDate: DEFAULT_MONTH + '-01',
  })

  beforeEach(() => {
    // Intercept calls to console.warn
    currentWarnArgs = null
    oldConsoleWarn = console.warn
    console.warn = function () { // eslint-disable-line func-names
      currentWarnArgs = arguments // eslint-disable-line prefer-rest-params
    }
  })

  afterEach(() => {
    console.warn = oldConsoleWarn
  })

  it('request/receives correctly when local timezone', (done) => {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: HOLIDAY_CALENDAR_ID },
      timeZone: 'local',
    })

    afterEventsLoaded(calendar, () => {
      let events = calendar.getEvents()
      let i

      expect(events.length).toBe(NUM_EVENTS)
      for (i = 0; i < events.length; i += 1) {
        expect(events[i].url).not.toMatch('ctz=')
      }

      done()
    })
  })

  it('request/receives correctly when UTC timezone', (done) => {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: HOLIDAY_CALENDAR_ID },
      timeZone: 'UTC',
    })

    afterEventsLoaded(calendar, () => {
      let events = calendar.getEvents()
      let i

      expect(events.length).toBe(NUM_EVENTS)
      for (i = 0; i < events.length; i += 1) {
        expect(events[i].url).toMatch('ctz=UTC')
      }

      done()
    })
  })

  it('request/receives correctly when named timezone, defaults to not editable', (done) => {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: { googleCalendarId: HOLIDAY_CALENDAR_ID },
      timeZone: 'America/New_York',
    })

    afterEventsLoaded(calendar, () => {
      let events = calendar.getEvents()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      let eventEls = dayGridWrapper.getEventEls()
      let i

      expect(events.length).toBe(NUM_EVENTS)
      for (i = 0; i < events.length; i += 1) {
        expect(events[i].url).toMatch('ctz=America/New_York')
      }

      expect(eventEls.length).toBe(NUM_EVENTS)
      expect($('.' + CalendarWrapper.EVENT_RESIZER_CLASSNAME, eventEls[0]).length).toBe(0) // not editable

      done()
    })
  })

  it('allows editable to explicitly be set to true', (done) => {
    let calendar = initCalendar({
      googleCalendarApiKey: API_KEY,
      events: {
        googleCalendarId: HOLIDAY_CALENDAR_ID,
        editable: true,
      },
    })

    afterEventsLoaded(calendar, () => {
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      let eventEls = dayGridWrapper.getEventEls()

      expect(eventEls.length).toBe(NUM_EVENTS)

      for (let eventEl of eventEls) {
        expect($('.' + CalendarWrapper.EVENT_RESIZER_CLASSNAME, eventEl).length).toBeGreaterThan(0) // editable!
      }

      done()
    })
  })

  it('fetches events correctly when API key is in the event source', (done) => {
    let calendar = initCalendar({
      events: {
        googleCalendarId: HOLIDAY_CALENDAR_ID,
        googleCalendarApiKey: API_KEY,
      },
    })

    afterEventsLoaded(calendar, () => {
      let events = calendar.getEvents()
      expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)
      done()
    })
  })

  describe('when not given an API key', () => {
    it('calls error handlers, raises warning, and receives no events', (done) => {
      let options = {
        events: {
          failure(err) {
            expect(typeof err).toBe('object')
          },
          googleCalendarId: HOLIDAY_CALENDAR_ID,
        },
        eventSourceFailure(err) {
          expect(typeof err).toBe('object')

          setTimeout(() => { // wait for potential render
            let events = this.getEvents()
            expect(events.length).toBe(0)
            expect(currentWarnArgs.length).toBeGreaterThan(0)
            expect(options.events.failure).toHaveBeenCalled()
            done()
          }, 0)
        },
      }

      spyOn(options.events, 'failure').and.callThrough()
      initCalendar(options)
    })
  })

  describe('when given a bad API key', () => {
    it('calls error handlers, raises warning, and receives no event', (done) => {
      let options = {
        googleCalendarApiKey: 'asdfasdfasdf',
        events: {
          failure(err) {
            expect(typeof err).toBe('object')
          },
          googleCalendarId: HOLIDAY_CALENDAR_ID,
        },
        eventSourceFailure(err) {
          expect(typeof err).toBe('object')

          setTimeout(() => { // wait for potential render
            let events = this.getEvents()
            expect(events.length).toBe(0)
            expect(currentWarnArgs.length).toBeGreaterThan(0)
            expect(options.events.failure).toHaveBeenCalled()
            done()
          }, 0)
        },
      }

      spyOn(options.events, 'failure').and.callThrough()
      initCalendar(options)
    })
  })

  it('calls loading with true then false', (done) => {
    let cmds = []

    initCalendar({
      googleCalendarApiKey: API_KEY,
      events: 'https://www.googleapis.com/calendar/v3/calendars/usa__en%40holiday.calendar.google.com/events',
      loading(bool) {
        cmds.push(bool)

        if (cmds.length === 1) {
          expect(cmds).toEqual([true])
        } else if (cmds.length === 2) {
          expect(cmds).toEqual([true, false])
          done()
        }
      },
    })
  })

  describe('EventSource::remove', () => {
    it('works when specifying only the Google Calendar ID', (done) => {
      let called = false
      let calendar = initCalendar({
        googleCalendarApiKey: API_KEY,
        eventSources: [{ googleCalendarId: HOLIDAY_CALENDAR_ID }],
      })

      afterEventsLoaded(calendar, () => {
        let events

        if (called) { return } // only the first time
        called = true

        events = calendar.getEvents()
        expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)

        setTimeout(() => {
          calendar.getEventSources()[0].remove()
          events = calendar.getEvents()
          expect(events.length).toBe(0)
          done()
        }, 0)
      })
    })

    it('works when specifying a raw Google Calendar source object', (done) => {
      let googleSource = { googleCalendarId: HOLIDAY_CALENDAR_ID }
      let called = false
      let calendar = initCalendar({
        googleCalendarApiKey: API_KEY,
        eventSources: [googleSource],
      })

      afterEventsLoaded(calendar, () => {
        let events

        if (called) { return } // only the first time
        called = true

        events = calendar.getEvents()
        expect(events.length).toBe(NUM_EVENTS) // 5 holidays in November 2016 (and end of Oct)

        setTimeout(() => {
          calendar.getEventSources()[0].remove()
          events = calendar.getEvents()
          expect(events.length).toBe(0)
          done()
        }, 0)
      })
    })
  })

  function afterEventsLoaded(calendar, callback: () => void) {
    calendar.on('eventsSet', () => {
      setTimeout(callback) // because nothing is rendered yet when eventSourceSuccess fires
    })
  }
})
