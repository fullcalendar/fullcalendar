import frLocale from '@fullcalendar/core/locales/fr'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('dayPopoverFormat', () => {
  pushOptions({
    initialDate: '2014-08-01',
    dayMaxEventRows: 3,
    events: [
      { title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
      { title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
      { title: 'event3', start: '2014-07-29', className: 'event3' },
      { title: 'event4', start: '2014-07-29', className: 'event4' },
    ],
  })

  it('can be set to a custom value', (done) => {
    let calendar = initCalendar({
      dayPopoverFormat: { month: 'long', day: 'numeric' },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    $(dayGridWrapper.getMoreEl()).simulate('click')
    setTimeout(() => {
      expect(dayGridWrapper.getMorePopoverTitle()).toBe('July 29')
      done()
    })
  })

  it('is affected by the current locale when the value is default', (done) => {
    let calendar = initCalendar({
      locale: frLocale,
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    $(dayGridWrapper.getMoreEl()).simulate('click')
    setTimeout(() => {
      expect(dayGridWrapper.getMorePopoverTitle()).toBe('29 juillet 2014')
      done()
    })
  })

  it('still maintains the same format when explicitly set, and there is a locale', (done) => {
    let calendar = initCalendar({
      locale: frLocale,
      dayPopoverFormat: { year: 'numeric' },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    $(dayGridWrapper.getMoreEl()).simulate('click')
    setTimeout(() => {
      expect(dayGridWrapper.getMorePopoverTitle()).toBe('2014')
      done()
    })
  })
})
