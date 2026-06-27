describe('Event::source', () => {
  it('returns the correct source', () => {
    let calendar = initCalendar({
      eventSources: [{
        id: 'sourceA',
        events: [
          { id: 'eventA', start: '2018-09-07' },
        ],
      }],
    })
    let event = calendar.getEventById('eventA')
    let source = event.source
    expect(source.id).toBe('sourceA')
  })

  it('returns null for events with no source', () => {
    let calendar = initCalendar()
    calendar.addEvent({ id: 'eventA', start: '2018-09-07' })
    let event = calendar.getEventById('eventA')
    let source = event.source
    expect(source).toBe(null)
  })
})
