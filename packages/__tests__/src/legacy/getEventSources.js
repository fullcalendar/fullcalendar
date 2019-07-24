describe('getEventSources', function() {

  pushOptions({
    now: '2015-08-07',
    defaultView: 'timeGridWeek',
    eventSources: [
      {
        events: [
          { id: 1, start: '2015-08-07T02:00:00', end: '2015-08-07T03:00:00', title: 'event A' }
        ]
      },
      {
        events: [
          { id: 2, start: '2015-08-07T03:00:00', end: '2015-08-07T04:00:00', title: 'event B' }
        ]
      },
      {
        events: [
          { id: 3, start: '2015-08-07T04:00:00', end: '2015-08-07T05:00:00', title: 'event C' }
        ]
      }
    ]
  })

  it('does not mutate when removeEventSource is called', function(done) {
    initCalendar()
    var eventSources = currentCalendar.getEventSources()
    expect(eventSources.length).toBe(3)

    // prove that eventSources is a copy, and wasn't mutated
    eventSources[0].remove()
    expect(eventSources.length).toBe(3)

    done()
  })

})

