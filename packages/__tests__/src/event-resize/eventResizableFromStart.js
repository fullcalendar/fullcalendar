import { resize } from './DayGridEventResizeUtils'

describe('eventResizableFromStart', function() {
  pushOptions({
    editable: true,
    eventResizableFromStart: true
  })

  describe('for DayGrid', function() {
    pushOptions({
      defaultDate: '2019-08-26',
      defaultView: 'dayGridMonth',
      events: [
        { start: '2019-08-27', title: 'all day event' }
      ]
    })

    it('allows resizing from start', function(done) {
      initCalendar()

      resize('2019-08-27', '2019-08-26', true).then(function() {
        let event = currentCalendar.getEvents()[0]

        expect(event.start).toEqualDate('2019-08-26')
        expect(event.end).toEqualDate('2019-08-28')

        done()
      })
    })
  })
})
