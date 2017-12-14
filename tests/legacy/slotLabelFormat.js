describe('slotLabelFormat', function() {

  pushOptions({
    defaultDate: '2014-06-04',
    defaultView: 'agendaWeek'
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
      locale: 'en-gb'
    })
    expect(getAxisText()).toBe('00')
  })

  it('renders correctly when customized', function() {
    initCalendar({
      slotLabelFormat: 'H:mm:mm[!]'
    })
    expect(getAxisText()).toBe('0:00:00!')
  })

})
