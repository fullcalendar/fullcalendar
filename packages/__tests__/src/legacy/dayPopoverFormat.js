import frLocale from '@fullcalendar/core/locales/fr'
import { getMoreEl, getMorePopoverTitle } from '../view-render/DayGridRenderUtils'

describe('dayPopoverFormat', function() {

  pushOptions({
    defaultDate: '2014-08-01',
    eventLimit: 3,
    events: [
      { title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
      { title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
      { title: 'event3', start: '2014-07-29', className: 'event3' },
      { title: 'event4', start: '2014-07-29', className: 'event4' }
    ]
  })

  it('can be set to a custom value', function() {
    initCalendar({
      dayPopoverFormat: { month: 'long', day: 'numeric' }
    })
    getMoreEl().simulate('click')
    expect(getMorePopoverTitle()).toBe('July 29')
  })

  it('is affected by the current locale when the value is default', function() {
    initCalendar({
      locale: frLocale
    })
    getMoreEl().simulate('click')
    expect(getMorePopoverTitle()).toBe('29 juillet 2014')
  })

  it('still maintains the same format when explicitly set, and there is a locale', function() {
    initCalendar({
      locale: frLocale,
      dayPopoverFormat: { year: 'numeric' }
    })
    getMoreEl().simulate('click')
    expect(getMorePopoverTitle()).toBe('2014')
  })

})
