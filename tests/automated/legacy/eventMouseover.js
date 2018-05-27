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

      it('will trigger a eventMouseout with updateEvent', function(done) {

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
            arg.event.title = 'YO'
            currentCalendar.updateEvent(arg.event)
          }
        })

        $('.event').simulate('mouseover')

      })
    })
  })
})
