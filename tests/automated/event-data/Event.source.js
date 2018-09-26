describe('Event::source', function() {

  it('returns the correct source', function() {
    initCalendar({
      eventSources: [ {
        id: 'sourceA',
        events: [
          { id: 'eventA', start: '2018-09-07' }
        ]
      } ]
    })
    let event = currentCalendar.getEventById('eventA')
    let source = event.source
    expect(source.id).toBe('sourceA')
  })

  it('returns null for events with no source', function() {
    initCalendar()
    currentCalendar.addEvent({ id: 'eventA', start: '2018-09-07' })
    let event = currentCalendar.getEventById('eventA')
    let source = event.source
    expect(source).toBe(null)
  })

})
