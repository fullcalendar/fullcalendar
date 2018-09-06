import { getSingleEl, getEventElTimeText } from '../event-render/EventRenderUtils'

describe('moment plugin', function() {
  let toMoment = FullCalendar.Moment.toMoment
  let toDuration = FullCalendar.Moment.toDuration

  describe('toMoment', function() {

    describe('timezone handling', function() {

      it('transfers UTC', function() {
        let calendar = new FullCalendar.Calendar(document.createElement('div'), {
          events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
          timeZone: 'UTC'
        })
        let event = calendar.getEvents()[0]
        var startMom = toMoment(calendar, event.start)
        var endMom = toMoment(calendar, event.end)
        expect(startMom.format()).toEqual('2018-09-05T12:00:00Z')
        expect(endMom.format()).toEqual('2018-09-05T18:00:00Z')
      })

      it('transfers local', function() {
        let calendar = new FullCalendar.Calendar(document.createElement('div'), {
          events: [ { start: '2018-09-05T12:00:00', end: '2018-09-05T18:00:00' } ],
          timeZone: 'local'
        })
        let event = calendar.getEvents()[0]
        var startMom = toMoment(calendar, event.start)
        var endMom = toMoment(calendar, event.end)
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
      var mom = toMoment(calendar, event.start)
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
      let timedDuration = toDuration(calendar.defaultTimedEventDuration)
      let allDayDuration = toDuration(calendar.defaultAllDayEventDuration)

      expect(timedDuration.asHours()).toBe(5)
      expect(allDayDuration.asDays()).toBe(3)
    })

  })

  describe('formatting', function() {

    it('produces event time text', function() {
      initCalendar({
        defaultView: 'month',
        now: '2018-09-06',
        displayEventEnd: false,
        cmdFormatter: 'moment',
        eventTimeFormat: 'HH:mm:ss[!]',
        events: [
          { title: 'my event', start: '2018-09-06T13:30:20' }
        ]
      })
      expect(getEventElTimeText(getSingleEl())).toBe('13:30:20!')
    })

    xit('produces title with titleRangeSeparator', function() {
      initCalendar({ // need to render the calendar to get view.title :(
        defaultView: 'basicWeek',
        now: '2018-09-06',
        cmdFormatter: 'moment',
        titleFormat: 'MMMM {D} YY [yup]',
        titleRangeSeparator: ' to '
      })
      expect(currentCalendar.view.title).toBe('September 2 to 8 18 yup')
    })

  })

})
