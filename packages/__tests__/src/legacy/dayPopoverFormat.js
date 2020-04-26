import frLocale from '@fullcalendar/core/locales/fr'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { flushToDom } from '@fullcalendar/preact'


describe('dayPopoverFormat', function() {

  pushOptions({
    initialDate: '2014-08-01',
    dayMaxEventRows: 3,
    events: [
      { title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
      { title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
      { title: 'event3', start: '2014-07-29', className: 'event3' },
      { title: 'event4', start: '2014-07-29', className: 'event4' }
    ]
  })

  it('can be set to a custom value', function() {
      let calendar = initCalendar({
        dayPopoverFormat: { month: 'long', day: 'numeric' }
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      $(dayGridWrapper.getMoreEl()).simulate('click')
      flushToDom() // needed when all tests run together :(

      expect(dayGridWrapper.getMorePopoverTitle()).toBe('July 29')
  })

  it('is affected by the current locale when the value is default', function() {
      let calendar = initCalendar({
        locale: frLocale
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      $(dayGridWrapper.getMoreEl()).simulate('click')
      flushToDom() // needed when all tests run together :(

      expect(dayGridWrapper.getMorePopoverTitle()).toBe('29 juillet 2014')
  })

  it('still maintains the same format when explicitly set, and there is a locale', function() {
      let calendar = initCalendar({
        locale: frLocale,
        dayPopoverFormat: { year: 'numeric' }
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      $(dayGridWrapper.getMoreEl()).simulate('click')
      flushToDom() // needed when all tests run together :(

      expect(dayGridWrapper.getMorePopoverTitle()).toBe('2014')
  })

})
