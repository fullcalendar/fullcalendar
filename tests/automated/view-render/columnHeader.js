import { hasHeaderEl } from './DayGridRenderUtils'

describe('columnHeader', function() {
  pushOptions({
    defaultDate: '2014-05-11'
  })

  describeOptions('defaultView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay'
  }, function() {

    describe('when on', function() {
      pushOptions({
        columnHeader: true
      })

      it('should show header', function() {
        initCalendar()
        expect(hasHeaderEl()).toBe(true)
      })
    })

    describe('when off', function() {
      pushOptions({
        columnHeader: false
      })

      it('should not show header', function() {
        initCalendar()
        expect(hasHeaderEl()).toBe(false)
      })
    })
  })
})
