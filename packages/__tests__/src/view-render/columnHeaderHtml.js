import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('columnHeaderHtml', function() {
  pushOptions({
    defaultDate: '2014-05-11'
  })

  describeOptions('defaultView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay'
  }, function(viewName) {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    it('should contain custom HTML', function() {
      let calendar = initCalendar({
        columnHeaderHtml: function(date) {
          return '<div class="test">' + currentCalendar.formatDate(date, { weekday: 'long' }) + '</div>'
        }
      })
      let headerWrapper = new ViewWrapper(calendar).header

      var $firstCellEl = $(headerWrapper.getCellEls()[0])
      expect($firstCellEl.find('.test').length).toBe(1)
      expect($firstCellEl.text()).toBe('Sunday')
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
