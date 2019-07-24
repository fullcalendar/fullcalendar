describe('scrollToTime method', function() {

  it('accepts a object duration input', function() {
    initCalendar({
      scrollTime: 0,
      defaultView: 'timeGridWeek'
    })

    currentCalendar.scrollToTime({ hours: 2 })

    // NOTE: c&p'd from scrollTime tests
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
