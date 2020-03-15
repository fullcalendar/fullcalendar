import DayGridViewWrapper from "../lib/wrappers/DayGridViewWrapper"
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'


describe('dayLabelContent as text', function() { // TODO: rename file
  pushOptions({
    defaultDate: '2014-05-11'
  })

  describeOptions('defaultView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay'
  }, function(viewName) {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    it('should contain custom HTML escaped text', function() {
      let calendar = initCalendar({
        dayLabelContent: function(arg) {
          return '<div>Custom ' + currentCalendar.formatDate(arg.date, { weekday: 'long' }) + '</div>'
        }
      })
      let headerWrapper = new ViewWrapper(calendar).header
      let $firstCell = $(headerWrapper.getCellEls()[0])
      expect($firstCell.text()).toBe('<div>Custom Sunday</div>')
    })
  })

  describeTimeZones(function(tz) {

    it('receives correct date', function() {
      let dates = []

      initCalendar({
        defaultView: 'timeGridDay',
        dayLabelContent: function(arg) {
          dates.push(arg.date)
        }
      })

      expect(dates.length).toBe(1)
      expect(dates[0]).toEqualDate(tz.parseDate('2014-05-11'))
    })
  })

})
