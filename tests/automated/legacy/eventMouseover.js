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

        spyOnCalendarCallback('eventMouseout', function(event, ev) {
          expect(typeof event).toBe('object')
          expect(typeof ev).toBe('object')
          done()
        })

        initCalendar({
          events: [ {
            title: 'event',
            start: '2014-08-02T01:00:00',
            className: 'event'
          } ],
          eventMouseover: function(event, ev) {
            expect(typeof event).toBe('object')
            expect(typeof ev).toBe('object')
            event.title = 'YO'
            currentCalendar.updateEvent(event)
          }
        })

        $('.event').simulate('mouseover')

      })
    })
  })
})
