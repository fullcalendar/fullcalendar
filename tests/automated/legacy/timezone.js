describe('timezone', function() {

  // NOTE: Only deals with the processing of *received* events.
  // Verification of a correct AJAX *request* is done in events-json-feed.js

  pushOptions({
    defaultView: 'month',
    defaultDate: '2014-05-01',
    events: [
      {
        id: '1',
        title: 'all day event',
        start: '2014-05-02'
      },
      {
        id: '2',
        title: 'timed event',
        start: '2014-05-10T12:00:00'
      },
      {
        id: '3',
        title: 'timed and zoned event',
        start: '2014-05-10T14:00:00+11:00'
      }
    ]
  })

  it('receives events correctly when no timezone', function(done) {
    initCalendar({
      eventAfterAllRender: function() {
        expectNoTimezone()
        done()
      }
    })
  })

  function expectNoTimezone() {
    var allDayEvent = currentCalendar.clientEvents('1')[0]
    var timedEvent = currentCalendar.clientEvents('2')[0]
    var zonedEvent = currentCalendar.clientEvents('3')[0]
    expect(allDayEvent.start.hasZone()).toEqual(false)
    expect(allDayEvent.start.hasTime()).toEqual(false)
    expect(allDayEvent.start.format()).toEqual('2014-05-02')
    expect(timedEvent.start.hasZone()).toEqual(false)
    expect(timedEvent.start.hasTime()).toEqual(true)
    expect(timedEvent.start.format()).toEqual('2014-05-10T12:00:00')
    expect(zonedEvent.start.hasZone()).toEqual(true)
    expect(zonedEvent.start.hasTime()).toEqual(true)
    expect(zonedEvent.start.format()).toEqual('2014-05-10T14:00:00+11:00')
  }


  it('receives events correctly when local timezone', function(done) {
    initCalendar({
      timezone: 'local',
      eventAfterAllRender: function() {
        expectLocalTimezone()
        done()
      }
    })
  })

  function expectLocalTimezone() {
    var allDayEvent = currentCalendar.clientEvents('1')[0]
    var timedEvent = currentCalendar.clientEvents('2')[0]
    var zonedEvent = currentCalendar.clientEvents('3')[0]
    expect(allDayEvent.start.hasZone()).toEqual(false)
    expect(allDayEvent.start.hasTime()).toEqual(false)
    expect(allDayEvent.start.format()).toEqual('2014-05-02')
    expect(timedEvent.start.hasZone()).toEqual(true)
    expect(timedEvent.start.hasTime()).toEqual(true)
    expect(timedEvent.start.utcOffset()).toEqual(-new Date(2014, 4, 10, 12).getTimezoneOffset())
    expect(zonedEvent.start.hasZone()).toEqual(true)
    expect(zonedEvent.start.hasTime()).toEqual(true)
    expect(zonedEvent.start.utcOffset()).toEqual(-new Date('Sat May 10 2014 14:00:00 GMT+1100').getTimezoneOffset())
  }


  it('receives events correctly when UTC timezone', function(done) {
    initCalendar({
      timezone: 'UTC',
      eventAfterAllRender: function() {
        expectUtcTimezone()
        done()
      }
    })
  })

  function expectUtcTimezone() {
    var allDayEvent = currentCalendar.clientEvents('1')[0]
    var timedEvent = currentCalendar.clientEvents('2')[0]
    var zonedEvent = currentCalendar.clientEvents('3')[0]
    expect(allDayEvent.start.hasZone()).toEqual(false)
    expect(allDayEvent.start.hasTime()).toEqual(false)
    expect(allDayEvent.start.format()).toEqual('2014-05-02')
    expect(timedEvent.start.hasZone()).toEqual(true)
    expect(timedEvent.start.hasTime()).toEqual(true)
    expect(timedEvent.start.format()).toEqual('2014-05-10T12:00:00Z')
    expect(zonedEvent.start.hasZone()).toEqual(true)
    expect(zonedEvent.start.hasTime()).toEqual(true)
    expect(zonedEvent.start.format()).toEqual('2014-05-10T03:00:00Z')
  }


  it('receives events correctly when custom timezone', function(done) {
    initCalendar({
      timezone: 'America/Chicago',
      eventAfterAllRender: function() {
        expectCustomTimezone()
        done()
      }
    })
  })

  function expectCustomTimezone() {
    var allDayEvent = currentCalendar.clientEvents('1')[0]
    var timedEvent = currentCalendar.clientEvents('2')[0]
    var zonedEvent = currentCalendar.clientEvents('3')[0]
    expect(allDayEvent.start.hasZone()).toEqual(false)
    expect(allDayEvent.start.hasTime()).toEqual(false)
    expect(allDayEvent.start.format()).toEqual('2014-05-02')
    expect(timedEvent.start.hasZone()).toEqual(false)
    expect(timedEvent.start.hasTime()).toEqual(true)
    expect(timedEvent.start.format()).toEqual('2014-05-10T12:00:00')
    expect(zonedEvent.start.hasZone()).toEqual(true)
    expect(zonedEvent.start.hasTime()).toEqual(true)
    expect(zonedEvent.start.format()).toEqual('2014-05-10T14:00:00+11:00')
  }


  it('can be set dynamically', function(done) {
    var callCnt = 0
    var rootEl

    initCalendar({
      timezone: false,
      eventAfterAllRender: function() {
        callCnt++
        if (callCnt === 1) {
          expectNoTimezone()
          rootEl = $('.fc-view > *:first')
          expect(rootEl.length).toBe(1)
          currentCalendar.option('timezone', 'UTC') // will cause second call...
        } else if (callCnt === 2) {
          expectUtcTimezone()
          expect($('.fc-view > *:first')[0]).toBe(rootEl[0]) // ensure didn't rerender whole calendar
          done()
        }
      }
    })
  })

})
