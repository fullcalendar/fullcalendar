
describe('addEvent', function() {

  it('will re-add an event that was previously removed', function() {
    initCalendar({
      events: [
        { id: 'a', start: '2018-09-07' }
      ]
    })
    let event = currentCalendar.getEventById('a')
    expect(currentCalendar.getEvents().length).toBe(1)
    event.remove()
    expect(currentCalendar.getEvents().length).toBe(0)
    let newEvent = currentCalendar.addEvent(event)
    expect(currentCalendar.getEvents().length).toBe(1)
    expect(newEvent).toBe(event)
  })

  it('won\'t double-add an event that was previously added', function() {
    initCalendar({
      events: [
        { id: 'a', start: '2018-09-07' }
      ]
    })
    let event = currentCalendar.getEventById('a')
    expect(currentCalendar.getEvents().length).toBe(1)
    let newEvent = currentCalendar.addEvent(event)
    expect(currentCalendar.getEvents().length).toBe(1)
    expect(newEvent).toBe(event)
  })

})
