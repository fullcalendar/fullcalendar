describe('event feed params', function() {

  pushOptions({
    defaultDate: '2014-05-01',
    defaultView: 'month'
  })

  beforeEach(function() {
    $.mockjax({
      url: '*',
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

  it('utilizes custom startParam, endParam, and timezoneParam names', function() {
    initCalendar({
      events: 'my-feed.php',
      timezone: 'America/Los_Angeles',
      startParam: 'mystart',
      endParam: 'myend',
      timezoneParam: 'currtz'
    })
    var request = $.mockjax.mockedAjaxCalls()[0]
    expect(request.data.start).toBeUndefined()
    expect(request.data.end).toBeUndefined()
    expect(request.data.timezone).toBeUndefined()
    expect(request.data.mystart).toEqual('2014-04-27')
    expect(request.data.myend).toEqual('2014-06-08')
    expect(request.data.currtz).toEqual('America/Los_Angeles')
  })

  it('utilizes event-source-specific startParam, endParam, and timezoneParam names', function() {
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
    var request = $.mockjax.mockedAjaxCalls()[0]
    expect(request.data.start).toBeUndefined()
    expect(request.data.end).toBeUndefined()
    expect(request.data.timezone).toBeUndefined()
    expect(request.data.mystart).toBeUndefined()
    expect(request.data.myend).toBeUndefined()
    expect(request.data.currtz).toBeUndefined()
    expect(request.data.feedstart).toEqual('2014-04-27')
    expect(request.data.feedend).toEqual('2014-06-08')
    expect(request.data.feedctz).toEqual('America/Los_Angeles')
  })

})
