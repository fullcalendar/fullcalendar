describe('defaultAllDay', () => { // TODO: rename file
  describe('when undefined', () => {
    it('guesses false if T in ISO8601 start date', () => {
      initCalendar({
        events: [
          {
            id: '1',
            start: '2014-05-01T06:00:00',
          },
        ],
      })
      let eventObj = currentCalendar.getEventById('1')
      expect(eventObj.allDay).toEqual(false)
    })

    it('guesses false if T in ISO8601 end date', () => {
      initCalendar({
        events: [
          {
            id: '1',
            start: '2014-05-01',
            end: '2014-05-01T08:00:00',
          },
        ],
      })
      let eventObj = currentCalendar.getEventById('1')
      expect(eventObj.allDay).toEqual(false)
    })

    it('guesses true if ISO8601 start date with no time and unspecified end date', () => {
      initCalendar({
        events: [
          {
            id: '1',
            start: '2014-05-01',
          },
        ],
      })
      let eventObj = currentCalendar.getEventById('1')
      expect(eventObj.allDay).toEqual(true)
    })

    it('guesses true if ISO8601 start and end date with no times', () => {
      initCalendar({
        events: [
          {
            id: '1',
            start: '2014-05-01',
            end: '2014-05-03',
          },
        ],
      })
      let eventObj = currentCalendar.getEventById('1')
      expect(eventObj.allDay).toEqual(true)
    })

    it('guesses false if start is a unix timestamp (which implies it has a time)', () => {
      initCalendar({
        events: [
          {
            id: '1',
            start: 1398902400000,
            end: '2014-05-03',
          },
        ],
      })

      let eventObj = currentCalendar.getEventById('1')
      expect(eventObj.allDay).toEqual(false)
    })

    it('guesses false if end is a unix timestamp (which implies it has a time)', () => {
      initCalendar({
        events: [
          {
            id: '1',
            start: '2014-05-01',
            end: 1399075200000,
          },
        ],
      })
      let eventObj = currentCalendar.getEventById('1')
      expect(eventObj.allDay).toEqual(false)
    })
  })

  describe('when specified', () => {
    it('has an effect when an event\'s allDay is not specified', () => {
      initCalendar({
        defaultAllDay: false,
        events: [
          {
            id: '1',
            start: '2014-05-01',
          },
        ],
      })
      let eventObj = currentCalendar.getEventById('1')
      expect(eventObj.allDay).toEqual(false)
    })

    it('has no effect when an event\'s allDay is specified', () => {
      initCalendar({
        defaultAllDay: false,
        events: [
          {
            id: '1',
            start: '2014-05-01T00:00:00',
            allDay: true,
          },
        ],
      })
      let eventObj = currentCalendar.getEventById('1')
      expect(eventObj.allDay).toEqual(true)
    })
  })
})

describe('source.defaultAllDay', () => {
  it('has an effect when an event\'s allDay is not specified', () => {
    initCalendar({
      eventSources: [
        {
          defaultAllDay: false,
          events: [
            {
              id: '1',
              start: '2014-05-01',
            },
          ],
        },
      ],
    })
    let eventObj = currentCalendar.getEventById('1')
    expect(eventObj.allDay).toEqual(false)
  })

  it('a true value can override the global defaultAllDay', () => {
    initCalendar({
      defaultAllDay: false,
      eventSources: [
        {
          defaultAllDay: true,
          events: [
            {
              id: '1',
              start: '2014-05-01T06:00:00',
            },
          ],
        },
      ],
    })
    let eventObj = currentCalendar.getEventById('1')
    expect(eventObj.allDay).toEqual(true)
  })

  it('a false value can override the global defaultAllDay', () => {
    initCalendar({
      defaultAllDay: true,
      eventSources: [
        {
          defaultAllDay: false,
          events: [
            {
              id: '1',
              start: '2014-05-01',
            },
          ],
        },
      ],
    })
    let eventObj = currentCalendar.getEventById('1')
    expect(eventObj.allDay).toEqual(false)
  })

  it('has no effect when an event\'s allDay is specified', () => {
    initCalendar({
      eventSources: [
        {
          defaultAllDay: true,
          events: [
            {
              id: '1',
              start: '2014-05-01',
              allDay: false,
            },
          ],
        },
      ],
    })
    let eventObj = currentCalendar.getEventById('1')
    expect(eventObj.allDay).toEqual(false)
  })
})
