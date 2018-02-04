import { testEventDrag } from '../lib/dnd-resize-utils'

describe('advanced external dnd', function() {

  beforeEach(function() {
    affix('.drag')
    $('.drag')
      .text('yo')
      .css({
        width: 200,
        background: 'blue',
        color: 'white'
      })
      .draggable()
  })
  pushOptions({
    defaultDate: '2014-11-13',
    scrollTime: '00:00:00',
    droppable: true
  })

  describe('in agenda slots', function() {
    pushOptions({defaultView: 'agendaWeek'})
    describe('when no element event data', function() {
      describe('when given duration through defaultTimedEventDuration', function() {
        pushOptions({defaultTimedEventDuration: '2:30'})
        defineTests()
      })
      describe('when given duration through data-duration', function() {
        beforeEach(function() {
          $('.drag').data('duration', '2:30')
        })
        defineTests()
      })

      function defineTests() {
        it('fires correctly', function(done) {
          var options = {}
          testExternalElDrag(options, '2014-11-13T03:00:00', true, done)
        })
        it('is not affected by eventOverlap:false', function(done) {
          var options = {}
          options.eventOverlap = false
          options.events = [ {
            start: '2014-11-13T01:00:00',
            end: '2014-11-13T05:00:00'
          } ]
          testExternalElDrag(options, '2014-11-13T03:00:00', true, done)
        })
        it('is not affected by an event object\'s overlap:false', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-11-13T01:00:00',
            end: '2014-11-13T05:00:00',
            overlap: false
          } ]
          testExternalElDrag(options, '2014-11-13T03:00:00', true, done)
        })
        it('is not affected by eventConstraint', function(done) {
          var options = {}

          options.eventConstraint = {
            start: '03:00',
            end: '10:00'
          }
          testExternalElDrag(options, '2014-11-13T02:00:00', true, done)
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
            testExternalElDrag(options, '2014-11-13T02:00:00', false, done)
          })
        })
        describe('with a selectConstraint', function() {
          pushOptions({
            selectConstraint: {
              start: '04:00',
              end: '08:00'
            }
          })
          it('can be dropped within', function(done) {
            var options = {}

            testExternalElDrag(options, '2014-11-13T05:30:00', true, done)
          })
          it('cannot be dropped when not fully contained', function(done) {
            var options = {}

            testExternalElDrag(options, '2014-11-13T06:00:00', false, done)
          })
        })
      }
    })

    describe('when event data is given', function() {

      it('fires correctly', function(done) {
        var options = {}

        $('.drag').data('event', { title: 'hey' })
        testExternalEventDrag(options, '2014-11-13T02:00:00', true, done)
      })

      describe('when given a start time', function() {
        describe('through the event object\'s start property', function() {
          beforeEach(function() {
            $('.drag').data('event', { start: '05:00' })
          })
          defineTests()
        })
        describe('through the event object\'s time property', function() {
          beforeEach(function() {
            $('.drag').data('event', { time: '05:00' })
          })
          defineTests()
        })
        describe('through the `start` data attribute', function() {
          beforeEach(function() {
            $('.drag').data('event', true)
              .data('start', '05:00')
          })
          defineTests()
        })
        describe('through the `time` data attribute', function() {
          beforeEach(function() {
            $('.drag').data('event', true)
              .data('time', '05:00')
          })
          defineTests()
        })
        function defineTests() {
          it('voids the given time when dropped on a timed slot', function(done) {
            var options = {}

            testExternalEventDrag(options, '2014-11-13T02:00:00', true, done)
            // will test the resulting event object's start
          })
        }
      })

      describe('when given a duration', function() {
        describe('through the event object\'s duration property', function() {
          beforeEach(function() {
            $('.drag').data('event', { duration: '05:00' })
          })
          defineTests()
        })
        describe('through the `duration` data attribute', function() {
          beforeEach(function() {
            $('.drag').data('event', true)
              .data('duration', '05:00')
          })
          defineTests()
        })
        function defineTests() {
          it('accepts the given duration when dropped on a timed slot', function(done) {
            var options = {}

            testExternalEventDrag(options, '2014-11-13T02:00:00', true, function() {
              var event = currentCalendar.clientEvents()[0]
              expect(event.start).toEqualMoment('2014-11-13T02:00:00')
              expect(event.end).toEqualMoment('2014-11-13T07:00:00')
              done()
            })
          })
        }
      })

      describe('when given stick:true', function() {
        describe('through the event object', function() {
          beforeEach(function() {
            $('.drag').data('event', { stick: true })
          })
          defineTests()
        })
        describe('through the data attribute', function() {
          beforeEach(function() {
            $('.drag').data('event', true)
              .data('stick', true)
          })
          defineTests()
        })
        function defineTests() {
          it('keeps the event when navigating away and back', function(done) {
            var options = {}

            testExternalEventDrag(options, '2014-11-13T02:00:00', true, function() {
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
        }
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
            $('.drag').data('event', true)
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
            $('.drag').data('event', {
              overlap: false
            })
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
            $('.drag').data('event', true)
          })
          defineTests()
        })
        function defineTests() {
          it('allows a drop when not colliding with the other event', function(done) {
            var options = {}
            testExternalEventDrag(options, '2014-11-13T08:00:00', true, done)
          })
          it('prevents a drop when colliding with the other event', function(done) {
            var options = {}
            testExternalEventDrag(options, '2014-11-13T06:00:00', false, done)
          })
        }
      })

      describe('when a constraint is specified', function() {
        describe('via eventConstraint', function() {
          pushOptions({
            eventConstraint: {
              start: '04:00',
              end: '08:00'
            }
          })
          beforeEach(function() {
            $('.drag').data('event', { duration: '02:00' })
          })
          defineTests()
        })
        describe('via the event object\'s constraint property', function() {
          beforeEach(function() {
            $('.drag').data('event', {
              duration: '02:00',
              constraint: {
                start: '04:00',
                end: '08:00'
              }
            })
          })
          defineTests()
        })
        function defineTests() {
          it('allows a drop when inside the constraint', function(done) {
            var options = {}
            testExternalEventDrag(options, '2014-11-13T05:00:00', true, done)
          })
          it('disallows a drop when partially outside of the constraint', function(done) {
            var options = {}
            testExternalEventDrag(options, '2014-11-13T07:00:00', false, done)
          })
        }
      })
    })
  })

  // TODO: write more tests for DayGrid!

  describe('in month whole-days', function() {
    pushOptions({
      defaultView: 'month'
    })

    describe('when event data is given', function() {

      it('fires correctly', function(done) {
        var options = {}

        $('.drag').data('event', { title: 'hey' })
        testExternalEventDrag(options, '2014-11-13', true, done)
      })

      describe('when given a start time', function() {
        describe('through the event object\'s start property', function() {
          beforeEach(function() {
            $('.drag').data('event', { start: '05:00' })
          })
          defineTests()
        })
        describe('through the event object\'s time property', function() {
          beforeEach(function() {
            $('.drag').data('event', { time: '05:00' })
          })
          defineTests()
        })
        describe('through the `start` data attribute', function() {
          beforeEach(function() {
            $('.drag').data('event', true)
              .data('start', '05:00')
          })
          defineTests()
        })
        describe('through the `time` data attribute', function() {
          beforeEach(function() {
            $('.drag').data('event', true)
              .data('time', '05:00')
          })
          defineTests()
        })
        function defineTests() {
          it('accepts the given start time for the dropped day', function(done) {
            var options = {}

            testExternalEventDrag(options, '2014-11-13', true, function() {
              // the whole-day start was already checked. we still need to check the exact time
              var event = currentCalendar.clientEvents()[0]
              expect(event.start).toEqualMoment('2014-11-13T05:00:00')
              done()
            })
          })
        }
      })
    })
  })


  function testExternalElDrag(options, date, expectSuccess, callback) {
    options.droppable = true
    options.drop = function(date, jsEvent, ui) {
      expect(moment.isMoment(date)).toBe(true)
      expect(date).toEqualMoment(date)
      expect(typeof jsEvent).toBe('object')
      expect(typeof ui).toBe('object')
    }
    options.eventReceive = function() { }
    spyOn(options, 'drop').and.callThrough()
    spyOn(options, 'eventReceive').and.callThrough()
    testEventDrag(options, date, expectSuccess, function() {
      if (expectSuccess) {
        expect(options.drop).toHaveBeenCalled()
      } else {
        expect(options.drop).not.toHaveBeenCalled()
      }
      expect(options.eventReceive).not.toHaveBeenCalled()
      callback()
    }, 'drag') // .drag className
  }


  function testExternalEventDrag(options, date, expectSuccess, callback) {
    options.droppable = true
    options.drop = function(date, jsEvent, ui) {
      expect(moment.isMoment(date)).toBe(true)
      expect(date).toEqualMoment(date)
      expect(typeof jsEvent).toBe('object')
      expect(typeof ui).toBe('object')
    }
    options.eventReceive = function(event) {
      if ($.fullCalendar.moment.parseZone(date).hasTime()) { // dropped on an all-day slot
        expect(event.start).toEqualMoment(date)
      } else { // event might have a time, which it is allowed to keep
        expect(event.start.clone().stripTime()).toEqualMoment(date)
      }
    }
    spyOn(options, 'drop').and.callThrough()
    spyOn(options, 'eventReceive').and.callThrough()
    testEventDrag(options, date, expectSuccess, function() {
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

