
describe('event feed params', function() {

  pushOptions({
    defaultDate: '2014-05-01',
    defaultView: 'dayGridMonth'
  })

  beforeEach(function() {
    XHRMock.setup()
  })
  afterEach(function() {
    XHRMock.teardown()
  })

  it('utilizes custom startParam, endParam, and timeZoneParam names', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        mystart: '2014-04-27T00:00:00',
        myend: '2014-06-08T00:00:00',
        currtz: 'America/Los_Angeles'
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: 'my-feed.php',
      timeZone: 'America/Los_Angeles',
      startParam: 'mystart',
      endParam: 'myend',
      timeZoneParam: 'currtz'
    })
  })

  it('utilizes event-source-specific startParam, endParam, and timeZoneParam names', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        feedstart: '2014-04-27T00:00:00',
        feedend: '2014-06-08T00:00:00',
        feedctz: 'America/Los_Angeles'
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      timeZone: 'America/Los_Angeles',
      startParam: 'mystart',
      endParam: 'myend',
      timeZoneParam: 'currtz',
      eventSources: [
        {
          url: 'my-feed.php',
          startParam: 'feedstart',
          endParam: 'feedend',
          timeZoneParam: 'feedctz'
        }
      ]
    })
  })

})
