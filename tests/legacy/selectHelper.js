describe('selectHelper', function() {

  pushOptions({
    defaultDate: '2014-08-03',
    defaultView: 'agendaWeek',
    scrollTime: '00:00:00',
    selectHelper: true
  })

  it('goes through eventRender', function() {
    initCalendar({
      eventRender: function(event, element, view) {
        element.addClass('didEventRender')
      }
    })
    currentCalendar.select('2014-08-04T01:00:00', '2014-08-04T04:00:00')
    expect($('.fc-helper')).toHaveClass('didEventRender')
  })
})
