
describe('event feed params', function() {

  pushOptions({
    defaultDate: '2014-05-01',
    defaultView: 'month'
  })

  beforeEach(function() {
    XHRMock.setup()
  })
  afterEach(function() {
    XHRMock.teardown()
  })

  it('utilizes custom startParam, endParam, and timezoneParam names', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        mystart: '2014-04-27',
        myend: '2014-06-08',
        currtz: 'America/Los_Angeles'
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: 'my-feed.php',
      timezone: 'America/Los_Angeles',
      startParam: 'mystart',
      endParam: 'myend',
      timezoneParam: 'currtz'
    })
  })

  it('utilizes event-source-specific startParam, endParam, and timezoneParam names', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        feedstart: '2014-04-27',
        feedend: '2014-06-08',
        feedctz: 'America/Los_Angeles'
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      timezone: 'America/Los_Angeles',
      startParam: 'mystart',
      endParam: 'myend',
      timezoneParam: 'currtz',
      eventSources: [
        {
          url: 'my-feed.php',
          startParam: 'feedstart',
          endParam: 'feedend',
          timezoneParam: 'feedctz'
        }
      ]
    })
  })

})
