describe('timeZone', function() {

  // NOTE: Only deals with the processing of *received* events.
  // Verification of a correct AJAX *request* is done in events-json-feed.js

  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2014-05-01',
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


  it('receives events correctly when local timezone', function() {
    initCalendar({
      timeZone: 'local'
    })
    expectLocalTimezone()
  })

  function expectLocalTimezone() {
    var allDayEvent = currentCalendar.getEventById('1')
    var timedEvent = currentCalendar.getEventById('2')
    var zonedEvent = currentCalendar.getEventById('3')
    expect(allDayEvent.allDay).toEqual(true)
    expect(allDayEvent.start).toEqualLocalDate('2014-05-02T00:00:00')
    expect(timedEvent.allDay).toEqual(false)
    expect(timedEvent.start).toEqualLocalDate('2014-05-10T12:00:00')
    expect(zonedEvent.allDay).toEqual(false)
    expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00+11:00')
  }


  it('receives events correctly when UTC timezone', function() {
    initCalendar({
      timeZone: 'UTC'
    })
    expectUtcTimezone()
  })

  function expectUtcTimezone() {
    var allDayEvent = currentCalendar.getEventById('1')
    var timedEvent = currentCalendar.getEventById('2')
    var zonedEvent = currentCalendar.getEventById('3')
    expect(allDayEvent.allDay).toEqual(true)
    expect(allDayEvent.start).toEqualDate('2014-05-02')
    expect(timedEvent.allDay).toEqual(false)
    expect(timedEvent.start).toEqualDate('2014-05-10T12:00:00Z')
    expect(zonedEvent.allDay).toEqual(false)
    expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00+11:00')
  }


  it('receives events correctly when custom timezone', function() {
    initCalendar({
      timeZone: 'America/Chicago'
    })
    expectCustomTimezone()
  })

  function expectCustomTimezone() {
    var allDayEvent = currentCalendar.getEventById('1')
    var timedEvent = currentCalendar.getEventById('2')
    var zonedEvent = currentCalendar.getEventById('3')
    expect(allDayEvent.allDay).toEqual(true)
    expect(allDayEvent.start).toEqualDate('2014-05-02')
    expect(timedEvent.allDay).toEqual(false)
    expect(timedEvent.start).toEqualDate('2014-05-10T12:00:00Z')
    expect(zonedEvent.allDay).toEqual(false)
    expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00Z') // coerced to UTC
  }


  it('can be set dynamically', function() {
    initCalendar({
      timeZone: 'local'
    })

    expectLocalTimezone()

    currentCalendar.setOption('timeZone', 'UTC')
    var allDayEvent = currentCalendar.getEventById('1')
    var timedEvent = currentCalendar.getEventById('2')
    var zonedEvent = currentCalendar.getEventById('3')
    expect(allDayEvent.allDay).toEqual(true)
    expect(allDayEvent.start).toEqualDate('2014-05-02')
    expect(timedEvent.allDay).toEqual(false)
    expect(timedEvent.start).toEqualLocalDate('2014-05-10T12:00:00') // was parsed as LOCAL originally
    expect(zonedEvent.allDay).toEqual(false)
    expect(zonedEvent.start).toEqualDate('2014-05-10T14:00:00+11:00')
  })

})
