describe('event source refetch', () => {
  const OPTIONS = {
    now: '2015-08-07',
    initialView: 'timeGridDay',
    scrollTime: '00:00',
  }

  describe('with a single event source', () => { // reword this stuff
    it('will be refetched', () => {
      let fetchConfig = { eventCount: 1, fetchId: 7 }
      let calendar = initWithSources(fetchConfig)

      expect($('.source1-7').length).toEqual(1)
      expect($('.source2-7').length).toEqual(1)
      expect($('.source3-7').length).toEqual(1)

      fetchConfig.eventCount = 2
      fetchConfig.fetchId = 8
      calendar.getEventSourceById('blue').refetch()

      // events from unaffected sources remain
      expect($('.source1-7').length).toEqual(1)
      expect($('.source3-7').length).toEqual(1)

      // events from old fetch were cleared
      expect($('.source2-7').length).toEqual(0)

      // events from new fetch were rendered
      expect($('.source2-8').length).toEqual(2)
    })
  })

  describe('multiple event sources', () => {
    it('will be refetched', () => {
      let fetchConfig = { eventCount: 1, fetchId: 7 }
      let calendar = initWithSources(fetchConfig)

      expect($('.source1-7').length).toEqual(1)
      expect($('.source2-7').length).toEqual(1)
      expect($('.source3-7').length).toEqual(1)

      fetchConfig.eventCount = 2
      fetchConfig.fetchId = 8
      calendar.getEventSourceById('green0').refetch()
      calendar.getEventSourceById('green1').refetch()

      // events from unaffected sources remain
      expect($('.source2-7').length).toEqual(1)

      // events from old fetch were cleared
      expect($('.source1-7').length).toEqual(0)
      expect($('.source3-7').length).toEqual(0)

      // events from new fetch were rendered
      expect($('.source1-8').length).toEqual(2)
      expect($('.source3-8').length).toEqual(2)
    })
  })

  describe('when called while initial fetch is still pending', () => {
    it('keeps old events and rerenders new', (done) => {
      let fetchConfig = { eventCount: 1, fetchId: 7, fetchDelay: 100 }
      let calendar = initWithSources(fetchConfig)

      fetchConfig.eventCount = 2
      fetchConfig.fetchId = 8
      calendar.getEventSourceById('green0').refetch()
      calendar.getEventSourceById('green1').refetch()

      setTimeout(() => {
        // events from unaffected sources remain
        expect($('.source2-7').length).toEqual(1)

        // events from old fetch were cleared
        expect($('.source1-7').length).toEqual(0)
        expect($('.source3-7').length).toEqual(0)

        // events from new fetch were rendered
        expect($('.source1-8').length).toEqual(2)
        expect($('.source3-8').length).toEqual(2)

        done()
      }, fetchConfig.fetchDelay + 1)
    })
  })

  function initWithSources(fetchConfig) {
    return initCalendar({
      ...OPTIONS,
      eventSources: [
        {
          id: 'green0',
          events: createEventGenerator('source1-', fetchConfig),
          color: 'green',
        },
        {
          id: 'blue',
          events: createEventGenerator('source2-', fetchConfig),
          color: 'blue',
        },
        {
          id: 'green1',
          events: createEventGenerator('source3-', fetchConfig),
          color: 'green',
        },
      ],
    })
  }

  function createEventGenerator(classNamePrefix, fetchConfig) {
    return (arg, callback) => {
      let events = []

      for (let i = 0; i < fetchConfig.eventCount; i += 1) {
        events.push({
          start: '2015-08-07T02:00:00',
          end: '2015-08-07T03:00:00',
          className: classNamePrefix + fetchConfig.fetchId,
          title: classNamePrefix + fetchConfig.fetchId, // also make it the title
        })
      }

      if (fetchConfig.fetchDelay) {
        setTimeout(() => {
          callback(events)
        }, fetchConfig.fetchDelay)
      } else {
        callback(events)
      }
    }
  }
})
