
describe('addEventSource', function() {

  it('will accept a processed api object after it was removed', function() {
    initCalendar({
      eventSources: [
        { id: 'sourceA', events: [] }
      ]
    })
    expect(currentCalendar.getEventSources().length).toBe(1)
    let source = currentCalendar.getEventSourceById('sourceA')
    source.remove()
    expect(currentCalendar.getEventSources().length).toBe(0)
    let newSource = currentCalendar.addEventSource(source)
    expect(currentCalendar.getEventSources().length).toBe(1)
    expect(newSource).toBe(source)
  })

  it('won\'t re-add a source that it already has', function() {
    initCalendar({
      eventSources: [
        { id: 'sourceA', events: [] }
      ]
    })
    expect(currentCalendar.getEventSources().length).toBe(1)
    let source = currentCalendar.getEventSourceById('sourceA')
    let newSource = currentCalendar.addEventSource(source)
    expect(currentCalendar.getEventSources().length).toBe(1)
    expect(newSource).toBe(source)
  })

})
