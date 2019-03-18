
describe('Event Object parsing', function() {

  it('records _id as an extended prop', function() {
    initCalendar({
      currentDate: '2017-09-05',
      defaultView: 'dayGridMonth',
      events: [
        { _id: 'a', start: '2017-09-05' }
      ]
    })

    var events = currentCalendar.getEvents()
    expect(events[0].extendedProps._id).toBe('a')
  })

  it('parses an all-day event with timed same-day start/end', function() {
    initCalendar({
      defaultView: 'dayGridMonth',
      defaultDate: '2017-11-01',
      timeZone: 'local',
      events: [
        {
          title: 'All Day with time',
          allDay: true,
          start: new Date(2017, 10, 1, 10, 0, 0),
          end: new Date(2017, 10, 1, 18, 0, 0) // same-day. will result in null
        }
      ]
    })

    let events = currentCalendar.getEvents()
    expect(events.length).toBe(1)
    expect(events[0].start).toEqualLocalDate('2017-11-01T00:00:00')
    expect(events[0].end).toBe(null)
  })

  xit('won\'t accept two events with the same ID', function() {
    initCalendar({
      defaultView: 'dayGridDay',
      defaultDate: '2018-01-01',
      events: [
        { id: '1', start: '2018-01-01', title: 'cool' },
        { id: '1', start: '2018-01-01' }
      ]
    })

    let events = currentCalendar.getEvents()
    expect(events.length).toBe(1)
    expect(events[0].title).toBe('cool')
  })

})
