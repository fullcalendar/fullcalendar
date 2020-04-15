import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('dayHeaderContent as html', function() { // TODO: rename file
  pushOptions({
    initialDate: '2014-05-11'
  })

  describeOptions('initialView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay'
  }, function(viewName) {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    it('should contain custom HTML', function() {
      let calendar = initCalendar({
        dayHeaderContent: function(arg) {
          return { html: '<div class="test">' + currentCalendar.formatDate(arg.date, { weekday: 'long' }) + '</div>' }
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
        initialView: 'timeGridDay',
        dayHeaderContent: function(arg) {
          dates.push(arg.date)
        }
      })

      expect(dates.length).toBe(1)
      expect(dates[0]).toEqualDate(tz.parseDate('2014-05-11'))
    })
  })

})
