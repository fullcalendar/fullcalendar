import { plainAndZoneToString, plainAndZoneToDate } from "../lib/temporal-convert"

describe('events as a function', () => {
  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2014-05-01',
  })

  function testEventFunctionParams(info, callback) {
    expect(info.start instanceof Date).toEqual(true)
    expect(info.end instanceof Date).toEqual(true)
    expect(typeof callback).toEqual('function')
  }

  it('requests correctly when local timezone', (done) => {
    initCalendar({
      timeZone: 'local',
      events(info, callback) {
        testEventFunctionParams(info, callback)
        expect(info.timeZone).toEqual('local')
        expect(info.start).toEqualLocalDate('2014-04-27T00:00:00')
        expect(info.startStr).toMatch(/^2014-04-27T00:00:00[-+]/)
        expect(info.end).toEqualLocalDate('2014-06-08T00:00:00')
        expect(info.endStr).toMatch(/^2014-06-08T00:00:00[-+]/)
        callback([])
        setTimeout(done) // :(
      },
    })
  })

  it('requests correctly when UTC timezone', (done) => {
    initCalendar({
      timeZone: 'UTC',
      events(info, callback) {
        testEventFunctionParams(info, callback)
        expect(info.timeZone).toEqual('UTC')
        expect(info.start).toEqualDate('2014-04-27T00:00:00Z')
        expect(info.startStr).toEqual('2014-04-27T00:00:00Z')
        expect(info.end).toEqualDate('2014-06-08T00:00:00Z')
        expect(info.endStr).toEqual('2014-06-08T00:00:00Z')
        callback([])
        setTimeout(done) // :(
      },
    })
  })

  it('requests correctly when custom timezone', (done) => {
    const timeZone = 'America/Chicago'
    initCalendar({
      timeZone,
      events(info, callback) {
        testEventFunctionParams(info, callback)
        expect(info.timeZone).toEqual(timeZone)
        expect(info.start).toEqualDate(plainAndZoneToDate('2014-04-27T00:00:00', timeZone))
        expect(info.startStr).toEqual(plainAndZoneToString('2014-04-27T00:00:00', timeZone))
        expect(info.end).toEqualDate(plainAndZoneToDate('2014-06-08T00:00:00', timeZone))
        expect(info.endStr).toEqual(plainAndZoneToString('2014-06-08T00:00:00', timeZone))
        callback([])
        setTimeout(done) // :(
      },
    })
  })

  it('requests correctly when timezone changed dynamically', (done) => {
    const timeZone = 'America/Chicago'
    let callCnt = 0
    let options = {
      timeZone,
      events(info, callback) {
        testEventFunctionParams(info, callback)
        callCnt += 1
        if (callCnt === 1) {
          expect(info.timeZone).toEqual(timeZone)
          expect(info.start).toEqualDate(plainAndZoneToDate('2014-04-27', timeZone))
          expect(info.end).toEqualDate(plainAndZoneToDate('2014-06-08', timeZone))
          setTimeout(() => {
            calendar.setOption('timeZone', 'UTC')
          }, 0)
        } else if (callCnt === 2) {
          expect(info.timeZone).toEqual('UTC')
          expect(info.start).toEqualDate(plainAndZoneToDate('2014-04-27', 'UTC'))
          expect(info.end).toEqualDate(plainAndZoneToDate('2014-06-08', 'UTC'))
          setTimeout(done) // :(
        }
      },
    }

    let calendar = initCalendar(options)
  })

  it('requests correctly with event source extended form', (done) => {
    let eventSource = {
      className: 'customeventclass',
      events(info, callback) {
        testEventFunctionParams(info, callback)
        expect(info.timeZone).toEqual('UTC')
        expect(info.start).toEqualDate('2014-04-27')
        expect(info.end).toEqualDate('2014-06-08')
        callback([
          {
            title: 'event1',
            start: '2014-05-10',
          },
        ])
      },
    }
    spyOn(eventSource, 'events').and.callThrough()

    initCalendar({
      timeZone: 'UTC',
      eventSources: [eventSource],
      eventDidMount(info) {
        expect(eventSource.events.calls.count()).toEqual(1)
        expect(info.el).toHaveClass('customeventclass')
        setTimeout(done) // :(
      },
    })
  })

  it('can return a promise-like object', (done) => {
    let calendar = initCalendar({
      events() {
        let deferred = $.Deferred() // we want tests to run in IE11, which doesn't have native promises
        setTimeout(() => {
          deferred.resolve([
            { start: '2018-09-04' },
          ])
        }, 100)
        return deferred.promise()
      },
    })

    setTimeout(() => {
      expect(calendar.getEvents().length).toBe(1)
      setTimeout(done) // :(
    }, 101)
  })
})
