describe('addEvent', () => {
  pushOptions({
    initialDate: '2018-09-07',
  })

  it('will re-add an event that was previously removed', () => {
    let calendar = initCalendar({
      events: [
        { id: 'a', start: '2018-09-07' },
      ],
    })
    let event = calendar.getEventById('a')
    expect(calendar.getEvents().length).toBe(1)
    event.remove()
    expect(calendar.getEvents().length).toBe(0)
    let newEvent = calendar.addEvent(event)
    expect(calendar.getEvents().length).toBe(1)
    expect(newEvent).toBe(event)
  })

  it('won\'t double-add an event that was previously added', () => {
    let calendar = initCalendar({
      events: [
        { id: 'a', start: '2018-09-07' },
      ],
    })
    let event = calendar.getEventById('a')
    expect(calendar.getEvents().length).toBe(1)
    let newEvent = calendar.addEvent(event)
    expect(calendar.getEvents().length).toBe(1)
    expect(newEvent).toBe(event)
  })

  it('will accept a string source ID', () => {
    let calendar = initCalendar({
      eventSources: [
        {
          id: '9',
          color: 'purple',
          events: [
            { id: 'a', start: '2018-09-07' },
          ],
        },
      ],
    })

    let theSource = calendar.getEventSourceById('9')
    let newEvent = calendar.addEvent({ id: 'b', start: '2018-09-10' }, '9')
    expect(newEvent.source.id).toEqual(theSource.id)
  })

  it('will accept a number source ID', () => {
    let calendar = initCalendar({
      eventSources: [
        {
          id: '9',
          color: 'purple',
          events: [
            { id: 'a', start: '2018-09-07' },
          ],
        },
      ],
    })

    let theSource = calendar.getEventSourceById('9')
    let newEvent = calendar.addEvent({ id: 'b', start: '2018-09-10' }, '9')
    expect(newEvent.source.id).toEqual(theSource.id)
  })

  it('will accept an object source', () => {
    let calendar = initCalendar({
      eventSources: [
        {
          id: '9',
          color: 'purple',
          events: [
            { id: 'a', start: '2018-09-07' },
          ],
        },
      ],
    })

    let theSource = calendar.getEventSourceById('9')
    let newEvent = calendar.addEvent({ id: 'b', start: '2018-09-10' }, theSource)
    expect(newEvent.source.id).toEqual(theSource.id)
  })
})
