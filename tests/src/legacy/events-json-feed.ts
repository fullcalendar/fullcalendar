import fetchMock from 'fetch-mock'
import { JsonRequestError } from '@fullcalendar/core'
import { formatIsoTimeZoneOffset } from '../lib/datelib-utils.js'

describe('events as a json feed', () => {
  pushOptions({
    initialDate: '2014-05-01',
    initialView: 'dayGridMonth',
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('requests correctly when local timezone', () => {
    const START = '2014-04-27T00:00:00'
    const END = '2014-06-08T00:00:00'

    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      events: givenUrl,
      timeZone: 'local',
    })

    const [requestUrl] = fetchMock.lastCall()
    const requestParams = new URL(requestUrl).searchParams
    expect(requestParams.get('start')).toBe(START + formatIsoTimeZoneOffset(new Date(START)))
    expect(requestParams.get('end')).toBe(END + formatIsoTimeZoneOffset(new Date(END)))
  })

  it('requests correctly when UTC timezone', () => {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      events: givenUrl,
      timeZone: 'UTC',
    })

    const [requestUrl] = fetchMock.lastCall()
    const requestParams = new URL(requestUrl).searchParams
    expect(requestParams.get('start')).toBe('2014-04-27T00:00:00Z')
    expect(requestParams.get('end')).toBe('2014-06-08T00:00:00Z')
    expect(requestParams.get('timeZone')).toBe('UTC')
  })

  it('requests correctly when named timezone', () => {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      events: givenUrl,
      timeZone: 'America/Chicago',
    })

    const [requestUrl] = fetchMock.lastCall()
    const requestParams = new URL(requestUrl).searchParams
    expect(requestParams.get('start')).toBe('2014-04-27T00:00:00')
    expect(requestParams.get('end')).toBe('2014-06-08T00:00:00')
    expect(requestParams.get('timeZone')).toBe('America/Chicago')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5485
  it('processes new events under updated time zone', (done) => {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, (requestUrl) => {
      const requestParams = new URL(requestUrl).searchParams
      let reqTimeZone = requestParams.get('timeZone')
      return {
        body: [
          reqTimeZone === 'America/Chicago'
            ? { start: '2014-06-08T01:00:00' }
            : { start: '2014-06-08T03:00:00' },
        ],
      }
    })

    let calendar = initCalendar({
      events: givenUrl,
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
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, {
      body: [
        {
          title: 'my event',
          start: '2014-05-21',
        },
      ],
    })

    initCalendar({
      eventSources: [{
        url: givenUrl,
        classNames: 'customeventclass',
      }],
      timeZone: 'America/Chicago',
      eventDidMount(arg) {
        expect(arg.el).toHaveClass('customeventclass')
        done()
      },
    })

    const [requestUrl] = fetchMock.lastCall()
    const requestParams = new URL(requestUrl).searchParams
    expect(requestParams.get('start')).toBe('2014-04-27T00:00:00')
    expect(requestParams.get('end')).toBe('2014-06-08T00:00:00')
    expect(requestParams.get('timeZone')).toBe('America/Chicago')
  })

  it('requests POST correctly', (done) => {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.post(/my-feed\.php/, (url, options) => {
      const paramStrGet = new URL(url).searchParams.toString()
      const paramStrPost = options.body.toString()
      expect(paramStrGet).toBe('')
      expect(paramStrPost).toBe('start=2014-04-27T00%3A00%3A00Z&end=2014-06-08T00%3A00%3A00Z&timeZone=UTC')
      done()
      return { body: [] }
    })

    initCalendar({
      events: {
        url: givenUrl,
        method: 'POST',
      },
      timeZone: 'UTC',
    })
  })

  it('accepts a extraParams object', () => {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      eventSources: [{
        url: givenUrl,
        extraParams: {
          customParam: 'yes',
        },
      }],
    })

    const [requestUrl] = fetchMock.lastCall()
    const requestParams = new URL(requestUrl).searchParams
    expect(requestParams.get('start')).toBe('2014-04-27T00:00:00Z')
    expect(requestParams.get('end')).toBe('2014-06-08T00:00:00Z')
    expect(requestParams.get('timeZone')).toBe('UTC')
    expect(requestParams.get('customParam')).toBe('yes')
  })

  it('accepts a dynamic extraParams function', () => {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      eventSources: [{
        url: givenUrl,
        extraParams() {
          return {
            customParam: 'heckyeah',
          }
        },
      }],
    })

    const [requestUrl] = fetchMock.lastCall()
    const requestParams = new URL(requestUrl).searchParams
    expect(requestParams.get('start')).toBe('2014-04-27T00:00:00Z')
    expect(requestParams.get('end')).toBe('2014-06-08T00:00:00Z')
    expect(requestParams.get('timeZone')).toBe('UTC')
    expect(requestParams.get('customParam')).toBe('heckyeah')
  })

  it('calls loading callback', (done) => {
    const loadingCallArgs = []

    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      events: { url: givenUrl },
      loading(bool) {
        loadingCallArgs.push(bool)
      },
    })

    setTimeout(() => {
      expect(loadingCallArgs).toEqual([true, false])
      done()
    }, 100)
  })

  it('has and Event Source object with certain props', () => {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      events: { url: givenUrl },
    })
    expect(currentCalendar.getEventSources()[0].url).toBe(givenUrl)
  })

  it('throws JsonRequestError if mangled JSON', (done) => {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: '[{title:' })

    let eventSourceFailureCalled = false

    initCalendar({
      events: { url: givenUrl },
      eventSourceFailure(error) {
        let isJsonRequestFailure = error instanceof JsonRequestError
        if (isJsonRequestFailure) {
          expect(typeof error.response.url).toBe('string') // NOTE: fetchMock mangles exact url
        }
        expect(isJsonRequestFailure).toBe(true)
        eventSourceFailureCalled = true
      },
    })

    setTimeout(() => {
      expect(eventSourceFailureCalled).toBe(true)
      done()
    }, 100)
  })
})
