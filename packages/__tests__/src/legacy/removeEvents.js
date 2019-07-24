describe('removeEvents', function() {

  pushOptions({
    defaultDate: '2014-06-24',
    defaultView: 'dayGridMonth'
  })

  function buildEventsWithoutIds() {
    return [
      { title: 'event zero', start: '2014-06-24', className: 'event-zero' },
      { title: 'event one', start: '2014-06-24', className: 'event-non-zero event-one' },
      { title: 'event two', start: '2014-06-24', className: 'event-non-zero event-two' }
    ]
  }

  function buildEventsWithIds() {
    var events = buildEventsWithoutIds()
    var i

    for (i = 0; i < events.length; i++) {
      events[i].id = i
    }

    return events
  }

  $.each({
    'when events without IDs': buildEventsWithoutIds,
    'when events with IDs': buildEventsWithIds
  }, function(desc, eventGenerator) {
    describe(desc, function() {

      it('can remove all events if no args specified', function(done) {
        go(
          eventGenerator(),
          function() {
            currentCalendar.removeAllEvents()
          },
          function() {
            expect(currentCalendar.getEvents().length).toEqual(0)
            expect($('.fc-event').length).toEqual(0)
          },
          done
        )
      })

      it('can remove events individually', function(done) {
        go(
          eventGenerator(),
          function() {
            currentCalendar.getEvents().forEach(function(event) {
              if ($.inArray('event-one', event.classNames) !== -1) {
                event.remove()
              }
            })
          },
          function() {
            expect(currentCalendar.getEvents().length).toEqual(2)
            expect($('.fc-event').length).toEqual(2)
            expect($('.event-zero').length).toEqual(1)
            expect($('.event-two').length).toEqual(1)
          },
          done
        )
      })

    })
  })

  it('can remove events with a numeric ID', function(done) {
    go(
      buildEventsWithIds(),
      function() {
        currentCalendar.getEventById(1).remove()
      },
      function() {
        expect(currentCalendar.getEvents().length).toEqual(2)
        expect($('.fc-event').length).toEqual(2)
        expect($('.event-zero').length).toEqual(1)
        expect($('.event-two').length).toEqual(1)
      },
      done
    )
  })

  it('can remove events with a string ID', function(done) {
    go(
      buildEventsWithIds(),
      function() {
        currentCalendar.getEventById('1').remove()
      },
      function() {
        expect(currentCalendar.getEvents().length).toEqual(2)
        expect($('.fc-event').length).toEqual(2)
        expect($('.event-zero').length).toEqual(1)
        expect($('.event-two').length).toEqual(1)
      },
      done
    )
  })

  it('can remove an event with ID 0', function(done) { // for issue 2082
    go(
      buildEventsWithIds(),
      function() {
        currentCalendar.getEventById(0).remove()
      },
      function() {
        expect(currentCalendar.getEvents().length).toEqual(2)
        expect($('.fc-event').length).toEqual(2)
        expect($('.event-zero').length).toEqual(0)
        expect($('.event-non-zero').length).toEqual(2)
      },
      done
    )
  })

  // Verifies the actions in removeFunc executed correctly by calling checkFunc.
  function go(events, removeFunc, checkFunc, doneFunc) {
    var called = false
    initCalendar({
      events: events,
      _eventsPositioned: function() {
        if (!called) { // don't execute on subsequent removeEvents/next/prev
          called = true

          checkAllEvents() // make sure all events initially rendered correctly

          removeFunc() // remove the events
          setTimeout(function() { // because the event rerender will be queued because we're a level deep

            checkFunc() // check correctness

            // move the calendar back out of view, then back in
            currentCalendar.next()
            currentCalendar.prev()

            // array event sources should maintain the same state
            // whereas "dynamic" event sources should refetch and reset the state
            if ($.isArray(events)) {
              checkFunc() // for issue 2187
            } else {
              checkAllEvents()
            }

            doneFunc()
          }, 0)
        }
      }
    })
  }


  // Checks to make sure all events have been rendered and that the calendar
  // has internal info on all the events.
  function checkAllEvents() {
    expect(currentCalendar.getEvents().length).toEqual(3)
    expect($('.fc-event').length).toEqual(3)
  }

})
