
describe('columnHeaderText', function() {
  pushOptions({
    defaultDate: '2014-05-11',
    columnHeaderText: function(date) {
      return '<div>Custom ' + date.format('dddd') + '</div>'
    }
  })

  describeOptions('defaultView', {
    'when month view': 'month',
    'when agenda view': 'agendaDay',
    'when basic view': 'basicDay'
  }, function() {

    it('should contain custom HTML escaped text', function() {
      initCalendar()
      expect(hasCustomText()).toBe(true)
    })
  })

  function hasCustomText() {
    var firstHeader = $('.fc-day-header:first')

    return firstHeader.text() === '<div>Custom Sunday</div>'
  }

})
