describe('event source refetch', function() {

  // used by createEventGenerator
  var eventCount
  var fetchId
  var fetchDelay

  beforeEach(function() {
    eventCount = 1
    fetchId = 7
  })

  pushOptions({
    now: '2015-08-07',
    defaultView: 'timeGridDay',
    scrollTime: '00:00',
    eventSources: [
      {
        id: 'green0',
        events: createEventGenerator('source1-'),
        color: 'green'
      },
      {
        id: 'blue',
        events: createEventGenerator('source2-'),
        color: 'blue'
      },
      {
        id: 'green1',
        events: createEventGenerator('source3-'),
        color: 'green'
      }
    ]
  })

  describe('with a single event source', function() { // reword this stuff
    it('will be refetched', function() {
      initCalendar()

      expect($('.source1-7').length).toEqual(1)
      expect($('.source2-7').length).toEqual(1)
      expect($('.source3-7').length).toEqual(1)

      // increase the number of events for the refetched source
      eventCount = 2
      fetchId = 8

      currentCalendar.getEventSourceById('blue').refetch()

      // events from unaffected sources remain
      expect($('.source1-7').length).toEqual(1)
      expect($('.source3-7').length).toEqual(1)

      // events from old fetch were cleared
      expect($('.source2-7').length).toEqual(0)

      // events from new fetch were rendered
      expect($('.source2-8').length).toEqual(2)
    })
  })

  describe('multiple event sources', function() {
    it('will be refetched', function() {
      initCalendar()

      expect($('.source1-7').length).toEqual(1)
      expect($('.source2-7').length).toEqual(1)
      expect($('.source3-7').length).toEqual(1)

      // increase the number of events for the refetched sources
      eventCount = 2
      fetchId = 8

      currentCalendar.getEventSourceById('green0').refetch()
      currentCalendar.getEventSourceById('green1').refetch()

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

  describe('when called while initial fetch is still pending', function() {
    it('keeps old events and rerenders new', function(done) {
      fetchDelay = 100

      initCalendar({
        _eventsPositioned() {

          // events from unaffected sources remain
          expect($('.source2-7').length).toEqual(1)

          // events from old fetch were cleared
          expect($('.source1-7').length).toEqual(0)
          expect($('.source3-7').length).toEqual(0)

          // events from new fetch were rendered
          expect($('.source1-8').length).toEqual(2)
          expect($('.source3-8').length).toEqual(2)

          done()
        }
      })

      // increase the number of events for the refetched sources
      eventCount = 2
      fetchId = 8

      currentCalendar.getEventSourceById('green0').refetch()
      currentCalendar.getEventSourceById('green1').refetch()
    })
  })

  function createEventGenerator(classNamePrefix) {
    return function(arg, callback) {
      var events = []

      for (var i = 0; i < eventCount; i++) {
        events.push({
          start: '2015-08-07T02:00:00',
          end: '2015-08-07T03:00:00',
          className: classNamePrefix + fetchId,
          title: classNamePrefix + fetchId // also make it the title
        })
      }

      if (fetchDelay) {
        setTimeout(function() {
          callback(events)
        }, fetchDelay)
      } else {
        callback(events)
      }
    }
  }
})
