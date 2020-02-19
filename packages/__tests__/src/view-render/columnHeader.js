import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('columnHeader', function() {
  pushOptions({
    defaultDate: '2014-05-11'
  })

  describeOptions('defaultView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay'
  }, function(viewName) {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    describe('when on', function() {
      pushOptions({
        columnHeader: true
      })

      it('should show header', function() {
        let calendar = initCalendar()
        let viewWrapper = new ViewWrapper(calendar)
        expect(viewWrapper.header).toBeTruthy()
      })
    })

    describe('when off', function() {
      pushOptions({
        columnHeader: false
      })

      it('should not show header', function() {
        let calendar = initCalendar()
        let viewWrapper = new ViewWrapper(calendar)
        expect(viewWrapper.header).toBeFalsy()
      })
    })
  })
})
