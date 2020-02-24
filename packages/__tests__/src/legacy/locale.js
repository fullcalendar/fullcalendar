import esLocale from '@fullcalendar/core/locales/es'
import frLocale from '@fullcalendar/core/locales/fr'
import arLocale from '@fullcalendar/core/locales/ar'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('locale', function() {
  pushOptions({
    locales: [ esLocale, frLocale, arLocale ]
  })

  it('works when certain locale has no FC settings defined', function() {
    let calendar = initCalendar({
      locale: 'en-asdf',
      defaultView: 'timeGridWeek',
      defaultDate: '2014-12-25',
      events: [
        { title: 'Christmas', start: '2014-12-25T10:00:00' }
      ]
    })
    let headerWrapper = new TimeGridViewWrapper(calendar).header

    expect(headerWrapper.getCellText(0)).toMatch(/^Sun\.? 12[-/ ]21$/)

    let calendarWrapper = new CalendarWrapper(calendar)
    let eventEl = calendarWrapper.getFirstEventEl()
    let eventInfo = calendarWrapper.getEventElInfo(eventEl)

    expect(eventInfo.timeText).toBe('10:00')
  })

  it('allows dynamic setting', function() {
    let calendar = initCalendar({
      locale: 'es',
      defaultDate: '2016-07-10',
      defaultView: 'dayGridMonth'
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar

    expect(toolbarWrapper.getTitleText()).toBe('julio de 2016')
    expect(calendar.getOption('dir')).toBe('ltr')

    currentCalendar.setOption('locale', 'fr')
    expect(toolbarWrapper.getTitleText()).toBe('juillet 2016')

    currentCalendar.setOption('locale', 'ar') // NOTE: we had problems testing for RTL title text
    expect(calendar.getOption('dir')).toBe('rtl')
  })

})
