import { getFirstDayEl } from './DayGridRenderUtils'

describe('columnHeaderText', function() {
  pushOptions({
    defaultDate: '2014-05-11',
    columnHeaderText: function(date) {
      return '<div>Custom ' + currentCalendar.formatDate(date, { weekday: 'long' }) + '</div>'
    }
  })

  describeOptions('defaultView', {
    'when month view': 'month',
    'when timeGrid view': 'day',
    'when dayGrid view': 'dayGridDay'
  }, function() {

    it('should contain custom HTML escaped text', function() {
      initCalendar()
      expect(hasCustomText()).toBe(true)
    })
  })

  function hasCustomText() {
    var firstHeader = getFirstDayEl()

    return firstHeader.text() === '<div>Custom Sunday</div>'
  }

})
