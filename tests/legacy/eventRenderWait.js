describe('eventRenderWait', function() {

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
      defaultView: 'agendaDay',
      events: eventSource1,
      eventRenderWait: 0, // will still debounce despite being zero
      eventAfterAllRender: function() {
        eventRenderCnt++
        if (eventRenderCnt === 1) {

          expect($('.event1').length).toBe(1)
          expect($('.event2').length).toBe(1)
          expect($('.event3').length).toBe(1)
          expect($('.event4').length).toBe(1)
          expect($('.event5').length).toBe(1)
          expect($('.event6').length).toBe(0) // got removed

          // make sure doesn't fire again
          setTimeout(function() {
            expect(eventRenderCnt).toBe(1)
            done()
          }, 1000)
        }
      }
    })

    expect($('.fc-event').length).toBe(0)

    currentCalendar.addEventSource(eventSource2)
    expect($('.fc-event').length).toBe(0)

    currentCalendar.renderEvent(extraEvent1)
    expect($('.fc-event').length).toBe(0)

    currentCalendar.renderEvent(extraEvent2)
    expect($('.fc-event').length).toBe(0)

    currentCalendar.removeEvents(extraEvent2.id) // only works with id!?
    expect($('.fc-event').length).toBe(0)
  })
})
