
describe('luxon plugin', function() {
  let toDateTime = FullCalendar.Luxon.toDateTime
  let toDuration = FullCalendar.Luxon.toDuration

  // TODO: test formatting
  // TODO: test named timezones

  describe('toDateTime', function() {

    describe('timezone handling', function() {

      it('transfers UTC', function() {
        let calendar = new FullCalendar.Calendar(document.createElement('div'), {
          events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
          timeZone: 'UTC'
        })
        let event = calendar.getEvents()[0]
        var start = toDateTime(calendar, event.start)
        var end = toDateTime(calendar, event.end)
        expect(start.toISO()).toBe('2018-09-05T12:00:00.000Z')
        expect(start.zoneName).toBe('UTC')
        expect(end.toISO()).toBe('2018-09-05T18:00:00.000Z')
        expect(end.zoneName).toBe('UTC')
      })

      it('transfers local', function() {
        let calendar = new FullCalendar.Calendar(document.createElement('div'), {
          events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
          timeZone: 'local'
        })
        let event = calendar.getEvents()[0]
        var start = toDateTime(calendar, event.start)
        var end = toDateTime(calendar, event.end)
        expect(start.toJSDate()).toEqualDate('2018-09-05T12:00:00') // compare to local
        expect(start.zoneName).toMatch('/') // has a named timezone
        expect(end.toJSDate()).toEqualDate('2018-09-05T18:00:00') // compare to local
        expect(end.zoneName).toMatch('/') // has a named timezone
      })

    })

    it('transfers locale', function() {
      let calendar = new FullCalendar.Calendar(document.createElement('div'), {
        events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
        locale: 'es'
      })
      let event = calendar.getEvents()[0]
      var datetime = toDateTime(calendar, event.start)
      expect(datetime.locale).toEqual('es')
    })

  })

  describe('toDuration', function() {

    it('converts correctly', function() {
      let calendar = new FullCalendar.Calendar(document.createElement('div'), {
        defaultTimedEventDuration: '05:00',
        defaultAllDayEventDuration: { days: 3 }
      })

      // hacky way to have a duration parsed
      let timedDuration = toDuration(calendar.defaultTimedEventDuration)
      let allDayDuration = toDuration(calendar.defaultAllDayEventDuration)

      expect(timedDuration.as('hours')).toBe(5)
      expect(allDayDuration.as('days')).toBe(3)
    })

  })

})
