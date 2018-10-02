describe('eventSourceSuccess', function() {

  const FETCH_FUNC = function(info, successCallback) {
    successCallback({
      something: [
        { title: 'hi', start: '2018-10-01' }
      ]
    })
  }

  const TRANSFORM = function(input) {
    return input.something
  }

  pushOptions({
    defaultDate: '2018-10-01'
  })

  it('massages event data with calendar-wide setting', function() {
    initCalendar({
      eventSources: [ FETCH_FUNC ],
      eventSourceSuccess: TRANSFORM
    })

    expect(currentCalendar.getEvents().length).toBe(1)
  })

  it('massages event data with source setting', function() {
    initCalendar({
      eventSources: [
        {
          events: FETCH_FUNC,
          success: TRANSFORM
        }
      ]
    })

    expect(currentCalendar.getEvents().length).toBe(1)
  })

})
