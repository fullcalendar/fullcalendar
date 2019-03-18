import { getFirstDayEl } from './DayGridRenderUtils'

describe('columnHeaderText', function() {
  pushOptions({
    defaultDate: '2014-05-11'
  })

  describeOptions('defaultView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay'
  }, function() {

    it('should contain custom HTML escaped text', function() {
      initCalendar({
        columnHeaderText: function(date) {
          return '<div>Custom ' + currentCalendar.formatDate(date, { weekday: 'long' }) + '</div>'
        }
      })
      expect(getFirstDayEl().text()).toBe('<div>Custom Sunday</div>')
    })
  })

  describeTimeZones(function(tz) {

    it('receives correct date', function() {
      let dates = []

      initCalendar({
        defaultView: 'timeGridDay',
        columnHeaderText: function(date) {
          dates.push(date)
        }
      })

      expect(dates.length).toBe(1)
      expect(dates[0]).toEqualDate(tz.parseDate('2014-05-11'))
    })
  })

})
