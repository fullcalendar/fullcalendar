import enGbLocale from '@fullcalendar/core/locales/en-gb'

describe('slotLabelFormat', function() {

  pushOptions({
    defaultDate: '2014-06-04',
    defaultView: 'timeGridWeek'
  })

  function getAxisText() {
    return $('.fc-slats tr:first-child .fc-time').text()
  }

  it('renders correctly when default', function() {
    initCalendar()
    expect(getAxisText()).toBe('12am')
  })

  it('renders correctly when default and the locale is customized', function() {
    initCalendar({
      locale: enGbLocale
    })
    expect(getAxisText()).toBe('00')
  })

  it('renders correctly when customized', function() {
    initCalendar({
      slotLabelFormat: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
    })
    expect(getAxisText()).toBe('00:00:00')
  })

})
