describe('Event::setStart', () => {
  pushOptions({
    now: '2018-09-03',
    timeZone: 'UTC',
    defaultTimedEventDuration: '01:00',
  })

  describe('when event doesn\'t have an end', () => {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-05T00:00:00' },
      ],
    })

    describe('when not maintaining duration', () => {
      it('moves start and gives event an end', () => {
        initCalendar()
        let event = currentCalendar.getEventById('1')
        event.setStart('2018-09-01')
        expect(event.start).toEqualDate('2018-09-01T00:00:00Z')
        expect(event.end).toEqualDate('2018-09-05T01:00:00Z')
      })
    })

    describe('when maintaining duration', () => {
      it('moves start and keeps no end', () => {
        initCalendar()
        let event = currentCalendar.getEventById('1')
        event.setStart('2018-09-01', { maintainDuration: true })
        expect(event.start).toEqualDate('2018-09-01')
        expect(event.end).toBe(null)
      })
    })

    it('can revert', () => {
      let revertCalled = false
      let calendar = initCalendar({
        eventChange(info) {
          revertCalled = true
          info.revert()
        },
      })

      let event = calendar.getEventById('1')
      event.setStart('2018-09-01') // will be immediately undone
      expect(revertCalled).toBe(true)

      let events = calendar.getEvents()
      expect(events.length).toBe(1)
      expect(events[0].start).toEqualDate('2018-09-05T00:00:00')
    })
  })

  describe('when event does have an end', () => {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-05T00:00:00', end: '2018-09-07T00:00:00' },
      ],
    })

    describe('when not maintaining duration', () => {
      it('moves start and keeps the same end', () => {
        initCalendar()
        let event = currentCalendar.getEventById('1')
        event.setStart('2018-09-01')
        expect(event.start).toEqualDate('2018-09-01')
        expect(event.end).toEqualDate('2018-09-07')
      })
    })

    describe('when maintaining duration', () => {
      it('move start and keeps the end', () => {
        initCalendar()
        let event = currentCalendar.getEventById('1')
        event.setStart('2018-09-01', { maintainDuration: true })
        expect(event.start).toEqualDate('2018-09-01')
        expect(event.end).toEqualDate('2018-09-03')
      })
    })
  })

  describe('when event is all-day', () => {
    pushOptions({
      events: [
        { id: '1', start: '2018-09-05', end: '2018-09-07', allDay: true },
      ],
    })

    describe('when setting start to another all-day', () => {
      it('moves start', () => {
        initCalendar()
        let event = currentCalendar.getEventById('1')
        event.setStart('2018-09-01')
        expect(event.start).toEqualDate('2018-09-01')
        expect(event.end).toEqualDate('2018-09-07')
        expect(event.allDay).toBe(true)
      })
    })

    describe('when setting start to timed', () => {
      it('moves start to rounded-down start-of-day', () => {
        initCalendar()
        let event = currentCalendar.getEventById('1')
        event.setStart('2018-09-01T23:00:00')
        expect(event.start).toEqualDate('2018-09-01')
        expect(event.end).toEqualDate('2018-09-07')
        expect(event.allDay).toBe(true)
      })
    })
  })

  it('shortens related events of different duration by same delta', () => {
    initCalendar({
      events: [
        { id: '1', groupId: 'a', start: '2018-09-05T00:00:00', end: '2018-09-10T00:00:00' },
        { id: '2', groupId: 'a', start: '2018-09-06T00:00:00', end: '2018-09-09T00:00:00' },
      ],
    })

    let event1 = currentCalendar.getEventById('1')
    event1.setStart('2018-09-01') // move start back by 4 days
    expect(event1.start).toEqualDate('2018-09-01')
    expect(event1.end).toEqualDate('2018-09-10')

    let event2 = currentCalendar.getEventById('2')
    expect(event2.start).toEqualDate('2018-09-02')
    expect(event2.end).toEqualDate('2018-09-09')
  })
})
