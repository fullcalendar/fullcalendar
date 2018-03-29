describe('events as a json feed', function() {

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

  it('requests correctly when no timezone', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        start: '2014-04-27',
        end: '2014-06-08'
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: 'my-feed.php'
    })
  })

  it('requests correctly when local timezone', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        start: '2014-04-27',
        end: '2014-06-08'
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: 'my-feed.php',
      timezone: 'local'
    })
  })

  it('requests correctly when UTC timezone', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        start: '2014-04-27',
        end: '2014-06-08',
        timezone: 'UTC'
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: 'my-feed.php',
      timezone: 'UTC'
    })
  })

  it('requests correctly when custom timezone', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        start: '2014-04-27',
        end: '2014-06-08',
        timezone: 'America/Chicago'
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: 'my-feed.php',
      timezone: 'America/Chicago'
    })
  })

  it('requests correctly with event source extended form', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        start: '2014-04-27',
        end: '2014-06-08',
        timezone: 'America/Chicago'
      })
      return res.status(200).header('content-type', 'application/json').body(
        JSON.stringify([
          {
            title: 'my event',
            start: '2014-05-21'
          }
        ])
      )
    })

    initCalendar({
      eventSources: [ {
        url: 'my-feed.php',
        className: 'customeventclass'
      } ],
      timezone: 'America/Chicago',
      eventRender: function(eventObj, eventElm) {
        expect(eventElm).toHaveClass('customeventclass')
        done()
      }
    })
  })

  it('accepts jQuery.ajax params', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        start: '2014-04-27',
        end: '2014-06-08',
        customParam: 'yes'
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      eventSources: [ {
        url: 'my-feed.php',
        data: {
          customParam: 'yes'
        }
      } ]
    })
  })

  it('accepts a dynamic data function', function(done) {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      expect(req.url().query).toEqual({
        start: '2014-04-27',
        end: '2014-06-08',
        customParam: 'heckyeah'
      })
      done()
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      eventSources: [ {
        url: 'my-feed.php',
        data: function() {
          return {
            customParam: 'heckyeah'
          }
        }
      } ]
    })
  })

  it('calls loading callback', function(done) {
    var loadingCallArgs = []

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: { url: 'my-feed.php' },
      loading: function(bool) {
        loadingCallArgs.push(bool)
      },
      eventAfterAllRender: function() {
        expect(loadingCallArgs).toEqual([ true, false ])
        done()
      }
    })
  })

  it('has and Event Source object with certain props', function() {

    XHRMock.get(/^my-feed\.php/, function(req, res) {
      return res.status(200).header('content-type', 'application/json').body('[]')
    })

    initCalendar({
      events: { url: 'my-feed.php' }
    })
    expect(currentCalendar.getEventSources()[0].url).toBe('my-feed.php')
  })

})
