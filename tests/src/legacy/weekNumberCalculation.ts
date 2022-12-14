import arLocale from '@fullcalendar/core/locales/ar'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('weekNumberCalculation', () => {
  pushOptions({
    weekNumbers: true,
  })

  describeOptions('initialView', {
    'when in day-grid': 'dayGridDay',
    'when in time-grid': 'timeGridDay',
  }, (viewName) => {
    let getWeekNumberText = viewName.match(/^dayGrid/)
      ? (calendar) => new DayGridViewWrapper(calendar).dayGrid.getWeekNumberText(0)
      : (calendar) => new TimeGridViewWrapper(calendar).getHeaderWeekText()

    it('should display the American standard when using \'local\'', () => {
      let calendar = initCalendar({
        initialDate: '2013-11-23', // a Saturday
        weekNumberCalculation: 'local',
      })
      expect(getWeekNumber(calendar)).toBe(47)
    })

    it('should display a locale-specific local week number', () => {
      let calendar = initCalendar({
        initialDate: '2013-11-23', // a Saturday
        locale: arLocale,
        weekNumberCalculation: 'local',
      })
      expect(getWeekNumberText(calendar)).toMatch(/٤٨|48/)
    })

    // another local test, but to make sure it is different from ISO
    it('should display the American standard when using \'local\'', () => {
      let calendar = initCalendar({
        initialDate: '2013-11-17', // a Sunday
        weekNumberCalculation: 'local',
      })
      expect(getWeekNumber(calendar)).toBe(47)
    })

    it('should display ISO standard when using \'ISO\'', () => {
      let calendar = initCalendar({
        initialDate: '2013-11-17', // a Sunday
        weekNumberCalculation: 'ISO',
      })
      expect(getWeekNumber(calendar)).toBe(46)
    })

    it('should display the calculated number when a custom function', () => {
      let calendar = initCalendar({
        weekNumberCalculation() {
          return 4
        },
      })
      expect(getWeekNumber(calendar)).toBe(4)
    })

    function getWeekNumber(calendar) {
      let text = getWeekNumberText(calendar) || ''
      return parseInt(text.replace(/\D/g, ''), 10)
    }
  })
})
