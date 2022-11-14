import fetchMock from 'fetch-mock'

describe('event feed params', () => {
  pushOptions({
    initialDate: '2014-05-01',
    initialView: 'dayGridMonth',
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('utilizes custom startParam, endParam, and timeZoneParam names', () => {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      events: givenUrl,
      timeZone: 'America/Los_Angeles',
      startParam: 'mystart',
      endParam: 'myend',
      timeZoneParam: 'currtz',
    })

    const [requestUrl] = fetchMock.lastCall()
    const requestParams = new URL(requestUrl).searchParams
    expect(requestParams.get('mystart')).toBe('2014-04-27T00:00:00')
    expect(requestParams.get('myend')).toBe('2014-06-08T00:00:00')
    expect(requestParams.get('currtz')).toBe('America/Los_Angeles')
  })

  it('utilizes event-source-specific startParam, endParam, and timeZoneParam names', () => {
    const givenUrl = window.location.href + '/my-feed.php'
    fetchMock.get(/my-feed\.php/, { body: [] })

    initCalendar({
      timeZone: 'America/Los_Angeles',
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
    expect(requestParams.get('feedstart')).toBe('2014-04-27T00:00:00')
    expect(requestParams.get('feedend')).toBe('2014-06-08T00:00:00')
    expect(requestParams.get('feedctz')).toBe('America/Los_Angeles')
  })
})
