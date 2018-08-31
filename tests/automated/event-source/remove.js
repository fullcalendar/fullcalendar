describe('event source remove', function() {
  pushOptions({
    defaultDate: '2014-08-01'
  })

  it('correctly removes events provided via `eventSources` at initialization', function(done) {
    var callCnt = 0

    initCalendar({
      eventSources: [ {
        id: '5',
        events: [
          { title: 'event1', start: '2014-08-01' },
          { title: 'event2', start: '2014-08-02' }
        ]
      } ],
      _eventsPositioned() {
        callCnt++
        if (callCnt === 1) {
          expectEventCnt(2)
          currentCalendar.getEventSourceById('5').remove()
        } else if (callCnt === 2) {
          expectEventCnt(0)
          done()
        }
      }
    })
  })

  it('won\'t render removed events when subsequent addEventSource', function(done) {

    var source1 = {
      id: '1',
      events: function(arg, callback) {
        setTimeout(function() {
          callback([ {
            title: 'event1',
            className: 'event1',
            start: '2014-08-01T02:00:00'
          } ])
        }, 100)
      }
    }

    var source2 = {
      id: '2',
      events: function(arg, callback) {
        setTimeout(function() {
          callback([ {
            title: 'event2',
            className: 'event2',
            start: '2014-08-01T02:00:00'
          } ])
        }, 100)
      }
    }

    initCalendar({
      eventSources: [ source1 ],
      _eventsPositioned() {
        if (!$('.fc-event').length) {
          ; // might have rendered no events after removeEventSource call
        } else {
          expect($('.event1').length).toBe(0)
          expect($('.event2').length).toBe(1)
          done()
        }
      }
    })

    currentCalendar.getEventSourceById('1').remove()
    currentCalendar.addEventSource(source2)
  })

  function expectEventCnt(cnt) {
    expect($('.fc-event').length).toBe(cnt)
    expect(currentCalendar.getEvents().length).toBe(cnt)
  }

})
