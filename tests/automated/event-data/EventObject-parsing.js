
describe('Event Object parsing', function() {

  it('records _id as an extended prop', function() {
    initCalendar({
      currentDate: '2017-09-05',
      defaultView: 'month',
      events: [
        { _id: 'a', start: '2017-09-05' }
      ]
    })

    var events = currentCalendar.getEvents()
    expect(events[0].extendedProps._id).toBe('a')
  })

})
