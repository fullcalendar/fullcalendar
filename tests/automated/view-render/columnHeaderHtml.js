import { getFirstDayEl } from './DayGridRenderUtils'

describe('columnHeaderHtml', function() {
  pushOptions({
    defaultDate: '2014-05-11',
    columnHeaderHtml: function(date) {
      return '<div class="test">' + currentCalendar.formatDate(date, { weekday: 'long' }) + '</div>'
    }
  })

  describeOptions('defaultView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay'
  }, function() {

    it('should contain custom HTML', function() {
      initCalendar()
      expect(hasCustomHtml()).toBe(true)
    })
  })

  function hasCustomHtml() {
    var firstHeader = getFirstDayEl()

    return firstHeader.find('.test').length === 1 && firstHeader.text() === 'Sunday'
  }

})
