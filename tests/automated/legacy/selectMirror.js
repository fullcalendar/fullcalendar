describe('selectMirror', function() {

  pushOptions({
    defaultDate: '2014-08-03',
    defaultView: 'timeGridWeek',
    scrollTime: '00:00:00',
    selectMirror: true
  })

  it('goes through eventRender and eventPositioned', function() {
    initCalendar({
      eventRender(arg) {
        expect(arg.isMirror).toBe(true)
        $(arg.el).addClass('eventDidRender')
      },
      eventPositioned(arg) {
        expect(arg.isMirror).toBe(true)
        $(arg.el).addClass('eventDidPosition')
      }
    })

    currentCalendar.select('2014-08-04T01:00:00Z', '2014-08-04T04:00:00Z')

    expect($('.fc-mirror')).toHaveClass('eventDidRender')
    expect($('.fc-mirror')).toHaveClass('eventDidPosition')
  })
})
