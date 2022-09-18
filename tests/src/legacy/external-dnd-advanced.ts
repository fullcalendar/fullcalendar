import { ThirdPartyDraggable } from '@fullcalendar/interaction'
import { testEventDrag } from '../lib/dnd-resize-utils.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

// TODO: Use the built-in Draggable for some of these tests

describe('advanced external dnd', () => {
  let dragEl
  let thirdPartyDraggable

  beforeEach(() => {
    dragEl = $('<div class="drag">yo</div>')
      .css({
        width: 200,
        background: 'blue',
        color: 'white',
      })
      .appendTo('body')
      .draggable()

    thirdPartyDraggable = new ThirdPartyDraggable({
      itemSelector: '.drag',
    })
  })

  afterEach(() => {
    thirdPartyDraggable.destroy()
    dragEl.remove()
    dragEl = null
  })

  pushOptions({
    initialDate: '2014-11-13',
    scrollTime: '00:00:00',
    droppable: true,
  })

  describe('in timeGrid slots', () => {
    pushOptions({
      initialView: 'timeGridWeek',
    })

    describe('when no element event data', () => {
      describe('when given duration through defaultTimedEventDuration', () => {
        pushOptions({
          defaultTimedEventDuration: '2:30',
        })
        defineTests()
      })

      describe('when given duration through data attribute', () => {
        beforeEach(() => {
          dragEl.attr('data-event', JSON.stringify({
            duration: '2:30',
            create: false, // only an external element, won't create or render as an event
          }))
        })
        defineTests()
      })

      function defineTests() {
        it('fires correctly', (done) => {
          testExternalElDrag({}, '2014-11-13T03:00:00Z', '2014-11-13T03:00:00Z', true, done)
        })

        it('is not affected by eventOverlap:false', (done) => {
          let options = {
            eventOverlap: false,
            events: [{
              start: '2014-11-13T01:00:00',
              end: '2014-11-13T05:00:00',
            }],
          }
          testExternalElDrag(options, '2014-11-13T03:00:00Z', '2014-11-13T03:00:00Z', true, done)
        })

        it('is not affected by an event object\'s overlap:false', (done) => {
          let options = {
            events: [{
              start: '2014-11-13T01:00:00',
              end: '2014-11-13T05:00:00',
              overlap: false,
            }],
          }
          testExternalElDrag(options, '2014-11-13T03:00:00Z', '2014-11-13T03:00:00Z', true, done)
        })

        it('is not affected by eventConstraint', (done) => {
          let options = {
            eventConstraint: {
              start: '03:00',
              end: '10:00',
            },
          }
          testExternalElDrag(options, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true, done)
        })

        describe('with selectOverlap:false', () => {
          pushOptions({
            selectOverlap: false,
            events: [{
              start: '2014-11-13T04:00:00',
              end: '2014-11-13T08:00:00',
            }],
          })

          it('is not allowed to overlap an event', (done) => {
            testExternalElDrag({}, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', false, done)
          })
        })

        describe('with a selectConstraint', () => {
          pushOptions({
            selectConstraint: {
              startTime: '04:00',
              endTime: '08:00',
            },
          })

          it('can be dropped within', (done) => {
            testExternalElDrag({}, '2014-11-13T05:30:00Z', '2014-11-13T05:30:00Z', true, done)
          })

          it('cannot be dropped when not fully contained', (done) => {
            testExternalElDrag({}, '2014-11-13T06:00:00Z', '2014-11-13T06:00:00Z', false, done)
          })
        })
      }
    })

    describe('when event data is given', () => {
      it('fires correctly', (done) => {
        dragEl.attr('data-event', JSON.stringify({
          title: 'hey',
        }))
        testExternalEventDrag({}, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true, done)
      })

      describe('when given a start time', () => {
        describe('through the event object\'s time property', () => {
          beforeEach(() => {
            dragEl.attr('data-event', JSON.stringify({
              startTime: '05:00',
            }))
          })

          it('voids the given time when dropped on a timed slot', (done) => {
            testExternalEventDrag({}, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true, done)
            // will test the resulting event object's start
          })
        })
      })

      describe('when given a duration', () => {
        describe('through the event object\'s duration property', () => {
          beforeEach(() => {
            dragEl.attr('data-event', JSON.stringify({
              duration: '05:00',
            }))
          })

          it('accepts the given duration when dropped on a timed slot', (done) => {
            testExternalEventDrag({}, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true, () => {
              let event = currentCalendar.getEvents()[0]
              expect(event.start).toEqualDate('2014-11-13T02:00:00Z')
              expect(event.end).toEqualDate('2014-11-13T07:00:00Z')
              done()
            })
          })
        })
      })

      describe('when given stick:true', () => {
        describe('through the event object', () => {
          beforeEach(() => {
            dragEl.attr('data-event', JSON.stringify({
              stick: true,
            }))
          })

          it('keeps the event when navigating away and back', (done) => {
            testExternalEventDrag({}, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true, () => {
              setTimeout(() => { // make sure to escape handlers
                let calendarWrapper = new CalendarWrapper(currentCalendar)
                expect(calendarWrapper.getEventEls().length).toBe(1)
                currentCalendar.next()
                expect(calendarWrapper.getEventEls().length).toBe(0)
                currentCalendar.prev()
                expect(calendarWrapper.getEventEls().length).toBe(1)
                done()
              }, 0)
            })
          })
        })
      })

      describe('when an overlap is specified', () => {
        describe('via eventOverlap', () => {
          pushOptions({
            eventOverlap: false,
            events: [{
              start: '2014-11-13T05:00:00',
              end: '2014-11-13T08:00:00',
            }],
          })

          beforeEach(() => {
            dragEl.attr('data-event', '{}')
          })

          defineTests()
        })

        describe('via an overlap on this event', () => {
          pushOptions({
            events: [{
              start: '2014-11-13T05:00:00',
              end: '2014-11-13T08:00:00',
            }],
          })

          beforeEach(() => {
            dragEl.attr('data-event', JSON.stringify({
              overlap: false,
            }))
          })

          defineTests()
        })

        describe('via an overlap on the other event', () => {
          pushOptions({
            events: [{
              start: '2014-11-13T05:00:00',
              end: '2014-11-13T08:00:00',
              overlap: false,
            }],
          })

          beforeEach(() => {
            dragEl.attr('data-event', '{}')
          })

          defineTests()
        })

        function defineTests() {
          it('allows a drop when not colliding with the other event', (done) => {
            testExternalEventDrag({}, '2014-11-13T08:00:00Z', '2014-11-13T08:00:00Z', true, done)
          })
          it('prevents a drop when colliding with the other event', (done) => {
            testExternalEventDrag({}, '2014-11-13T06:00:00Z', '2014-11-13T06:00:00Z', false, done)
          })
        }
      })

      describe('when a constraint is specified', () => {
        describe('via eventConstraint', () => {
          pushOptions({
            eventConstraint: {
              startTime: '04:00',
              endTime: '08:00',
            },
          })

          beforeEach(() => {
            dragEl.attr('data-event', JSON.stringify({
              duration: '02:00',
            }))
          })

          defineTests()
        })

        describe('via the event object\'s constraint property', () => {
          beforeEach(() => {
            dragEl.attr('data-event', JSON.stringify({
              duration: '02:00',
              constraint: {
                startTime: '04:00',
                endTime: '08:00',
              },
            }))
          })

          defineTests()
        })

        function defineTests() {
          it('allows a drop when inside the constraint', (done) => {
            testExternalEventDrag({}, '2014-11-13T05:00:00Z', '2014-11-13T05:00:00Z', true, done)
          })
          it('disallows a drop when partially outside of the constraint', (done) => {
            testExternalEventDrag({}, '2014-11-13T07:00:00Z', '2014-11-13T07:00:00Z', false, done)
          })
        }
      })
    })
  })

  // TODO: write more tests for DayGrid!

  describe('in month whole-days', () => {
    pushOptions({
      initialView: 'dayGridMonth',
    })

    describe('when event data is given', () => {
      it('fires correctly', (done) => {
        dragEl.attr('data-event', JSON.stringify({
          title: 'hey',
        }))
        testExternalEventDrag({}, '2014-11-13', '2014-11-13', true, done)
      })

      describe('when given a start time', () => {
        describe('through the event object\'s time property', () => {
          beforeEach(() => {
            dragEl.attr('data-event', JSON.stringify({
              startTime: '05:00',
            }))
          })

          it('accepts the given start time for the dropped day', (done) => {
            testExternalEventDrag({}, '2014-11-13', '2014-11-13T05:00:00Z', true, () => {
              // the whole-day start was already checked. we still need to check the exact time
              let event = currentCalendar.getEvents()[0]
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
    options.drop = (arg) => {
      expect(arg.date instanceof Date).toBe(true)
      expect(arg.date).toEqualDate(expectedDate)
      expect(typeof arg.jsEvent).toBe('object')
    }
    options.eventReceive = () => {}
    spyOn(options, 'drop').and.callThrough()
    spyOn(options, 'eventReceive').and.callThrough()

    testEventDrag(options, dragToDate, expectSuccess, () => {
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
    let expectedAllDay = dragToDate.indexOf('T') === -1 // for the drop callback only!

    options.droppable = true
    options.drop = (arg) => {
      expect(arg.date instanceof Date).toBe(true)
      expect(arg.date).toEqualDate(dragToDate)
      expect(arg.allDay).toBe(expectedAllDay)
      expect(typeof arg.jsEvent).toBe('object')
    }
    options.eventReceive = (arg) => {
      expect(arg.event.start).toEqualDate(expectedDate)
    }
    spyOn(options, 'drop').and.callThrough()
    spyOn(options, 'eventReceive').and.callThrough()

    testEventDrag(options, dragToDate, expectSuccess, () => {
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
