describe('event object creation', function() {

  /*

  NOTE: Where possible, if there is a specific option that affects event object creation
  behavior, write your tests in the individual file for that option, instead of here.
  Examples of this:
    allDayDefault (tests allDay guessing behavior too)
    eventDataTransform
    forceEventDuration

  */

  function init(singleEventData) {
    initCalendar({
      events: [ singleEventData ]
    })
    return currentCalendar.getEvents()[0]
  }

  it('accepts `date` property as alias for `start`', function() {
    var event = init({
      date: '2014-05-05'
    })
    expect(event.start instanceof Date).toEqual(true)
    expect(event.start).toEqualDate('2014-05-05')
  })

  it('doesn\'t produce an event when an invalid start Date object', function() {
    var event = init({
      start: new Date('asdf')
    })
    expect(event).toBeUndefined()
  })

  it('doesn\'t produce an event when an invalid start string', function() {
    var event = init({
      start: 'asdfasdfasdf'
    })
    expect(event).toBeUndefined()
  })

  it('produces null end when given an invalid Date object', function() {
    var event = init({
      start: '2014-05-01',
      end: new Date('asdf')
    })
    expect(event.start).toEqualDate('2014-05-01')
    expect(event.end).toBe(null)
  })

  it('produces null end when given an invalid string', function() {
    var event = init({
      start: '2014-05-01',
      end: 'asdfasdfasdf'
    })
    expect(event.start).toEqualDate('2014-05-01')
    expect(event.end).toBe(null)
  })

  it('produces null end when given a timed end before the start', function() {
    var event = init({
      start: '2014-05-02T00:00:00',
      end: '2014-05-01T23:00:00'
    })
    expect(event.start).toEqualDate('2014-05-02T00:00:00Z')
    expect(event.end).toBe(null)
  })

  it('produces null end when given a timed end equal to the start', function() {
    var event = init({
      start: '2014-05-02T00:00:00',
      end: '2014-05-01T00:00:00'
    })
    expect(event.start).toEqualDate('2014-05-02T00:00:00Z')
    expect(event.end).toBe(null)
  })

  it('produces null end when given an all-day end before the start', function() {
    var event = init({
      start: '2014-05-02',
      end: '2014-05-02'
    })
    expect(event.start).toEqualDate('2014-05-02')
    expect(event.end).toBe(null)
  })

  it('produces null end when given an all-day end equal to the start', function() {
    var event = init({
      start: '2014-05-02T00:00:00',
      end: '2014-05-02T00:00:00'
    })
    expect(event.start).toEqualDate('2014-05-02T00:00:00Z')
    expect(event.end).toBe(null)
  })

  it('strips times of dates when event is all-day', function() {
    var event = init({
      start: '2014-05-01T01:00:00-12:00',
      end: '2014-05-02T01:00:00-12:00',
      allDay: true
    })
    expect(event.allDay).toEqual(true)
    expect(event.start).toEqualDate('2014-05-01')
    expect(event.end).toEqualDate('2014-05-02')
  })

  it('gives 00:00 times to ambiguously-timed dates when event is timed', function() {
    var event = init({
      start: '2014-05-01',
      end: '2014-05-03',
      allDay: false
    })
    expect(event.allDay).toEqual(false)
    expect(event.start).toEqualDate('2014-05-01T00:00:00Z')
    expect(event.end).toEqualDate('2014-05-03T00:00:00Z')
  })

  it('accepts an array `className`', function() {
    var event = init({
      start: '2014-05-01',
      className: [ 'class1', 'class2' ]
    })
    expect($.isArray(event.classNames)).toEqual(true)
    expect(event.classNames).toEqual([ 'class1', 'class2' ])
  })

  it('accepts a string `className`', function() {
    var event = init({
      start: '2014-05-01',
      className: 'class1 class2'
    })
    expect($.isArray(event.classNames)).toEqual(true)
    expect(event.classNames).toEqual([ 'class1', 'class2' ])
  })

  it('accepts extended properties', function() {
    var event = init({
      start: '2014-05-01',
      prop1: 'prop1val',
      prop2: [ 'a', 'b' ]
    })
    expect(event.extendedProps.prop1).toEqual('prop1val')
    expect(event.extendedProps.prop2).toEqual([ 'a', 'b' ])
  })

})
