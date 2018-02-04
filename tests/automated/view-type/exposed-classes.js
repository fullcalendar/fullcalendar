
describe('internal View/Grid classes', function() {

  it('are exposed', function() {
    var FC = $.fullCalendar

    expect(typeof FC.AgendaView).toBe('function')
    expect(typeof FC.BasicView).toBe('function')
    expect(typeof FC.MonthView).toBe('function')
    expect(typeof FC.ListView).toBe('function')

    expect(typeof FC.DayGrid).toBe('function')
    expect(typeof FC.TimeGrid).toBe('function')
  })

})
