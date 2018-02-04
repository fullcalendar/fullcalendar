describe('events as a function', function() {

  pushOptions({
    defaultView: 'month',
    defaultDate: '2014-05-01'
  })

  function testEventFunctionParams(start, end, timezone, callback) {
    expect(moment.isMoment(start)).toEqual(true)
    expect(start.hasTime()).toEqual(false)
    expect(start.hasZone()).toEqual(false)
    expect(start.format()).toEqual('2014-04-27')
    expect(moment.isMoment(end)).toEqual(true)
    expect(end.hasTime()).toEqual(false)
    expect(end.hasZone()).toEqual(false)
    expect(end.format()).toEqual('2014-06-08')
    expect(typeof callback).toEqual('function')
  }

  it('requests correctly when no timezone', function(done) {
    initCalendar({
      events: function(start, end, timezone, callback) {
        testEventFunctionParams(start, end, timezone, callback)
        expect(timezone).toEqual(false)
        callback([])
        done()
      }
    })
  })

  it('requests correctly when local timezone', function(done) {
    initCalendar({
      timezone: 'local',
      events: function(start, end, timezone, callback) {
        testEventFunctionParams(start, end, timezone, callback)
        expect(timezone).toEqual('local')
        callback([])
        done()
      }
    })
  })

  it('requests correctly when UTC timezone', function(done) {
    initCalendar({
      timezone: 'UTC',
      events: function(start, end, timezone, callback) {
        testEventFunctionParams(start, end, timezone, callback)
        expect(timezone).toEqual('UTC')
        callback([])
        done()
      }
    })
  })

  it('requests correctly when custom timezone', function(done) {
    initCalendar({
      timezone: 'America/Chicago',
      events: function(start, end, timezone, callback) {
        testEventFunctionParams(start, end, timezone, callback)
        expect(timezone).toEqual('America/Chicago')
        callback([])
        done()
      }
    })
  })

  it('requests correctly when timezone changed dynamically', function(done) {
    var callCnt = 0
    var options = {
      timezone: 'America/Chicago',
      events: function(start, end, timezone, callback) {
        testEventFunctionParams(start, end, timezone, callback)
        callCnt++
        if (callCnt === 1) {
          expect(timezone).toEqual('America/Chicago')
          setTimeout(function() {
            currentCalendar.option('timezone', 'UTC')
          }, 0)
        } else if (callCnt === 2) {
          expect(timezone).toEqual('UTC')
          done()
        }
      }
    }

    initCalendar(options)
  })

  it('requests correctly with event source extended form', function(done) {
    var eventSource = {
      className: 'customeventclass',
      events: function(start, end, timezone, callback) {
        testEventFunctionParams(start, end, timezone, callback)
        expect(timezone).toEqual(false)
        callback([
          {
            title: 'event1',
            start: '2014-05-10'
          }
        ])
      }
    }
    spyOn(eventSource, 'events').and.callThrough()

    initCalendar({
      eventSources: [ eventSource ],
      eventRender: function(eventObj, eventElm) {
        expect(eventSource.events.calls.count()).toEqual(1)
        expect(eventElm).toHaveClass('customeventclass')
        done()
      }
    })
  })

})
