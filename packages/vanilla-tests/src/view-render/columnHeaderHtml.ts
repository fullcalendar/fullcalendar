import { strictModeFactor } from 'fullcalendar/protected-api'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('dayHeaderContent as html', () => { // TODO: rename file
  pushOptions({
    initialDate: '2014-05-11',
  })

  describeOptions('initialView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay',
  }, (viewName) => {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    it('should contain custom HTML', () => {
      let calendar = initCalendar({
        dayHeaderContent(info) {
          return { html: '<div class="test">' + info.view.calendar.formatDate(info.date, { weekday: 'long' }) + '</div>' }
        },
      })
      let headerWrapper = new ViewWrapper(calendar).header

      let $firstCellEl = $(headerWrapper.getCellEls()[0])
      expect($firstCellEl.find('.test').length).toBe(1)
      expect($firstCellEl.text()).toBe('Sunday')
    })
  })

  describeTimeZones((tz) => {
    it('receives correct date', () => {
      let dates = []

      initCalendar({
        initialView: 'timeGridDay',
        dayHeaderContent(info) {
          dates.push(info.date)
        },
      })

      expect(dates.length).toBe(1 * strictModeFactor)
      expect(dates[0 * strictModeFactor]).toEqualDate(tz.parseDate('2014-05-11'))
    })
  })
})
