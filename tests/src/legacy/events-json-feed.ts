import XHRMock from 'xhr-mock'
import { formatIsoTimeZoneOffset } from '../lib/datelib-utils'

describe('events as a json feed', () => {
  pushOptions({
    initialDate: '2014-05-01',
    initialView: 'dayGridMonth',
  })

  beforeEach(() => {
    XHRMock.setup()
  })

  afterEach(() => {
    XHRMock.teardown()
  })

  it('requests correctly when local timezone', (done) => {
    const START = '2014-04-27T00:00:00'
    const END = '2014-06-08T00:00:00'

    XHRMock.get(/^my-feed\.php/, (req, res) => {
      expect(req.url().query).toEqual({
        start: START + formatIsoTimeZoneOffset(new Date(START)),
        end: END + formatIsoTimeZoneOffset(new Date(END)),
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: 'my-feed.php',
      timeZone: 'local',
    })
  })

  it('requests correctly when UTC timezone', (done) => {
    XHRMock.get(/^my-feed\.php/, (req, res) => {
      expect(req.url().query).toEqual({
        start: '2014-04-27T00:00:00Z',
        end: '2014-06-08T00:00:00Z',
        timeZone: 'UTC',
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: 'my-feed.php',
      timeZone: 'UTC',
    })
  })

  it('requests correctly when named timezone', (done) => {
    XHRMock.get(/^my-feed\.php/, (req, res) => {
      expect(req.url().query).toEqual({
        start: '2014-04-27T00:00:00',
        end: '2014-06-08T00:00:00',
        timeZone: 'America/Chicago',
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: 'my-feed.php',
      timeZone: 'America/Chicago',
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5485
  it('processes new events under updated time zone', (done) => {
    XHRMock.get(/^my-feed\.php/, (req, res) => {
      let reqTimeZone = req.url().query.timeZone

      return res.status(200).header('content-type', 'application/json').body(
        JSON.stringify([
          reqTimeZone === 'America/Chicago'
            ? { start: '2014-06-08T01:00:00' }
            : { start: '2014-06-08T03:00:00' },
        ]),
      )
    })

    let calendar = initCalendar({
      events: 'my-feed.php',
      timeZone: 'America/Chicago',
    })

    setTimeout(() => {
      let eventStartStr = calendar.getEvents()[0].startStr
      expect(eventStartStr).toBe('2014-06-08T01:00:00')

      calendar.setOption('timeZone', 'America/New_York')
      setTimeout(() => {
        eventStartStr = calendar.getEvents()[0].startStr
        expect(eventStartStr).toBe('2014-06-08T03:00:00')
        done()
      }, 100)
    }, 100)
  })

  it('requests correctly with event source extended form', (done) => {
    XHRMock.get(/^my-feed\.php/, (req, res) => {
      expect(req.url().query).toEqual({
        start: '2014-04-27T00:00:00',
        end: '2014-06-08T00:00:00',
        timeZone: 'America/Chicago',
      })
      return res.status(200).header('content-type', 'application/json').body(
        JSON.stringify([
          {
            title: 'my event',
            start: '2014-05-21',
          },
        ]),
      )
    })

    initCalendar({
      eventSources: [{
        url: 'my-feed.php',
        classNames: 'customeventclass',
      }],
      timeZone: 'America/Chicago',
      eventDidMount(arg) {
        expect(arg.el).toHaveClass('customeventclass')
        done()
      },
    })
  })

  it('requests POST correctly', (done) => {
    XHRMock.post(/^my-feed\.php/, (req, res) => {
      expect(req.url().query).toEqual({})
      expect(req.body()).toEqual('start=2014-04-27T00%3A00%3A00Z&end=2014-06-08T00%3A00%3A00Z&timeZone=UTC')
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: {
        url: 'my-feed.php',
        method: 'POST',
      },
      timeZone: 'UTC',
    })
  })

  it('accepts a extraParams object', (done) => {
    XHRMock.get(/^my-feed\.php/, (req, res) => {
      expect(req.url().query).toEqual({
        timeZone: 'UTC',
        start: '2014-04-27T00:00:00Z',
        end: '2014-06-08T00:00:00Z',
        customParam: 'yes',
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      eventSources: [{
        url: 'my-feed.php',
        extraParams: {
          customParam: 'yes',
        },
      }],
    })
  })

  it('accepts a dynamic extraParams function', (done) => {
    XHRMock.get(/^my-feed\.php/, (req, res) => {
      expect(req.url().query).toEqual({
        timeZone: 'UTC',
        start: '2014-04-27T00:00:00Z',
        end: '2014-06-08T00:00:00Z',
        customParam: 'heckyeah',
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      eventSources: [{
        url: 'my-feed.php',
        extraParams() {
          return {
            customParam: 'heckyeah',
          }
        },
      }],
    })
  })

  it('calls loading callback', (done) => {
    let loadingCallArgs = []

    XHRMock.get(/^my-feed\.php/, (req, res) => res.status(200).header('content-type', 'application/json').body('[]'))

    initCalendar({
      events: { url: 'my-feed.php' },
      loading(bool) {
        loadingCallArgs.push(bool)
      },
    })

    setTimeout(() => {
      expect(loadingCallArgs).toEqual([true, false])
      done()
    }, 0)
  })

  it('has and Event Source object with certain props', () => {
    XHRMock.get(/^my-feed\.php/, (req, res) => res.status(200).header('content-type', 'application/json').body('[]'))

    initCalendar({
      events: { url: 'my-feed.php' },
    })
    expect(currentCalendar.getEventSources()[0].url).toBe('my-feed.php')
  })
})
