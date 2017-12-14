describe('scrollTime', function() {

  pushOptions({
    defaultView: 'agendaWeek'
  })

  it('accepts a string Duration', function() {
    initCalendar({
      scrollTime: '02:00:00',
      height: 400 // short enough to make scrolling happen
    })
    var slotCell = $('.fc-slats tr:eq(4)') // 2am slot
    var slotTop = slotCell.position().top
    var scrollContainer = $('.fc-time-grid-container')
    var scrollTop = scrollContainer.scrollTop()
    var diff = Math.abs(slotTop - scrollTop)
    expect(slotTop).toBeGreaterThan(0)
    expect(scrollTop).toBeGreaterThan(0)
    expect(diff).toBeLessThan(3)
  })

  it('accepts a Duration object', function() {
    initCalendar({
      scrollTime: { hours: 2 },
      height: 400 // short enough to make scrolling happen
    })
    var slotCell = $('.fc-slats tr:eq(4)') // 2am slot
    var slotTop = slotCell.position().top
    var scrollContainer = $('.fc-time-grid-container')
    var scrollTop = scrollContainer.scrollTop()
    var diff = Math.abs(slotTop - scrollTop)
    expect(slotTop).toBeGreaterThan(0)
    expect(scrollTop).toBeGreaterThan(0)
    expect(diff).toBeLessThan(3)
  })

})
