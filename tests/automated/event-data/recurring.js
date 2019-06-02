
describe('recurring events', function() {

  describe('when timed events in local timezone', function() {
    pushOptions({
      defaultView: 'timeGridWeek',
      defaultDate: '2017-07-03',
      timeZone: 'local',
      events: [
        { startTime: '09:00', endTime: '11:00', daysOfWeek: [ 2, 4 ] }
      ]
    })

    it('expands events with local time', function() {
      initCalendar()

      var events = currentCalendar.getEvents()

      expect(events[0].start).toEqualLocalDate('2017-07-04T09:00:00')
      expect(events[0].end).toEqualLocalDate('2017-07-04T11:00:00')

      expect(events[1].start).toEqualLocalDate('2017-07-06T09:00:00')
      expect(events[1].end).toEqualLocalDate('2017-07-06T11:00:00')
    })
  })

  describe('when given recur range', function() {
    pushOptions({
      defaultView: 'dayGridMonth',
      defaultDate: '2017-07-03',
      events: [
        { startTime: '09:00', endTime: '11:00', startRecur: '2017-07-05', endRecur: '2017-07-08' }
      ]
    })

    it('expands within given range', function() {
      initCalendar()

      var events = currentCalendar.getEvents()
      expect(events.length).toBe(3)

      expect(events[0].start).toEqualDate('2017-07-05T09:00:00Z')
      expect(events[1].start).toEqualDate('2017-07-06T09:00:00Z')
      expect(events[2].start).toEqualDate('2017-07-07T09:00:00Z')
    })

    describe('when current range is completely outside of recur-range', function() {
      pushOptions({
        defaultDate: '2017-02-02'
      })

      it('won\'t render any events', function() {
        initCalendar()
        let events = currentCalendar.getEvents()
        expect(events.length).toBe(0)
      })
    })
  })

  describe('when event has a duration', function() {
    pushOptions({
      defaultView: 'dayGridWeek',
      defaultDate: '2019-06-02',
      events: [
        { daysOfWeek: [ 6 ], duration: { days: 2 } }
      ]
    })

    it('will render from week before', function() {
      initCalendar()
      let events = currentCalendar.getEvents()
      expect(events[0].start).toEqualDate('2019-06-01')
      expect(events[0].end).toEqualDate('2019-06-03')
      expect(events[1].start).toEqualDate('2019-06-08')
      expect(events[1].end).toEqualDate('2019-06-10')
      expect(events.length).toBe(2)
    })
  })

})
