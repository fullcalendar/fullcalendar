describe('rerenderDelay', function() {

  it('batches together many event renders', function(done) {
    var eventSource1 = [
      { title: 'event1', start: '2016-12-04T01:00:00', className: 'event1' },
      { title: 'event2', start: '2016-12-04T02:00:00', className: 'event2' }
    ]
    var eventSource2 = [
      { title: 'event3', start: '2016-12-04T03:00:00', className: 'event3' },
      { title: 'event4', start: '2016-12-04T04:00:00', className: 'event4' }
    ]
    var extraEvent1 = { title: 'event5', start: '2016-12-04T05:00:00', className: 'event5', id: '5' }
    var extraEvent2 = { title: 'event6', start: '2016-12-04T06:00:00', className: 'event6', id: '6' }
    var eventRenderCnt = 0

    initCalendar({
      defaultDate: '2016-12-04',
      defaultView: 'timeGridDay',
      events: eventSource1,
      rerenderDelay: 0, // will still debounce despite being zero
      _eventsPositioned: function() {
        eventRenderCnt++
        if (eventRenderCnt === 2) {

          expect($('.event1').length).toBe(1)
          expect($('.event2').length).toBe(1)
          expect($('.event3').length).toBe(1)
          expect($('.event4').length).toBe(1)
          expect($('.event5').length).toBe(1)
          expect($('.event6').length).toBe(0) // got removed

          // make sure doesn't fire again
          setTimeout(function() {
            expect(eventRenderCnt).toBe(2)
            done()
          }, 1000)
        }
      }
    })

    expect($('.fc-event').length).toBe(2)

    currentCalendar.addEventSource(eventSource2)
    expect($('.fc-event').length).toBe(2)

    currentCalendar.addEvent(extraEvent1)
    expect($('.fc-event').length).toBe(2)

    var refined2 = currentCalendar.addEvent(extraEvent2)
    expect($('.fc-event').length).toBe(2)

    refined2.remove()
    expect($('.fc-event').length).toBe(2)
  })
})
