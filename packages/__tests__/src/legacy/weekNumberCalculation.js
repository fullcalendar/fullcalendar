import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'
import arLocale from '@fullcalendar/core/locales/ar'

describe('weekNumberCalculation', function() {
  pushOptions({
    weekNumbers: true
  })

  describeOptions('defaultView', {
    'when in day-grid': 'dayGridDay',
    'when in time-grid': 'timeGridDay'
  }, function(viewName) {

    let getWeekNumberText = viewName.match(/^dayGrid/)
      ? (calendar) => new DayGridViewWrapper(calendar).dayGrid.getWeekNumberText(0)
      : (calendar) => new TimeGridViewWrapper(calendar).getHeaderWeekText()

    it('should display the American standard when using \'local\'', function() {
      let calendar = initCalendar({
        defaultDate: '2013-11-23', // a Saturday
        weekNumberCalculation: 'local'
      })
      expect(getWeekNumber(calendar)).toBe(47)
    })

    it('should display a locale-specific local week number', function() {
      let calendar = initCalendar({
        defaultDate: '2013-11-23', // a Saturday
        locale: arLocale,
        weekNumberCalculation: 'local'
      })
      expect(getWeekNumberText(calendar)).toMatch(/٤٨|48/)
    })

    // another local test, but to make sure it is different from ISO
    it('should display the American standard when using \'local\'', function() {
      let calendar = initCalendar({
        defaultDate: '2013-11-17', // a Sunday
        weekNumberCalculation: 'local'
      })
      expect(getWeekNumber(calendar)).toBe(47)
    })

    it('should display ISO standard when using \'ISO\'', function() {
      let calendar = initCalendar({
        defaultDate: '2013-11-17', // a Sunday
        weekNumberCalculation: 'ISO'
      })
      expect(getWeekNumber(calendar)).toBe(46)
    })

    it('should display the calculated number when a custom function', function() {
      let calendar = initCalendar({
        weekNumberCalculation: function() {
          return 4
        }
      })
      expect(getWeekNumber(calendar)).toBe(4)
    })


    function getWeekNumber(calendar) {
      var text = getWeekNumberText(calendar) || ''
      return parseInt(text.replace(/\D/g, ''), 10)
    }

  })
})
