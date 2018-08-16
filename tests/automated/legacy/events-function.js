describe('events as a function', function() {

  pushOptions({
    defaultView: 'month',
    defaultDate: '2014-05-01'
  })

  function testEventFunctionParams(arg, callback) {
    expect(arg.start instanceof Date).toEqual(true)
    expect(arg.end instanceof Date).toEqual(true)
    expect(typeof callback).toEqual('function')
  }

  it('requests correctly when local timezone', function(done) {
    initCalendar({
      timezone: 'local',
      events: function(arg, callback) {
        testEventFunctionParams(arg, callback)
        expect(arg.timeZone).toEqual('local')
        expect(arg.start).toEqualDate('2014-04-27T00:00:00') // local
        expect(arg.end).toEqualDate('2014-06-08T00:00:00') // local
        callback([])
        done()
      }
    })
  })

  it('requests correctly when UTC timezone', function(done) {
    initCalendar({
      timezone: 'UTC',
      events: function(arg, callback) {
        testEventFunctionParams(arg, callback)
        expect(arg.timeZone).toEqual('UTC')
        expect(arg.start).toEqualDate('2014-04-27')
        expect(arg.end).toEqualDate('2014-06-08')
        callback([])
        done()
      }
    })
  })

  it('requests correctly when custom timezone', function(done) {
    initCalendar({
      timezone: 'America/Chicago',
      events: function(arg, callback) {
        testEventFunctionParams(arg, callback)
        expect(arg.timeZone).toEqual('America/Chicago')
        expect(arg.start).toEqualDate('2014-04-27')
        expect(arg.end).toEqualDate('2014-06-08')
        callback([])
        done()
      }
    })
  })

  it('requests correctly when timezone changed dynamically', function(done) {
    var callCnt = 0
    var options = {
      timezone: 'America/Chicago',
      events: function(arg, callback) {
        testEventFunctionParams(arg, callback)
        callCnt++
        if (callCnt === 1) {
          expect(arg.timeZone).toEqual('America/Chicago')
          expect(arg.start).toEqualDate('2014-04-27')
          expect(arg.end).toEqualDate('2014-06-08')
          setTimeout(function() {
            currentCalendar.setOption('timezone', 'UTC')
          }, 0)
        } else if (callCnt === 2) {
          expect(arg.timeZone).toEqual('UTC')
          expect(arg.start).toEqualDate('2014-04-27')
          expect(arg.end).toEqualDate('2014-06-08')
          done()
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
      timezone: 'UTC',
      eventSources: [ eventSource ],
      eventRender: function(arg) {
        expect(eventSource.events.calls.count()).toEqual(1)
        expect(arg.el).toHaveClass('customeventclass')
        done()
      }
    })
  })

})
