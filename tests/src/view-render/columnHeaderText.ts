import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('dayHeaderContent as text', () => { // TODO: rename file
  pushOptions({
    initialDate: '2014-05-11',
  })

  describeOptions('initialView', {
    'when month view': 'dayGridMonth',
    'when timeGrid view': 'timeGridDay',
    'when dayGrid view': 'dayGridDay',
  }, (viewName) => {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    it('should contain custom HTML escaped text', () => {
      let calendar = initCalendar({
        dayHeaderContent(arg) {
          return '<div>Custom ' + currentCalendar.formatDate(arg.date, { weekday: 'long' }) + '</div>'
        },
      })
      let headerWrapper = new ViewWrapper(calendar).header
      let $firstCell = $(headerWrapper.getCellEls()[0])
      expect($firstCell.text()).toBe('<div>Custom Sunday</div>')
    })
  })

  describeTimeZones((tz) => {
    it('receives correct date', () => {
      let dates = []

      initCalendar({
        initialView: 'timeGridDay',
        dayHeaderContent(arg) {
          dates.push(arg.date)
        },
      })

      expect(dates.length).toBe(1)
      expect(dates[0]).toEqualDate(tz.parseDate('2014-05-11'))
    })
  })
})
