
describe('Event::moveDates', function() {
  pushOptions({
    timeZone: 'UTC'
  })

  describe('when event doesn\'t have an end', function() {
    it('moves start and keeps end null', function() {
      initCalendar({
        events: [
          { id: '1', start: '2018-09-03T00:00:00' }
        ]
      })
      let event = currentCalendar.getEventById('1')
      event.moveDates({ days: 1, hours: 1 })
      expect(event.start).toEqualDate('2018-09-04T01:00:00Z')
      expect(event.end).toBe(null)
    })
  })

  describe('when event does have an end', function() {
    it('moves start and end by same delta', function() {
      initCalendar({
        events: [
          { id: '1', start: '2018-09-03T00:00:00', end: '2018-09-04T12:00:00' }
        ]
      })
      let event = currentCalendar.getEventById('1')
      event.moveDates({ days: 1, hours: 1 })
      expect(event.start).toEqualDate('2018-09-04T01:00:00Z')
      expect(event.end).toEqualDate('2018-09-05T13:00:00Z')
    })
  })

  it('moves related events of different duration by same delta', function() {
    initCalendar({
      events: [
        { id: '1', groupId: 'a', start: '2018-09-03T00:00:00', end: '2018-09-04T12:00:00' },
        { id: '2', groupId: 'a', start: '2018-10-03T00:00:00', end: '2018-10-04T12:00:00' }
      ]
    })
    let event1 = currentCalendar.getEventById('1')
    event1.moveDates({ days: 1, hours: 1 })
    expect(event1.start).toEqualDate('2018-09-04T01:00:00Z')
    expect(event1.end).toEqualDate('2018-09-05T13:00:00Z')

    let event2 = currentCalendar.getEventById('2')
    expect(event2.start).toEqualDate('2018-10-04T01:00:00Z')
    expect(event2.end).toEqualDate('2018-10-05T13:00:00Z')
  })

  it('does not move unrelated events', function() {
    initCalendar({
      events: [
        { id: '1', groupId: 'a', start: '2018-09-03T00:00:00', end: '2018-09-04T12:00:00' },
        { id: '2', groupId: 'bbb', start: '2018-10-03T00:00:00', end: '2018-10-04T12:00:00' }
      ]
    })
    let event1 = currentCalendar.getEventById('1')
    event1.moveDates({ days: 1, hours: 1 })
    expect(event1.start).toEqualDate('2018-09-04T01:00:00Z')
    expect(event1.end).toEqualDate('2018-09-05T13:00:00Z')

    let event2 = currentCalendar.getEventById('2')
    expect(event2.start).toEqualDate('2018-10-03T00:00:00Z') // same
    expect(event2.end).toEqualDate('2018-10-04T12:00:00Z') // same
  })

})
