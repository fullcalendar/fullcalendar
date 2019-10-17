import { getSingleEl, getEventElTimeEl } from '../event-render/EventRenderUtils'

describe('displayEventEnd', function() {

  pushOptions({
    defaultDate: '2014-06-13',
    timeZone: 'UTC',
    eventTimeFormat: { hour: 'numeric', minute: '2-digit' }
  })

  describeOptions('defaultView', {
    'when in month view': 'dayGridMonth',
    'when in week view': 'timeGridWeek'
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
            _eventsPositioned: function() {
              expect(getEventElTimeEl(getSingleEl()).length).toBe(0)
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
            _eventsPositioned: function() {
              expect(getEventElTimeEl(getSingleEl())).toHaveText('1:00 AM')
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
            _eventsPositioned: function() {
              expect(getEventElTimeEl(getSingleEl())).toHaveText('1:00 AM')
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
            _eventsPositioned: function() {
              expect(getEventElTimeEl(getSingleEl()).length).toBe(0)
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
            _eventsPositioned: function() {
              expect(getEventElTimeEl(getSingleEl())).toHaveText('1:00 AM')
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
            _eventsPositioned: function() {
              expect(getEventElTimeEl(getSingleEl())).toHaveText('1:00 AM')
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
            _eventsPositioned: function() {
              expect(getEventElTimeEl(getSingleEl())).toHaveText('1:00 AM - 2:00 AM')
              done()
            }
          })
        })
      })
    })
  })
})
