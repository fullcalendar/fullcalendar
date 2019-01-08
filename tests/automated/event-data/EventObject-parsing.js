
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

  it('parses an all-day event with timed same-day start/end', function() {
    initCalendar({
      defaultView: 'month',
      defaultDate: '2017-11-01',
      timezone: 'local',
      events: [
        {
          title: 'All Day with time',
          allDay: true,
          start: new Date(2017, 10, 1, 10, 0, 0),
          end: new Date(2017, 10, 1, 18, 0, 0) // same-day. will result in null
        }
      ]
    })

    let events = currentCalendar.clientEvents()
    expect(events.length).toBe(1)
    expect(events[0].start).toEqualMoment('2017-11-01')
    expect(events[0].end).toBe(null)
  })

})
