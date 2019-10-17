describe('Event::moveStart', function() {
  pushOptions({
    timeZone: 'UTC',
    defaultTimedEventDuration: '01:00'
  })

  describe('when event doesn\'t have an end', function() {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-03T12:00:00' }
      ]
    })

    it('moves start and generates an end', function() {
      initCalendar()
      let event = currentCalendar.getEventById('1')
      event.moveStart({ hours: -5 })
      expect(event.start).toEqualDate('2018-09-03T07:00:00Z')
      expect(event.end).toEqualDate('2018-09-03T13:00:00Z')
    })
  })

  describe('when event does have an end', function() {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-03T12:00:00', end: '2018-09-03T15:00:00' }
      ]
    })

    it('moves start and keeps end', function() {
      initCalendar()
      let event = currentCalendar.getEventById('1')
      event.moveStart({ hours: -5 })
      expect(event.start).toEqualDate('2018-09-03T07:00:00Z')
      expect(event.end).toEqualDate('2018-09-03T15:00:00Z')
    })
  })

  describe('when moving start past end', function() {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-03T12:00:00', end: '2018-09-03T15:00:00' }
      ]
    })

    it('resets end to reflect default duration', function() {
      initCalendar()
      let event = currentCalendar.getEventById('1')
      event.moveStart({ days: 1 })
      expect(event.start).toEqualDate('2018-09-04T12:00:00Z')
      expect(event.end).toEqualDate('2018-09-04T13:00:00Z')
    })
  })

})
