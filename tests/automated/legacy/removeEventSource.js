describe('removeEventSource', function() {
  pushOptions({
    defaultDate: '2014-08-01'
  })

  beforeEach(function() {
    XHRMock.setup()
    XHRMock.get(/.*/, {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildEventArray())
    })
  })

  afterEach(function() {
    XHRMock.teardown()
  })

  describe('with a URL', function() {
    testInput('/myscript.php') // will go to mockjax
  })

  describe('with an array', function() {
    testInput(buildEventArray())
  })

  describe('with a function', function() {
    testInput(function(arg, callback) {
      callback(buildEventArray())
    })
  })

  describe('with an object+url', function() {
    testInput({
      url: '/myscript.php' // will go to mockjax
    })
  })

  describe('with an object+array', function() {
    testInput({
      events: buildEventArray()
    })
  })

  describe('with an object+function', function() {
    testInput({
      events: function(arg, callback) {
        callback(buildEventArray())
      }
    })
  })

  it('won\'t render removed events when subsequent addEventSource', function(done) {

    var source1 = function(arg, callback) {
      setTimeout(function() {
        callback([ {
          title: 'event1',
          className: 'event1',
          start: '2014-08-01T02:00:00'
        } ])
      }, 100)
    }

    var source2 = function(arg, callback) {
      setTimeout(function() {
        callback([ {
          title: 'event2',
          className: 'event2',
          start: '2014-08-01T02:00:00'
        } ])
      }, 100)
    }

    initCalendar({
      eventSources: [ source1 ],
      eventAfterAllRender() {
        if (!$('.fc-event').length) {
          ; // might have rendered no events after removeEventSource call
        } else {
          expect($('.event1').length).toBe(0)
          expect($('.event2').length).toBe(1)
          done()
        }
      }
    })

    currentCalendar.removeEventSource(source1)
    currentCalendar.addEventSource(source2)
  })

  describe('when multiple sources share the same fetching function', function() {
    var fetchFunc = function(arg, callback) {
      callback([ {
        title: 'event',
        start: '2014-08-01T02:00:00'
      } ])
    }

    pushOptions({
      eventSources: [
        { events: fetchFunc, className: 'event1', id: 'source1' },
        { events: fetchFunc, className: 'event2', id: 'source2' }
      ]
    })

    describe('when called with the raw function', function() {
      it('removes events from all matching sources', function() {

        initCalendar()
        expect($('.fc-event').length).toBe(2)
        expect($('.event1').length).toBe(1)
        expect($('.event2').length).toBe(1)

        currentCalendar.removeEventSource(fetchFunc)
        expect($('.fc-event').length).toBe(0)
      })
    })

    describe('when called with proper source object', function() {
      it('removes events only from the specific source', function() {

        initCalendar()
        expect($('.fc-event').length).toBe(2)
        expect($('.event1').length).toBe(1)
        expect($('.event2').length).toBe(1)

        var source = currentCalendar.getEventSourceById('source2')
        currentCalendar.removeEventSource(source)
        expect($('.fc-event').length).toBe(1)
        expect($('.event1').length).toBe(1)
        expect($('.event2').length).toBe(0)
      })
    })
  })

  function testInput(eventInput) {

    it('correctly removes events provided via `events` at initialization', function(done) {
      var callCnt = 0

      initCalendar({
        events: eventInput,
        eventAfterAllRender() {
          callCnt++
          if (callCnt === 1) {
            expectEventCnt(2)
            currentCalendar.removeEventSource(eventInput)
          } else if (callCnt === 2) {
            expectEventCnt(0)
            done()
          }
        }
      })
    })

    it('correctly removes events provided via `eventSources` at initialization', function(done) {
      var callCnt = 0

      initCalendar({
        eventSources: [ eventInput ],
        eventAfterAllRender() {
          callCnt++
          if (callCnt === 1) {
            expectEventCnt(2)
            currentCalendar.removeEventSource(eventInput)
          } else if (callCnt === 2) {
            expectEventCnt(0)
            done()
          }
        }
      })
    })

    it('correctly removes events provided via `addEventSource` method', function(done) {
      var callCnt = 0

      initCalendar({
        eventAfterAllRender() {
          callCnt++
          if (callCnt === 1) {
            currentCalendar.addEventSource(eventInput)
          } else if (callCnt === 2) {
            expectEventCnt(2)
            currentCalendar.removeEventSource(eventInput)
          } else if (callCnt === 3) {
            expectEventCnt(0)
            done()
          }
        }
      })
    })
  }

  function buildEventArray() {
    return [
      { title: 'event1', start: '2014-08-01' },
      { title: 'event2', start: '2014-08-02' }
    ]
  }

  function expectEventCnt(cnt) {
    expect($('.fc-event').length).toBe(cnt)
    expect(currentCalendar.clientEvents().length).toBe(cnt)
  }
})
