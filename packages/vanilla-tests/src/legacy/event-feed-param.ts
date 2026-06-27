import fetchMock from 'fetch-mock'
import { plainAndZoneToString } from '../lib/temporal-convert'

describe('event feed params', () => {
  pushOptions({
    initialDate: '2014-05-01',
    initialView: 'dayGridMonth',
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('utilizes custom startParam, endParam, and timeZoneParam names', () => {
    const timeZone = 'America/Los_Angeles'
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      events: givenUrl,
      timeZone,
      startParam: 'mystart',
      endParam: 'myend',
      timeZoneParam: 'currtz',
    })

    const [requestUrl] = fetchMock.lastCall()
    const requestParams = new URL(requestUrl).searchParams
    expect(requestParams.get('mystart')).toBe(plainAndZoneToString('2014-04-27T00:00:00', timeZone))
    expect(requestParams.get('myend')).toBe(plainAndZoneToString('2014-06-08T00:00:00', timeZone))
    expect(requestParams.get('currtz')).toBe(timeZone)
  })

  it('utilizes event-source-specific startParam, endParam, and timeZoneParam names', () => {
    const timeZone = 'America/Los_Angeles'
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      timeZone,
      startParam: 'mystart',
      endParam: 'myend',
      timeZoneParam: 'currtz',
      eventSources: [
        {
          url: givenUrl,
          startParam: 'feedstart',
          endParam: 'feedend',
          timeZoneParam: 'feedctz',
        },
      ],
    })

    const [requestUrl] = fetchMock.lastCall()
    const requestParams = new URL(requestUrl).searchParams
    expect(requestParams.get('feedstart')).toBe(plainAndZoneToString('2014-04-27T00:00:00', timeZone))
    expect(requestParams.get('feedend')).toBe(plainAndZoneToString('2014-06-08T00:00:00', timeZone))
    expect(requestParams.get('feedctz')).toBe(timeZone)
  })
})
