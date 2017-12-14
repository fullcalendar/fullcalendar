
describe('timezone', function() {

  // NOTE: Only deals with the processing of *received* events.
  // Verification of a correct AJAX *request* is done in events-json-feed.js

  var options

  beforeEach(function() {
    affix('#cal')
    options = {
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
    }
  })


  it('receives events correctly when no timezone', function(done) {
    options.eventAfterAllRender = function() {
      expectNoTimezone()
      done()
    }
    $('#cal').fullCalendar(options)
  })

  function expectNoTimezone() {
    var allDayEvent = $('#cal').fullCalendar('clientEvents', '1')[0]
    var timedEvent = $('#cal').fullCalendar('clientEvents', '2')[0]
    var zonedEvent = $('#cal').fullCalendar('clientEvents', '3')[0]
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
    options.timezone = 'local'
    options.eventAfterAllRender = function() {
      expectLocalTimezone()
      done()
    }
    $('#cal').fullCalendar(options)
  })

  function expectLocalTimezone() {
    var allDayEvent = $('#cal').fullCalendar('clientEvents', '1')[0]
    var timedEvent = $('#cal').fullCalendar('clientEvents', '2')[0]
    var zonedEvent = $('#cal').fullCalendar('clientEvents', '3')[0]
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
    options.timezone = 'UTC'
    options.eventAfterAllRender = function() {
      expectUtcTimezone()
      done()
    }
    $('#cal').fullCalendar(options)
  })

  function expectUtcTimezone() {
    var allDayEvent = $('#cal').fullCalendar('clientEvents', '1')[0]
    var timedEvent = $('#cal').fullCalendar('clientEvents', '2')[0]
    var zonedEvent = $('#cal').fullCalendar('clientEvents', '3')[0]
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
    options.timezone = 'America/Chicago'
    options.eventAfterAllRender = function() {
      expectCustomTimezone()
      done()
    }
    $('#cal').fullCalendar(options)
  })

  function expectCustomTimezone() {
    var allDayEvent = $('#cal').fullCalendar('clientEvents', '1')[0]
    var timedEvent = $('#cal').fullCalendar('clientEvents', '2')[0]
    var zonedEvent = $('#cal').fullCalendar('clientEvents', '3')[0]
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

    options.timezone = false
    options.eventAfterAllRender = function() {
      callCnt++
      if (callCnt === 1) {
        expectNoTimezone()
        rootEl = $('.fc-view > *:first')
        expect(rootEl.length).toBe(1)
        $('#cal').fullCalendar('option', 'timezone', 'UTC') // will cause second call...
      } else if (callCnt === 2) {
        expectUtcTimezone()
        expect($('.fc-view > *:first')[0]).toBe(rootEl[0]) // ensure didn't rerender whole calendar
        done()
      }
    }

    $('#cal').fullCalendar(options)
  })

})
