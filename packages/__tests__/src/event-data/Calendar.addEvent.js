
describe('addEvent', function() {
  pushOptions({
    defaultDate: '2018-09-07'
  })

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

  it('will accept a string source ID', function() {
    initCalendar({
      eventSources: [
        {
          id: '9',
          color: 'purple',
          events: [
            { id: 'a', start: '2018-09-07' }
          ]
        }
      ]
    })

    let theSource = currentCalendar.getEventSourceById('9')
    let newEvent = currentCalendar.addEvent({ id: 'b', start: '2018-09-10' }, '9')
    expect(newEvent.source.id === theSource.id)
  })

  it('will accept a number source ID', function() {
    initCalendar({
      eventSources: [
        {
          id: '9',
          color: 'purple',
          events: [
            { id: 'a', start: '2018-09-07' }
          ]
        }
      ]
    })

    let theSource = currentCalendar.getEventSourceById('9')
    let newEvent = currentCalendar.addEvent({ id: 'b', start: '2018-09-10' }, 9)
    expect(newEvent.source.id === theSource.id)
  })

  it('will accept an object source', function() {
    initCalendar({
      eventSources: [
        {
          id: '9',
          color: 'purple',
          events: [
            { id: 'a', start: '2018-09-07' }
          ]
        }
      ]
    })

    let theSource = currentCalendar.getEventSourceById('9')
    let newEvent = currentCalendar.addEvent({ id: 'b', start: '2018-09-10' }, theSource)
    expect(newEvent.source.id === theSource.id)
  })

})
