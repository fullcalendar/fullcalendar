describe('timeZone', function() {

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
      timeZone: 'local',
      _eventsPositioned: function() {
        expectLocalTimezone()
        done()
      }
    })
  })

  function expectLocalTimezone() {
    var allDayEvent = currentCalendar.getEventById('1')
    var timedEvent = currentCalendar.getEventById('2')
    var zonedEvent = currentCalendar.getEventById('3')
    expect(allDayEvent.isAllDay).toEqual(true)
    expect(allDayEvent.start).toEqualDate('2014-05-02T00:00:00') // local
    expect(timedEvent.isAllDay).toEqual(false)
    expect(timedEvent.start).toEqualDate('2014-05-10T12:00:00') // local
    expect(zonedEvent.isAllDay).toEqual(false)
    expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00+11:00')
  }


  it('receives events correctly when UTC timezone', function(done) {
    initCalendar({
      timeZone: 'UTC',
      _eventsPositioned: function() {
        expectUtcTimezone()
        done()
      }
    })
  })

  function expectUtcTimezone() {
    var allDayEvent = currentCalendar.getEventById('1')
    var timedEvent = currentCalendar.getEventById('2')
    var zonedEvent = currentCalendar.getEventById('3')
    expect(allDayEvent.isAllDay).toEqual(true)
    expect(allDayEvent.start).toEqualDate('2014-05-02')
    expect(timedEvent.isAllDay).toEqual(false)
    expect(timedEvent.start).toEqualDate('2014-05-10T12:00:00Z')
    expect(zonedEvent.isAllDay).toEqual(false)
    expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00+11:00')
  }


  it('receives events correctly when custom timezone', function(done) {
    initCalendar({
      timeZone: 'America/Chicago',
      _eventsPositioned: function() {
        expectCustomTimezone()
        done()
      }
    })
  })

  function expectCustomTimezone() {
    var allDayEvent = currentCalendar.getEventById('1')
    var timedEvent = currentCalendar.getEventById('2')
    var zonedEvent = currentCalendar.getEventById('3')
    expect(allDayEvent.isAllDay).toEqual(true)
    expect(allDayEvent.start).toEqualDate('2014-05-02')
    expect(timedEvent.isAllDay).toEqual(false)
    expect(timedEvent.start).toEqualDate('2014-05-10T12:00:00Z')
    expect(zonedEvent.isAllDay).toEqual(false)
    expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00Z') // coerced to UTC
  }


  it('can be set dynamically', function(done) {
    var callCnt = 0

    initCalendar({
      timeZone: 'local',
      _eventsPositioned: function() {
        callCnt++
        if (callCnt === 1) {

          expectLocalTimezone()
          currentCalendar.setOption('timeZone', 'UTC') // will cause second call...

        } else if (callCnt === 2) {

          var allDayEvent = currentCalendar.getEventById('1')
          var timedEvent = currentCalendar.getEventById('2')
          var zonedEvent = currentCalendar.getEventById('3')
          expect(allDayEvent.isAllDay).toEqual(true)
          expect(allDayEvent.start).toEqualDate('2014-05-02')
          expect(timedEvent.isAllDay).toEqual(false)
          expect(timedEvent.start).toEqualDate('2014-05-10T12:00:00') // was parsed as LOCAL originally
          expect(zonedEvent.isAllDay).toEqual(false)
          expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00+11:00')

          done()
        }
      }
    })
  })

})
