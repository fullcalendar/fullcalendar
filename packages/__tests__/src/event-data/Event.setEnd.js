describe('Event::setEnd', function() {
  pushOptions({
    now: '2018-09-03',
    timeZone: 'UTC',
    defaultTimedEventDuration: '01:00'
  })

  describe('when event doesn\'t have an end', function() {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-10T00:00:00' }
      ]
    })

    it('sets end and keeps start', function() {
      initCalendar()
      let event = currentCalendar.getEventById('1')
      event.setEnd('2018-09-12T02:00:00')
      expect(event.start).toEqualDate('2018-09-10T00:00:00Z')
      expect(event.end).toEqualDate('2018-09-12T02:00:00Z')
    })
  })

  describe('when event does have an end', function() {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-10T00:00:00', end: '2018-09-11T00:00:00' }
      ]
    })

    it('changes end and keeps start', function() {
      initCalendar()
      let event = currentCalendar.getEventById('1')
      event.setEnd('2018-09-12T02:00:00')
      expect(event.start).toEqualDate('2018-09-10T00:00:00Z')
      expect(event.end).toEqualDate('2018-09-12T02:00:00Z')
    })
  })

  it('shortens related events of different duration by same delta', function() {
    initCalendar({
      events: [
        { id: '1', groupId: 'a', start: '2018-09-10T00:00:00', end: '2018-09-11T00:00:00' },
        { id: '2', groupId: 'a', start: '2018-09-14T00:00:00', end: '2018-09-16T00:00:00' }
      ]
    })

    let event1 = currentCalendar.getEventById('1')
    event1.setEnd('2018-09-12T02:00:00') // move end forward by 1 day, 2 hours
    expect(event1.start).toEqualDate('2018-09-10T00:00:00Z')
    expect(event1.end).toEqualDate('2018-09-12T02:00:00Z')

    let event2 = currentCalendar.getEventById('2')
    expect(event2.start).toEqualDate('2018-09-14T00:00:00Z')
    expect(event2.end).toEqualDate('2018-09-17T02:00:00Z')
  })

})
