describe('eventSourceSuccess', () => {
  const FETCH_FUNC = (info, successCallback) => {
    successCallback({
      something: [
        { title: 'hi', start: '2018-10-01' },
      ],
    })
  }

  const TRANSFORM = (input) => input.something

  pushOptions({
    initialDate: '2018-10-01',
  })

  it('massages event data with calendar-wide setting', () => {
    let calendar = initCalendar({
      eventSources: [FETCH_FUNC],
      eventSourceSuccess: TRANSFORM,
    })

    expect(calendar.getEvents().length).toBe(1)
  })

  it('massages event data with source setting', () => {
    let calendar = initCalendar({
      eventSources: [
        {
          events: FETCH_FUNC,
          success: TRANSFORM,
        },
      ],
    })

    expect(calendar.getEvents().length).toBe(1)
  })
})
