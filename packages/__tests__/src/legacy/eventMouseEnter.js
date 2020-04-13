describe('eventMouseEnter', function() {
  pushOptions({
    defaultDate: '2014-08-01',
    scrollTime: '00:00:00'
  })

  ;[ 'dayGridMonth', 'timeGridWeek' ].forEach(function(viewName) {
    describe('for ' + viewName + ' view', function() {

      pushOptions({
        defaultView: viewName
      })

      it('doesn\'t trigger a eventMouseLeave when updating an event', function(done) {
        let options = {
          events: [ {
            title: 'event',
            start: '2014-08-02T01:00:00',
            className: 'event'
          } ],
          eventMouseEnter: function(arg) {
            expect(typeof arg.event).toBe('object')
            expect(typeof arg.jsEvent).toBe('object')
            arg.event.setProp('title', 'YO')
          },
          eventMouseLeave: function(arg) {}
        }

        spyOn(options, 'eventMouseEnter')
        spyOn(options, 'eventMouseLeave')

        initCalendar(options)
        $('.event').simulate('mouseover')

        setTimeout(function() {
          expect(options.eventMouseEnter).toHaveBeenCalled()
          expect(options.eventMouseLeave).not.toHaveBeenCalled()
          done()
        }, 100)
      })
    })
  })

  it('gets fired for background events', function(done) {
    let mouseoverCalled = false

    initCalendar({
      events: [ {
        start: '2014-08-02',
        display: 'background',
        className: 'event'
      } ],
      eventMouseEnter(arg) {
        expect(arg.event.display).toBe('background')
        mouseoverCalled = true
      },
      eventMouseLeave() {
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
