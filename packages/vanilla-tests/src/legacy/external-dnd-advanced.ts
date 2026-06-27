import { ThirdPartyDraggable } from 'fullcalendar/interaction'
import { testEventDrag } from '../lib/dnd-resize-utils'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { waitTimeout } from '../lib/misc'

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
        it('fires correctly', async () => {
          await testExternalElDrag({}, '2014-11-13T03:00:00Z', '2014-11-13T03:00:00Z', true)
        })

        it('is not affected by eventOverlap:false', async () => {
          let options = {
            eventOverlap: false,
            events: [{
              start: '2014-11-13T01:00:00',
              end: '2014-11-13T05:00:00',
            }],
          }
          await testExternalElDrag(options, '2014-11-13T03:00:00Z', '2014-11-13T03:00:00Z', true)
        })

        it('is not affected by an event object\'s overlap:false', async () => {
          let options = {
            events: [{
              start: '2014-11-13T01:00:00',
              end: '2014-11-13T05:00:00',
              overlap: false,
            }],
          }
          await testExternalElDrag(options, '2014-11-13T03:00:00Z', '2014-11-13T03:00:00Z', true)
        })

        it('is not affected by eventConstraint', async () => {
          let options = {
            eventConstraint: {
              start: '03:00',
              end: '10:00',
            },
          }
          await testExternalElDrag(options, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true)
        })

        describe('with selectOverlap:false', () => {
          pushOptions({
            selectOverlap: false,
            events: [{
              start: '2014-11-13T04:00:00',
              end: '2014-11-13T08:00:00',
            }],
          })

          it('is not allowed to overlap an event', async () => {
            await testExternalElDrag({}, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', false)
          })
        })

        describe('with a selectConstraint', () => {
          pushOptions({
            selectConstraint: {
              startTime: '04:00',
              endTime: '08:00',
            },
          })

          it('can be dropped within', async () => {
            await testExternalElDrag({}, '2014-11-13T05:30:00Z', '2014-11-13T05:30:00Z', true)
          })

          it('cannot be dropped when not fully contained', async () => {
            await testExternalElDrag({}, '2014-11-13T06:00:00Z', '2014-11-13T06:00:00Z', false)
          })
        })
      }
    })

    describe('when event data is given', () => {
      it('fires correctly', async () => {
        dragEl.attr('data-event', JSON.stringify({
          title: 'hey',
        }))
        await testExternalEventDrag({}, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true)
      })

      describe('when given a start time', () => {
        describe('through the event object\'s time property', () => {
          beforeEach(() => {
            dragEl.attr('data-event', JSON.stringify({
              startTime: '05:00',
            }))
          })

          it('voids the given time when dropped on a timed slot', async () => {
            await testExternalEventDrag({}, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true)
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

          it('accepts the given duration when dropped on a timed slot', async () => {
            let calendar = await testExternalEventDrag({}, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true)
            let event = calendar.getEvents()[0]
            expect(event.start).toEqualDate('2014-11-13T02:00:00Z')
            expect(event.end).toEqualDate('2014-11-13T07:00:00Z')
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

          it('keeps the event when navigating away and back', async () => {
            let calendar = await testExternalEventDrag({}, '2014-11-13T02:00:00Z', '2014-11-13T02:00:00Z', true)
            await waitTimeout()
            let calendarWrapper = new CalendarWrapper(calendar)
            expect(calendarWrapper.getEventEls().length).toBe(1)
            calendar.next()
            expect(calendarWrapper.getEventEls().length).toBe(0)
            calendar.prev()
            expect(calendarWrapper.getEventEls().length).toBe(1)
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
          it('allows a drop when not colliding with the other event', async () => {
            await testExternalEventDrag({}, '2014-11-13T08:00:00Z', '2014-11-13T08:00:00Z', true)
          })
          it('prevents a drop when colliding with the other event', async () => {
            await testExternalEventDrag({}, '2014-11-13T06:00:00Z', '2014-11-13T06:00:00Z', false)
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
          it('allows a drop when inside the constraint', async () => {
            await testExternalEventDrag({}, '2014-11-13T05:00:00Z', '2014-11-13T05:00:00Z', true)
          })
          it('disallows a drop when partially outside of the constraint', async () => {
            await testExternalEventDrag({}, '2014-11-13T07:00:00Z', '2014-11-13T07:00:00Z', false)
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
      it('fires correctly', async () => {
        dragEl.attr('data-event', JSON.stringify({
          title: 'hey',
        }))
        await testExternalEventDrag({}, '2014-11-13', '2014-11-13', true)
      })

      describe('when given a start time', () => {
        describe('through the event object\'s time property', () => {
          beforeEach(() => {
            dragEl.attr('data-event', JSON.stringify({
              startTime: '05:00',
            }))
          })

          it('accepts the given start time for the dropped day', async () => {
            let calendar = await testExternalEventDrag({}, '2014-11-13', '2014-11-13T05:00:00Z', true)
            // the whole-day start was already checked. we still need to check the exact time
            let event = calendar.getEvents()[0]
            expect(event.start).toEqualDate('2014-11-13T05:00:00Z')
          })
        })
      })
    })
  })

  async function testExternalElDrag(options, dragToDate, expectedDate, expectSuccess) { // with NO event creation
    options.droppable = true
    options.drop = (info) => {
      expect(info.date instanceof Date).toBe(true)
      expect(info.date).toEqualDate(expectedDate)
      expect(typeof info.jsEvent).toBe('object')
    }
    options.eventReceive = () => {}
    spyOn(options, 'drop').and.callThrough()
    spyOn(options, 'eventReceive').and.callThrough()

    await testEventDrag(options, dragToDate, expectSuccess, 'drag') // .drag className

    if (expectSuccess) {
      expect(options.drop).toHaveBeenCalled()
    } else {
      expect(options.drop).not.toHaveBeenCalled()
    }
    expect(options.eventReceive).not.toHaveBeenCalled()
  }

  async function testExternalEventDrag(options, dragToDate, expectedDate, expectSuccess) {
    let expectedAllDay = dragToDate.indexOf('T') === -1 // for the drop callback only!

    options.droppable = true
    options.drop = (info) => {
      expect(info.date instanceof Date).toBe(true)
      expect(info.date).toEqualDate(dragToDate)
      expect(info.allDay).toBe(expectedAllDay)
      expect(typeof info.jsEvent).toBe('object')
    }
    options.eventReceive = (info) => {
      expect(info.event.start).toEqualDate(expectedDate)
    }
    spyOn(options, 'drop').and.callThrough()
    spyOn(options, 'eventReceive').and.callThrough()

    let calendar = await testEventDrag(options, dragToDate, expectSuccess, 'drag') // .drag className

    if (expectSuccess) {
      expect(options.drop).toHaveBeenCalled()
      expect(options.eventReceive).toHaveBeenCalled()
    } else {
      expect(options.drop).not.toHaveBeenCalled()
      expect(options.eventReceive).not.toHaveBeenCalled()
    }

    return calendar
  }
})
