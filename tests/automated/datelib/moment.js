
describe('moment plugin', function() {

  // TODO: test formatting

  describe('toMoment', function() {

    describe('timezone handling', function() {

      it('transfers UTC', function() {
        let calendar = new FullCalendar.Calendar(document.createElement('div'), {
          events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
          timeZone: 'UTC'
        })
        let event = calendar.getEvents()[0]
        var startMom = FullCalendar.toMoment(calendar, event.start)
        var endMom = FullCalendar.toMoment(calendar, event.end)
        expect(startMom.format()).toEqual('2018-09-05T12:00:00Z')
        expect(endMom.format()).toEqual('2018-09-05T18:00:00Z')
      })

      it('transfers local', function() {
        let calendar = new FullCalendar.Calendar(document.createElement('div'), {
          events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
          timeZone: 'local'
        })
        let event = calendar.getEvents()[0]
        var startMom = FullCalendar.toMoment(calendar, event.start)
        var endMom = FullCalendar.toMoment(calendar, event.end)
        expect(startMom.toDate()).toEqualDate('2018-09-05T12:00:00') // compare to local
        expect(endMom.toDate()).toEqualDate('2018-09-05T18:00:00') // compare to local
      })

    })

    it('transfers locale', function() {
      let calendar = new FullCalendar.Calendar(document.createElement('div'), {
        events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
        locale: 'es'
      })
      let event = calendar.getEvents()[0]
      var mom = FullCalendar.toMoment(calendar, event.start)
      expect(mom.locale()).toEqual('es')
    })

  })

  describe('toDuration', function() {

    it('converts correctly', function() {
      let calendar = new FullCalendar.Calendar(document.createElement('div'), {
        defaultTimedEventDuration: '05:00',
        defaultAllDayEventDuration: { days: 3 }
      })

      // hacky way to have a duration parsed
      let timedDuration = FullCalendar.toDuration(calendar.defaultTimedEventDuration)
      let allDayDuration = FullCalendar.toDuration(calendar.defaultAllDayEventDuration)

      expect(timedDuration.asHours()).toBe(5)
      expect(allDayDuration.asDays()).toBe(3)
    })

  })

})
