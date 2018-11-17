
describe('internal View/Grid classes', function() {

  it('are exposed', function() {

    expect(typeof FullCalendar.AgendaView).toBe('function')
    expect(typeof FullCalendar.BasicView).toBe('function')
    expect(typeof FullCalendar.ListView).toBe('function')

    expect(typeof FullCalendar.DayGrid).toBe('function')
    expect(typeof FullCalendar.TimeGrid).toBe('function')
  })

})
