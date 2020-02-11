describe('events as a function', function() {

  pushOptions({
    defaultView: 'dayGridMonth',
    defaultDate: '2014-05-01'
  })

  function testEventFunctionParams(arg, callback) {
    expect(arg.start instanceof Date).toEqual(true)
    expect(arg.end instanceof Date).toEqual(true)
    expect(typeof callback).toEqual('function')
  }

  it('requests correctly when local timezone', function(done) {
    initCalendar({
      timeZone: 'local',
      events: function(arg, callback) {
        testEventFunctionParams(arg, callback)
        expect(arg.timeZone).toEqual('local')
        expect(arg.start).toEqualLocalDate('2014-04-27T00:00:00')
        expect(arg.startStr).toMatch(/^2014-04-27T00:00:00[-+]/)
        expect(arg.end).toEqualLocalDate('2014-06-08T00:00:00')
        expect(arg.endStr).toMatch(/^2014-06-08T00:00:00[-+]/)
        callback([])
        setTimeout(done) // :(
      }
    })
  })

  it('requests correctly when UTC timezone', function(done) {
    initCalendar({
      timeZone: 'UTC',
      events: function(arg, callback) {
        testEventFunctionParams(arg, callback)
        expect(arg.timeZone).toEqual('UTC')
        expect(arg.start).toEqualDate('2014-04-27T00:00:00Z')
        expect(arg.startStr).toEqual('2014-04-27T00:00:00Z')
        expect(arg.end).toEqualDate('2014-06-08T00:00:00Z')
        expect(arg.endStr).toEqual('2014-06-08T00:00:00Z')
        callback([])
        setTimeout(done) // :(
      }
    })
  })

  it('requests correctly when custom timezone', function(done) {
    initCalendar({
      timeZone: 'America/Chicago',
      events: function(arg, callback) {
        testEventFunctionParams(arg, callback)
        expect(arg.timeZone).toEqual('America/Chicago')
        expect(arg.start).toEqualDate('2014-04-27T00:00:00Z')
        expect(arg.startStr).toEqual('2014-04-27T00:00:00') // no Z
        expect(arg.end).toEqualDate('2014-06-08T00:00:00Z')
        expect(arg.endStr).toEqual('2014-06-08T00:00:00') // no Z
        callback([])
        setTimeout(done) // :(
      }
    })
  })

  it('requests correctly when timezone changed dynamically', function(done) {
    var callCnt = 0
    var options = {
      timeZone: 'America/Chicago',
      events: function(arg, callback) {
        testEventFunctionParams(arg, callback)
        callCnt++
        if (callCnt === 1) {
          expect(arg.timeZone).toEqual('America/Chicago')
          expect(arg.start).toEqualDate('2014-04-27')
          expect(arg.end).toEqualDate('2014-06-08')
          setTimeout(function() {
            currentCalendar.setOption('timeZone', 'UTC')
          }, 0)
        } else if (callCnt === 2) {
          expect(arg.timeZone).toEqual('UTC')
          expect(arg.start).toEqualDate('2014-04-27')
          expect(arg.end).toEqualDate('2014-06-08')
          setTimeout(done) // :(
        }
      }
    }

    initCalendar(options)
  })

  it('requests correctly with event source extended form', function(done) {
    var eventSource = {
      className: 'customeventclass',
      events: function(arg, callback) {
        testEventFunctionParams(arg, callback)
        expect(arg.timeZone).toEqual('UTC')
        expect(arg.start).toEqualDate('2014-04-27')
        expect(arg.end).toEqualDate('2014-06-08')
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
      timeZone: 'UTC',
      eventSources: [ eventSource ],
      eventRender: function(arg) {
        expect(eventSource.events.calls.count()).toEqual(1)
        expect(arg.el).toHaveClass('customeventclass')
        setTimeout(done) // :(
      }
    })
  })

  it('can return a promise-like object', function(done) {
    initCalendar({
      events(arg) {
        let deferred = $.Deferred() // we want tests to run in IE11, which doesn't have native promises
        setTimeout(function() {
          deferred.resolve([
            { start: '2018-09-04' }
          ])
        }, 100)
        return deferred.promise()
      },
      _eventsPositioned() {
        expect(currentCalendar.getEvents().length).toBe(1)
        setTimeout(done) // :(
      }
    })
  })

})
