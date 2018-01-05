describe('events as a json feed', function() {

  pushOptions({
    defaultDate: '2014-05-01',
    defaultView: 'month'
  })

  beforeEach(function() {
    $.mockjax({
      url: '/my-feed.php',
      contentType: 'text/json',
      responseText: [
        {
          title: 'my event',
          start: '2014-05-21'
        }
      ]
    })
    $.mockjaxSettings.log = function() { } // don't console.log
  })

  afterEach(function() {
    $.mockjax.clear()
  })

  it('requests correctly when no timezone', function() {
    initCalendar({
      events: '/my-feed.php'
    })
    var request = $.mockjax.mockedAjaxCalls()[0]
    expect(request.data.start).toEqual('2014-04-27')
    expect(request.data.end).toEqual('2014-06-08')
    expect(request.data.timezone).toBeUndefined()
  })

  it('requests correctly when local timezone', function() {
    initCalendar({
      events: '/my-feed.php',
      timezone: 'local'
    })
    var request = $.mockjax.mockedAjaxCalls()[0]
    expect(request.data.start).toEqual('2014-04-27')
    expect(request.data.end).toEqual('2014-06-08')
    expect(request.data.timezone).toBeUndefined()
  })

  it('requests correctly when UTC timezone', function() {
    initCalendar({
      events: '/my-feed.php',
      timezone: 'UTC'
    })
    var request = $.mockjax.mockedAjaxCalls()[0]
    expect(request.data.start).toEqual('2014-04-27')
    expect(request.data.end).toEqual('2014-06-08')
    expect(request.data.timezone).toEqual('UTC')
  })

  it('requests correctly when custom timezone', function() {
    initCalendar({
      events: '/my-feed.php',
      timezone: 'America/Chicago'
    })
    var request = $.mockjax.mockedAjaxCalls()[0]
    expect(request.data.start).toEqual('2014-04-27')
    expect(request.data.end).toEqual('2014-06-08')
    expect(request.data.timezone).toEqual('America/Chicago')
  })

  it('requests correctly with event source extended form', function(done) {
    initCalendar({
      eventSources: [ {
        url: '/my-feed.php',
        className: 'customeventclass'
      } ],
      timezone: 'America/Chicago',
      eventRender: function(eventObj, eventElm) {
        var request = $.mockjax.mockedAjaxCalls()[0]
        expect(request.data.start).toEqual('2014-04-27')
        expect(request.data.end).toEqual('2014-06-08')
        expect(request.data.timezone).toEqual('America/Chicago')
        expect(eventElm).toHaveClass('customeventclass')
        done()
      }
    })
  })

  it('accepts jQuery.ajax params', function(done) {
    initCalendar({
      eventSources: [ {
        url: '/my-feed.php',
        data: {
          customParam: 'yes'
        },
        success: function() {
          var request = $.mockjax.mockedAjaxCalls()[0]
          expect(request.data.customParam).toMatch('yes')
          done()
        }
      } ]
    })
  })

  it('accepts a dynamic data function', function(done) {
    initCalendar({
      eventSources: [ {
        url: '/my-feed.php',
        data: function() {
          return {
            customParam: 'heckyeah'
          }
        }
      } ],
      eventAfterAllRender: function() {
        var request = $.mockjax.mockedAjaxCalls()[0]
        expect(request.data.customParam).toMatch('heckyeah')
        done()
      }
    })
  })

  it('calls loading callback', function(done) {
    var loadingCallArgs = []
    initCalendar({
      events: { url: '/my-feed.php' },
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
    var url = '/my-feed.php'
    initCalendar({
      events: { url: url }
    })
    expect(currentCalendar.getEventSources()[0].url).toBe(url)
  })

})
