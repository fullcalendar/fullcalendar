import esLocale from '@fullcalendar/core/locales/es'
import frLocale from '@fullcalendar/core/locales/fr'
import arLocale from '@fullcalendar/core/locales/ar'

describe('locale', function() {
  pushOptions({
    locales: [ esLocale, frLocale, arLocale ]
  })

  it('works when certain locale has no FC settings defined', function() {
    initCalendar({
      locale: 'en-asdf',
      defaultView: 'timeGridWeek',
      defaultDate: '2014-12-25',
      events: [
        { title: 'Christmas', start: '2014-12-25T10:00:00' }
      ]
    })
    expect(
      $('.fc-day-header:first').text()
    ).toMatch(/^Sun\.? 12[-/ ]21$/)
    expect($('.fc-event .fc-time')).toHaveText('10:00')
  })

  it('allows dynamic setting', function() {
    initCalendar({
      locale: 'es',
      defaultDate: '2016-07-10',
      defaultView: 'dayGridMonth'
    })

    var calendarEl = currentCalendar.el

    expect($('h2', calendarEl)).toHaveText('julio de 2016')
    expect($(calendarEl)).not.toHaveClass('fc-rtl')

    currentCalendar.setOption('locale', 'fr')
    expect($('h2', calendarEl)).toHaveText('juillet 2016')

    currentCalendar.setOption('locale', 'ar') // NOTE: we had problems testing for RTL title text
    expect($(calendarEl)).toHaveClass('fc-rtl')
  })

})
