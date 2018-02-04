describe('displayEventEnd', function() {

  pushOptions({
    defaultDate: '2014-06-13',
    timeFormat: 'H:mm'
  })

  describeOptions('defaultView', {
    'when in month view': 'month',
    'when in agendaWeek view': 'agendaWeek'
  }, function() {

    describe('when off', function() {

      pushOptions({
        displayEventEnd: false
      })

      describe('with an all-day event', function() {
        it('displays no time text', function(done) {
          initCalendar({
            events: [ {
              title: 'timed event',
              start: '2014-06-13',
              end: '2014-06-13',
              allDay: true
            } ],
            eventAfterAllRender: function() {
              expect($('.fc-event .fc-time').length).toBe(0)
              done()
            }
          })
        })
      })

      describe('with a timed event with no end time', function() {
        it('displays only the start time text', function(done) {
          initCalendar({
            events: [ {
              title: 'timed event',
              start: '2014-06-13T01:00:00',
              allDay: false
            } ],
            eventAfterAllRender: function() {
              expect($('.fc-event .fc-time')).toHaveText('1:00')
              done()
            }
          })
        })
      })

      describe('with a timed event with an end time', function() {
        it('displays only the start time text', function(done) {
          initCalendar({
            events: [ {
              title: 'timed event',
              start: '2014-06-13T01:00:00',
              end: '2014-06-13T02:00:00',
              allDay: false
            } ],
            eventAfterAllRender: function() {
              expect($('.fc-event .fc-time')).toHaveText('1:00')
              done()
            }
          })
        })
      })
    })

    describe('when on', function() {

      pushOptions({
        displayEventEnd: true
      })

      describe('with an all-day event', function() {
        it('displays no time text', function(done) {
          initCalendar({
            events: [ {
              title: 'timed event',
              start: '2014-06-13',
              end: '2014-06-13',
              allDay: true
            } ],
            eventAfterAllRender: function() {
              expect($('.fc-event .fc-time').length).toBe(0)
              done()
            }
          })
        })
      })

      describe('with a timed event with no end time', function() {
        it('displays only the start time text', function(done) {
          initCalendar({
            events: [ {
              title: 'timed event',
              start: '2014-06-13T01:00:00',
              allDay: false
            } ],
            eventAfterAllRender: function() {
              expect($('.fc-event .fc-time')).toHaveText('1:00')
              done()
            }
          })
        })
      })

      describe('with a timed event given an invalid end time', function() {
        it('displays only the start time text', function(done) {
          initCalendar({
            events: [ {
              title: 'timed event',
              start: '2014-06-13T01:00:00',
              end: '2014-06-13T01:00:00',
              allDay: false
            } ],
            eventAfterAllRender: function() {
              expect($('.fc-event .fc-time')).toHaveText('1:00')
              done()
            }
          })
        })
      })

      describe('with a timed event with an end time', function() {
        it('displays both the start and end time text', function(done) {
          initCalendar({
            events: [ {
              title: 'timed event',
              start: '2014-06-13T01:00:00',
              end: '2014-06-13T02:00:00',
              allDay: false
            } ],
            eventAfterAllRender: function() {
              expect($('.fc-event .fc-time')).toHaveText('1:00 - 2:00')
              done()
            }
          })
        })
      })
    })
  })
})
