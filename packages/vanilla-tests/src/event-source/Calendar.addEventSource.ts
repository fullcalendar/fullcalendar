describe('addEventSource', () => {
  it('will accept a processed api object after it was removed', () => {
    let calendar = initCalendar({
      eventSources: [
        { id: 'sourceA', events: [] },
      ],
    })
    expect(calendar.getEventSources().length).toBe(1)
    let source = calendar.getEventSourceById('sourceA')
    source.remove()
    expect(calendar.getEventSources().length).toBe(0)
    let newSource = calendar.addEventSource(source)
    expect(calendar.getEventSources().length).toBe(1)
    expect(newSource).toBe(source)
  })

  it('won\'t re-add a source that it already has', () => {
    let calendar = initCalendar({
      eventSources: [
        { id: 'sourceA', events: [] },
      ],
    })
    expect(calendar.getEventSources().length).toBe(1)
    let source = calendar.getEventSourceById('sourceA')
    let newSource = calendar.addEventSource(source)
    expect(calendar.getEventSources().length).toBe(1)
    expect(newSource).toBe(source)
  })
})
