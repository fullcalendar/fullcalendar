import { testEventDrag } from '../lib/dnd-resize-utils'
import { ThirdPartyDraggable } from '@fullcalendar/interaction'

// TODO: Use the built-in Draggable for some of these tests

describe('advanced external dnd', function() {
  var dragEl
  var thirdPartyDraggable

  beforeEach(function() {
    dragEl = $('<div class="drag">yo</div>')
      .css({
        width: 200,
        background: 'blue',
        color: 'white'
      })
      .appendTo('body')
      .draggable()

    thirdPartyDraggable = new ThirdPartyDraggable({
      itemSelector: '.drag'
    })
  })

  afterEach(function() {
    thirdPartyDraggable.destroy()
    dragEl.remove()
    dragEl = null
  })

  pushOptions({
    defaultDate: '2014-11-13',
    scrollTime: '00:00:00',
    droppable: true
  })

  describe('in timeGrid slots', function() {
    pushOptions({defaultView: 'timeGridWeek'})
    describe('when no element event data', function() {
      describe('when given duration through defaultTimedEventDuration', function() {
        pushOptions({
          defaultTimedEventDuration: '2:30'
        })
        defineTests()
      })
      describe('when given duration through data attribute', function() {
        beforeEach(function() {
          dragEl.attr('data-event', JSON.stringify({
            duration: '2:30',
            create: false // only an external element, won't create or render as an event
          }))
        })
        defineTests()
      })

      function defineTests() {
        it('fires correctly', function(done) {
          var options = {}
          testExternalElDrag(options, '2014-11-13T03:00:00Z', '2014-11-13T03:00:00Z', true, done)
        })
        it('is not affected by eventOverlap:false', function(done) {
          var options = {}
          options.eventOverlap = false
          options.events = [ {
            start: '2014-11-13T01:00:00',
            end: '2014-11-13T05:00:00'
          } ]
          testExternalElDrag(options, '2014-11-13T03:00:00Z', '2014-11-13T03:00:00Z', true, done)
        })
        it('is not affected by an event object\'s overlap:false', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-11-13T01:00:00',
            end: '2014-11-13T05:00:00',
            overlap: false
          } ]
          testExternalElDrag(options, '2014-11-13T03:00:00Z', '2014-11-13T03:00:00Z', true, done)
        })
        it('is not affected by eventConstraint', function(done) {
          var options = {}

          options.eventConstraint = {
            start: '03:00',
            end: '10:00'
          }
          testExternalElDrag(options, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true, done)
        })
        describe('with selectOverlap:false', function() {
          pushOptions({
            selectOverlap: false,
            events: [ {
              start: '2014-11-13T04:00:00',
              end: '2014-11-13T08:00:00'
            }]
          })
          it('is not allowed to overlap an event', function(done) {
            var options = {}
            testExternalElDrag(options, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', false, done)
          })
        })
        describe('with a selectConstraint', function() {
          pushOptions({
            selectConstraint: {
              startTime: '04:00',
              endTime: '08:00'
            }
          })
          it('can be dropped within', function(done) {
            var options = {}

            testExternalElDrag(options, '2014-11-13T05:30:00Z', '2014-11-13T05:30:00Z', true, done)
          })
          it('cannot be dropped when not fully contained', function(done) {
            var options = {}

            testExternalElDrag(options, '2014-11-13T06:00:00Z', '2014-11-13T06:00:00Z', false, done)
          })
        })
      }
    })

    describe('when event data is given', function() {

      it('fires correctly', function(done) {
        var options = {}

        dragEl.attr('data-event', JSON.stringify({
          title: 'hey'
        }))
        testExternalEventDrag(options, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true, done)
      })

      describe('when given a start time', function() {
        describe('through the event object\'s time property', function() {
          beforeEach(function() {
            dragEl.attr('data-event', JSON.stringify({
              startTime: '05:00'
            }))
          })

          it('voids the given time when dropped on a timed slot', function(done) {
            var options = {}
            testExternalEventDrag(options, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true, done)
            // will test the resulting event object's start
          })
        })
      })

      describe('when given a duration', function() {
        describe('through the event object\'s duration property', function() {
          beforeEach(function() {
            dragEl.attr('data-event', JSON.stringify({
              duration: '05:00'
            }))
          })

          it('accepts the given duration when dropped on a timed slot', function(done) {
            var options = {}

            testExternalEventDrag(options, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true, function() {
              var event = currentCalendar.getEvents()[0]
              expect(event.start).toEqualDate('2014-11-13T02:00:00Z')
              expect(event.end).toEqualDate('2014-11-13T07:00:00Z')
              done()
            })
          })
        })
      })

      describe('when given stick:true', function() {
        describe('through the event object', function() {
          beforeEach(function() {
            dragEl.attr('data-event', JSON.stringify({
              stick: true
            }))
          })

          it('keeps the event when navigating away and back', function(done) {
            var options = {}

            testExternalEventDrag(options, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true, function() {
              setTimeout(function() { // make sure to escape handlers
                expect($('.fc-event').length).toBe(1)
                currentCalendar.next()
                expect($('.fc-event').length).toBe(0)
                currentCalendar.prev()
                expect($('.fc-event').length).toBe(1)
                done()
              }, 0)
            })
          })
        })
      })

      describe('when an overlap is specified', function() {
        describe('via eventOverlap', function() {
          pushOptions({
            eventOverlap: false,
            events: [ {
              start: '2014-11-13T05:00:00',
              end: '2014-11-13T08:00:00'
            } ]
          })
          beforeEach(function() {
            dragEl.attr('data-event', '{}')
          })
          defineTests()
        })
        describe('via an overlap on this event', function() {
          pushOptions({
            events: [{
              start: '2014-11-13T05:00:00',
              end: '2014-11-13T08:00:00'
            }]
          })
          beforeEach(function() {
            dragEl.attr('data-event', JSON.stringify({
              overlap: false
            }))
          })
          defineTests()
        })
        describe('via an overlap on the other event', function() {
          pushOptions({
            events: [{
              start: '2014-11-13T05:00:00',
              end: '2014-11-13T08:00:00',
              overlap: false
            }]
          })
          beforeEach(function() {
            dragEl.attr('data-event', '{}')
          })
          defineTests()
        })
        function defineTests() {
          it('allows a drop when not colliding with the other event', function(done) {
            var options = {}
            testExternalEventDrag(options, '2014-11-13T08:00:00Z', '2014-11-13T08:00:00Z', true, done)
          })
          it('prevents a drop when colliding with the other event', function(done) {
            var options = {}
            testExternalEventDrag(options, '2014-11-13T06:00:00Z', '2014-11-13T06:00:00Z', false, done)
          })
        }
      })

      describe('when a constraint is specified', function() {
        describe('via eventConstraint', function() {
          pushOptions({
            eventConstraint: {
              startTime: '04:00',
              endTime: '08:00'
            }
          })
          beforeEach(function() {
            dragEl.attr('data-event', JSON.stringify({
              duration: '02:00'
            }))
          })
          defineTests()
        })
        describe('via the event object\'s constraint property', function() {
          beforeEach(function() {
            dragEl.attr('data-event', JSON.stringify({
              duration: '02:00',
              constraint: {
                startTime: '04:00',
                endTime: '08:00'
              }
            }))
          })
          defineTests()
        })
        function defineTests() {
          it('allows a drop when inside the constraint', function(done) {
            var options = {}
            testExternalEventDrag(options, '2014-11-13T05:00:00Z', '2014-11-13T05:00:00Z', true, done)
          })
          it('disallows a drop when partially outside of the constraint', function(done) {
            var options = {}
            testExternalEventDrag(options, '2014-11-13T07:00:00Z', '2014-11-13T07:00:00Z', false, done)
          })
        }
      })
    })
  })

  // TODO: write more tests for DayGrid!

  describe('in month whole-days', function() {
    pushOptions({
      defaultView: 'dayGridMonth'
    })

    describe('when event data is given', function() {

      it('fires correctly', function(done) {
        var options = {}

        dragEl.attr('data-event', JSON.stringify({
          title: 'hey'
        }))
        testExternalEventDrag(options, '2014-11-13', '2014-11-13', true, done)
      })

      describe('when given a start time', function() {

        describe('through the event object\'s time property', function() {
          beforeEach(function() {
            dragEl.attr('data-event', JSON.stringify({
              startTime: '05:00'
            }))
          })

          it('accepts the given start time for the dropped day', function(done) {
            var options = {}

            testExternalEventDrag(options, '2014-11-13', '2014-11-13T05:00:00Z', true, function() {
              // the whole-day start was already checked. we still need to check the exact time
              var event = currentCalendar.getEvents()[0]
              expect(event.start).toEqualDate('2014-11-13T05:00:00Z')
              done()
            })
          })
        })
      })
    })
  })


  function testExternalElDrag(options, dragToDate, expectedDate, expectSuccess, callback) { // with NO event creation
    options.droppable = true
    options.drop = function(arg) {
      expect(arg.date instanceof Date).toBe(true)
      expect(arg.date).toEqualDate(expectedDate)
      expect(typeof arg.jsEvent).toBe('object')
    }
    options.eventReceive = function() { }
    spyOn(options, 'drop').and.callThrough()
    spyOn(options, 'eventReceive').and.callThrough()

    testEventDrag(options, dragToDate, expectSuccess, function() {
      if (expectSuccess) {
        expect(options.drop).toHaveBeenCalled()
      } else {
        expect(options.drop).not.toHaveBeenCalled()
      }
      expect(options.eventReceive).not.toHaveBeenCalled()
      callback()
    }, 'drag') // .drag className
  }


  function testExternalEventDrag(options, dragToDate, expectedDate, expectSuccess, callback) {
    var expectedAllDay = dragToDate.indexOf('T') === -1 // for the drop callback only!

    options.droppable = true
    options.drop = function(arg) {
      expect(arg.date instanceof Date).toBe(true)
      expect(arg.date).toEqualDate(dragToDate)
      expect(arg.allDay).toBe(expectedAllDay)
      expect(typeof arg.jsEvent).toBe('object')
    }
    options.eventReceive = function(arg) {
      expect(arg.event.start).toEqualDate(expectedDate)
    }
    spyOn(options, 'drop').and.callThrough()
    spyOn(options, 'eventReceive').and.callThrough()

    testEventDrag(options, dragToDate, expectSuccess, function() {
      if (expectSuccess) {
        expect(options.drop).toHaveBeenCalled()
        expect(options.eventReceive).toHaveBeenCalled()
      } else {
        expect(options.drop).not.toHaveBeenCalled()
        expect(options.eventReceive).not.toHaveBeenCalled()
      }
      callback()
    }, 'drag') // .drag className
  }

})

