
describe('Event Object parsing', function() {

  it('leaves an existing _id prop untouched', function() {
    initCalendar({
      currentDate: '2017-09-05',
      defaultView: 'month',
      events: [
        { _id: 'a', start: '2017-09-05' }
      ]
    })

    var events = currentCalendar.clientEvents()
    expect(events[0]._id).toBe('a')
  })

  it('leaves an existing date prop unparsed and untouched', function() {
    initCalendar({
      currentDate: '2017-09-05',
      defaultView: 'month',
      events: [
        { date: '2017-09-05' }
      ]
    })

    var events = currentCalendar.clientEvents()
    expect(events[0].date).toBe('2017-09-05')
  })

})
