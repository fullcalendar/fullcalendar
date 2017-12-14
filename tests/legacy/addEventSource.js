describe('addEventSource', function() {
  var eventArray = [
    { id: 0, title: 'event zero', start: '2014-06-24', className: 'event-zero' },
    { id: 1, title: 'event one', start: '2014-06-24', className: 'event-non-zero event-one' },
    { id: 2, title: 'event two', start: '2014-06-24', className: 'event-non-zero event-two' }
  ]

  pushOptions({
    defaultDate: '2014-06-24',
    defaultView: 'month'
  })


  it('correctly adds an array source', function(done) {
    go(
      function() {
        currentCalendar.addEventSource(eventArray)
      },
      null,
      done
    )
  })

  it('correctly adds a function source', function(done) {
    go(
      function() {
        currentCalendar.addEventSource(function(start, end, timezone, callback) {
          callback(eventArray)
        })
      },
      null,
      done
    )
  })

  it('correctly adds an extended array source', function(done) {
    go(
      function() {
        currentCalendar.addEventSource({
          className: 'arraysource',
          events: eventArray
        })
      },
      function() {
        expect($('.arraysource').length).toEqual(3)
      },
      done
    )
  })

  it('correctly adds an extended array source', function(done) {
    go(
      function() {
        currentCalendar.addEventSource({
          className: 'funcsource',
          events: function(start, end, timezone, callback) {
            callback(eventArray)
          }
        })
      },
      function() {
        expect($('.funcsource').length).toEqual(3)
      },
      done
    )
  })


  function go(addFunc, extraTestFunc, doneFunc) {
    var callCnt = 0
    var options = {}
    options.eventAfterAllRender = function() {
      callCnt++
      if (callCnt === 2) { // once for initial render. second time for addEventSource

        checkAllEvents()
        if (extraTestFunc) {
          extraTestFunc()
        }

        // move the calendar back out of view, then back in (for issue 2191)
        currentCalendar.next()
        currentCalendar.prev()

        // otherwise, prev/next would be cancelled out by doneFunc's calendar destroy
        setTimeout(function() {

          checkAllEvents()
          if (extraTestFunc) {
            extraTestFunc()
          }

          doneFunc()
        }, 0)
      }
    }

    initCalendar(options)
    addFunc()
  }

  // Checks to make sure all events have been rendered and that the calendar
  // has internal info on all the events.
  function checkAllEvents() {
    expect(currentCalendar.clientEvents().length).toEqual(3)
    expect($('.fc-event').length).toEqual(3)
  }

})
