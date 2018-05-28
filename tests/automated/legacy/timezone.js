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
    expect(allDayEvent.isAllDay).toEqual(true)
    expect(allDayEvent.start).toEqualDate('2014-05-02T00:00:00') // local
    expect(timedEvent.isAllDay).toEqual(false)
    expect(timedEvent.start).toEqualDate('2014-05-10T12:00:00') // local
    expect(zonedEvent.isAllDay).toEqual(false)
    expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00+11:00')
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
    expect(allDayEvent.isAllDay).toEqual(true)
    expect(allDayEvent.start).toEqualDate('2014-05-02')
    expect(timedEvent.isAllDay).toEqual(false)
    expect(timedEvent.start).toEqualDate('2014-05-10T12:00:00Z')
    expect(zonedEvent.isAllDay).toEqual(false)
    expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00+11:00')
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
    expect(allDayEvent.isAllDay).toEqual(true)
    expect(allDayEvent.start).toEqualDate('2014-05-02')
    expect(timedEvent.isAllDay).toEqual(false)
    expect(timedEvent.start).toEqualDate('2014-05-10T12:00:00Z')
    expect(zonedEvent.isAllDay).toEqual(false)
    expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00Z') // coerced to UTC
  }


  it('can be set dynamically', function(done) {
    var callCnt = 0
    var rootEl

    initCalendar({
      timezone: 'local',
      eventAfterAllRender: function() {
        callCnt++
        if (callCnt === 1) {
          expectLocalTimezone()
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
