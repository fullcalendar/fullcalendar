
describe('when weekends option is set', function() {

  it('should show sat and sun if true', function() {
    initCalendar({
      weekends: true
    })
    var sun = $('.fc-day-header.fc-sun')[0]
    var sat = $('.fc-day-header.fc-sun')[0]
    expect(sun).toBeDefined()
    expect(sat).toBeDefined()
  })

  it('should not show sat and sun if false', function() {
    initCalendar({
      weekends: false
    })
    var sun = $('.fc-day-header.fc-sun')[0]
    var sat = $('.fc-day-header.fc-sun')[0]
    expect(sun).not.toBeDefined()
    expect(sat).not.toBeDefined()
  })

})
