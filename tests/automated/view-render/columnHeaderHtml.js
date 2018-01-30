
describe('columnHeaderHtml', function() {
  pushOptions({
    defaultDate: '2014-05-11',
    columnHeaderHtml: function(date) {
      return '<div class="test">' + date.format('dddd') + '</div>'
    }
  })

  describeOptions('defaultView', {
    'when month view': 'month',
    'when agenda view': 'agendaDay',
    'when basic view': 'basicDay'
  }, function() {

    it('should contain custom HTML', function() {
      initCalendar()
      expect(hasCustomHtml()).toBe(true)
    })
  })

  function hasCustomHtml() {
    var firstHeader = $('.fc-day-header:first')

    return firstHeader.find('.test').length === 1 && firstHeader.text() === 'Sunday'
  }

})
