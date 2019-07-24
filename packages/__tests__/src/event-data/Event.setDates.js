describe('Event::setDates', function() {
  pushOptions({
    now: '2018-09-03',
    timeZone: 'UTC',
    defaultTimedEventDuration: '01:00',
    events: [
      { id: '1', start: '2018-09-05T12:00:00' }
    ]
  })

  describe('when setting different start', function() {
    it('changes start and gives it an end', function() {
      initCalendar()
      let event = currentCalendar.getEventById('1')
      event.setDates('2018-09-05T14:00:00', '2018-09-05T16:00:00')
      expect(event.start).toEqualDate('2018-09-05T14:00:00Z')
      expect(event.end).toEqualDate('2018-09-05T16:00:00Z')
    })
  })

  describe('when setting same start and end', function() {
    it('changes nothing and end remains null', function() {
      initCalendar()
      let event = currentCalendar.getEventById('1')
      event.setDates('2018-09-05T12:00:00', '2018-09-05T13:00:00')
      expect(event.start).toEqualDate('2018-09-05T12:00:00Z')
      expect(event.end).toBe(null)
    })
  })

  describe('when setting different end', function() {
    it('changes end and gives it an end', function() {
      initCalendar()
      let event = currentCalendar.getEventById('1')
      event.setDates('2018-09-05T12:00:00', '2018-09-05T18:00:00')
      expect(event.start).toEqualDate('2018-09-05T12:00:00Z')
      expect(event.end).toEqualDate('2018-09-05T18:00:00Z')
    })
  })

  describe('when setting different start AND end', function() {
    describe('if duration is effectively the same', function() {
      it('changes start and leaves end null', function() {
        initCalendar()
        let event = currentCalendar.getEventById('1')
        event.setDates('2018-09-06T01:00:00', '2018-09-06T02:00:00')
        expect(event.start).toEqualDate('2018-09-06T01:00:00Z')
        expect(event.end).toBe(null)
      })
    })
  })

  describe('when called with a null end', function() {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-05T12:00:00', end: '2018-09-05T14:00:00' }
      ]
    })

    it('clears the end', function() {
      initCalendar()
      let event = currentCalendar.getEventById('1')
      event.setDates('2018-09-06T01:00:00', null)
      expect(event.start).toEqualDate('2018-09-06T01:00:00Z')
      expect(event.end).toBe(null)
    })
  })

  it('can set allDay to true', function() {
    initCalendar() // { id: '1', start: '2018-09-05T12:00:00' }
    let event = currentCalendar.getEventById('1')
    event.setDates('2018-09-06', '2018-09-10', { allDay: true })
    expect(event.start).toEqualDate('2018-09-06')
    expect(event.end).toEqualDate('2018-09-10')
    expect(event.allDay).toBe(true)
  })

  it('can set allDay to false', function() {
    initCalendar({
      events: [
        { id: '1', start: '2018-09-05', end: '2018-09-08' }
      ]
    })

    let event = currentCalendar.getEventById('1')
    event.setDates('2018-09-06T10:00:00', '2018-09-10T02:00:00', { allDay: false })
    expect(event.start).toEqualDate('2018-09-06T10:00:00Z')
    expect(event.end).toEqualDate('2018-09-10T02:00:00Z')
    expect(event.allDay).toBe(false)
  })

  it('shortens related events of different duration by same delta', function() {
    initCalendar({
      events: [
        { id: '1', groupId: 'a', start: '2018-09-03', end: '2018-09-05' },
        { id: '2', groupId: 'a', start: '2018-09-13', end: '2018-09-15' }
      ]
    })

    let event1 = currentCalendar.getEventById('1')
    event1.setDates('2018-09-02', '2018-09-06') // start back by 1, end ahead by 1
    expect(event1.start).toEqualDate('2018-09-02')
    expect(event1.end).toEqualDate('2018-09-06')

    let event2 = currentCalendar.getEventById('2')
    expect(event2.start).toEqualDate('2018-09-12')
    expect(event2.end).toEqualDate('2018-09-16')
  })

})
