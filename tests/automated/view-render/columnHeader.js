
describe('columnHeader', function() {
  pushOptions({
    defaultDate: '2014-05-11'
  })

  describeOptions('defaultView', {
    'when month view': 'month',
    'when agenda view': 'agendaDay',
    'when basic view': 'basicDay'
  }, function() {

    describe('when off', function() {
      pushOptions({
        columnHeader: true
      })

      it('should show header', function() {
        initCalendar()
        expect(hasHeader()).toBe(true)
      })
    })

    describe('when on', function() {
      pushOptions({
        columnHeader: false
      })

      it('should not show header', function() {
        initCalendar()
        expect(hasHeader()).toBe(false)
      })
    })
  })

  function hasHeader() {
    return $('.fc-view > table > .fc-head').length === 1
  }

})
