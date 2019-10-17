import { getFirstDayEl } from './DayGridRenderUtils'

describe('columnHeaderHtml', function() {
  pushOptions({
    defaultDate: '2014-05-11'
  })

  describeOptions('defaultView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay'
  }, function() {

    it('should contain custom HTML', function() {
      initCalendar({
        columnHeaderHtml: function(date) {
          return '<div class="test">' + currentCalendar.formatDate(date, { weekday: 'long' }) + '</div>'
        }
      })

      var firstHeader = getFirstDayEl()
      expect(firstHeader.find('.test').length).toBe(1)
      expect(firstHeader.text()).toBe('Sunday')
    })
  })

  describeTimeZones(function(tz) {

    it('receives correct date', function() {
      let dates = []

      initCalendar({
        defaultView: 'timeGridDay',
        columnHeaderHtml: function(date) {
          dates.push(date)
        }
      })

      expect(dates.length).toBe(1)
      expect(dates[0]).toEqualDate(tz.parseDate('2014-05-11'))
    })
  })

})
