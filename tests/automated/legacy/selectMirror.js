describe('selectMirror', function() {

  pushOptions({
    defaultDate: '2014-08-03',
    defaultView: 'agendaWeek',
    scrollTime: '00:00:00',
    selectMirror: true
  })

  it('goes through eventRender', function() {
    initCalendar({
      eventRender: function(arg) {
        $(arg.el).addClass('didEventRender')
      }
    })
    currentCalendar.select('2014-08-04T01:00:00Z', '2014-08-04T04:00:00Z')
    expect($('.fc-mirror')).toHaveClass('didEventRender')
  })
})
