describe('Event::setProps', () => {
  it('allows setting id', () => {
    const calendar = initCalendar({
      events: [
        { id: '123', start: '2021-01-01' },
      ],
    })

    let events = calendar.getEvents()
    let event = events[0]

    expect(event.id).toBe('123')

    event.setProp('id', '456')
    expect(event.id).toBe('456')

    events = calendar.getEvents()
    event = events[0]
    expect(event.id).toBe('456')
  })
})
