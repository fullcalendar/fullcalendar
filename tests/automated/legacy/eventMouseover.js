describe('eventMouseover', function() {

  pushOptions({
    defaultDate: '2014-08-01',
    scrollTime: '00:00:00'
  });

  [ 'month', 'agendaWeek' ].forEach(function(viewName) {
    describe('for ' + viewName + ' view', function() {

      pushOptions({
        defaultView: viewName
      })

      it('will trigger a eventMouseout when updating an event', function(done) {

        spyOnCalendarCallback('eventMouseout', function(arg) {
          expect(typeof arg.event).toBe('object')
          expect(typeof arg.jsEvent).toBe('object')
          done()
        })

        initCalendar({
          events: [ {
            title: 'event',
            start: '2014-08-02T01:00:00',
            className: 'event'
          } ],
          eventMouseover: function(arg) {
            expect(typeof arg.event).toBe('object')
            expect(typeof arg.jsEvent).toBe('object')
            arg.event.setProp('title', 'YO')
          }
        })

        $('.event').simulate('mouseover')

      })
    })
  })

  it('gets fired for background events', function(done) {
    let mouseoverCalled = false

    initCalendar({
      events: [ {
        start: '2014-08-02',
        rendering: 'background',
        className: 'event'
      } ],
      eventMouseover(arg) {
        expect(arg.event.rendering).toBe('background')
        mouseoverCalled = true
      },
      eventMouseout() {
        expect(mouseoverCalled).toBe(true)
        done()
      }
    })

    $('.event')
      .simulate('mouseover')
      .simulate('mouseout')
      .simulate('mouseleave') // helps out listenBySelector
  })

})
