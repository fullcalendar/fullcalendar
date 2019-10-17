import { createDuration } from '@fullcalendar/core'

describe('eventDrop', function() {
  var options

  beforeEach(function() {
    options = {
      timeZone: 'UTC',
      defaultDate: '2014-06-11',
      editable: true,
      dragScroll: false,
      longPressDelay: 100
    }
  })

  afterEach(function() {
    currentCalendar.destroy()
  })

  describe('when in month view', function() {
    beforeEach(function() {
      options.defaultView = 'dayGridMonth'
    });

    // TODO: test that event's dragged via touch that don't wait long enough for longPressDelay
    // SHOULD NOT drag

    [ false, true ].forEach(function(isTouch) {
      describe('with ' + (isTouch ? 'touch' : 'mouse'), function() {
        describe('when dragging an all-day event to another day', function() {
          it('should be given correct arguments, with whole-day delta', function(done) {

            options.events = [ {
              title: 'all-day event',
              start: '2014-06-11',
              allDay: true
            } ]

            init(
              function() {
                setTimeout(function() {
                  $('.fc-event').simulate('drag', {
                    dx: $('.fc-day').width() * 2,
                    dy: $('.fc-day').height(),
                    isTouch: isTouch,
                    delay: isTouch ? 200 : 0
                  })
                }, 0)
              },
              function(arg) {
                var delta = createDuration({ day: 9 })
                expect(arg.delta).toEqual(delta)

                expect(arg.event.start).toEqualDate('2014-06-20')
                expect(arg.event.end).toBeNull()

                arg.revert()
                var event = currentCalendar.getEvents()[0]

                expect(event.start).toEqualDate('2014-06-11')
                expect(event.end).toBeNull()

                done()
              }
            )
          })
        })
      })
    })

    describe('when gragging a timed event to another day', function() {
      it('should be given correct arguments, with whole-day delta', function(done) {
        options.events = [ {
          title: 'timed event',
          start: '2014-06-11T06:00:00',
          allDay: false
        } ]

        init(
          function() {
            $('.fc-event').simulate('drag', {
              dx: $('.fc-day').width() * -2,
              dy: $('.fc-day').height()
            })
          },
          function(arg) {
            var delta = createDuration({ day: 5 })
            expect(arg.delta).toEqual(delta)

            expect(arg.event.start).toEqualDate('2014-06-16T06:00:00Z')
            expect(arg.event.end).toBeNull()

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11T06:00:00Z')
            expect(event.end).toBeNull()

            done()
          }
        )
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4458
    describe('when dragging an event back in time when duration not editable', function() {
      it('should work', function(done) {
        options.defaultDate = '2019-01-16'
        options.eventDurationEditable = false
        options.events = [ {
          title: 'event',
          start: '2019-01-16T10:30:00+00:00',
          end: '2019-01-16T12:30:00+00:00'
        } ]

        init(
          function() {
            $('.fc-event').simulate('drag', {
              dx: $('.fc-day').width() * -2 // back two day
            })
          },
          function(arg) {
            expect(arg.delta).toEqual(createDuration({ day: -2 }))
            expect(arg.event.start).toEqualDate('2019-01-14T10:30:00+00:00')
            expect(arg.event.end).toEqualDate('2019-01-14T12:30:00+00:00')
            done()
          }
        )
      })
    })

    // TODO: tests for eventMouseEnter/eventMouseLeave firing correctly when no dragging
    it('should not fire any eventMouseEnter/eventMouseLeave events while dragging', function(done) { // issue 1297
      options.events = [
        {
          title: 'all-day event',
          start: '2014-06-11',
          allDay: true,
          className: 'event1'
        },
        {
          title: 'event2',
          start: '2014-06-10',
          allDay: true,
          className: 'event2'
        }
      ]
      options.eventMouseEnter = function() { }
      options.eventMouseLeave = function() { }
      spyOn(options, 'eventMouseEnter')
      spyOn(options, 'eventMouseLeave')

      init(
        function() {
          $('.event1').simulate('drag', {
            dx: $('.fc-day').width() * 2,
            dy: $('.fc-day').height(),
            moves: 10,
            duration: 1000
          })
          setTimeout(function() { // wait until half way through drag
            $('.event2')
              .simulate('mouseover')
              .simulate('mouseenter')
              .simulate('mouseout')
              .simulate('mouseleave')
          }, 500)
        },
        function(arg) {
          expect(options.eventMouseEnter).not.toHaveBeenCalled()
          expect(options.eventMouseLeave).not.toHaveBeenCalled()
          done()
        }
      )
    })
  })

  describe('when in timeGrid view', function() {
    beforeEach(function() {
      options.defaultView = 'timeGridWeek'
    });

    [ false, true ].forEach(function(isTouch) {
      describe('with ' + (isTouch ? 'touch' : 'mouse'), function() {
        describe('when dragging a timed event to another time on a different day', function() {
          it('should be given correct arguments and delta with days/time', function(done) {
            options.events = [ {
              title: 'timed event',
              start: '2014-06-11T06:00:00',
              allDay: false
            } ]

            init(
              function() {
                // setTimeout waits for full render, so there's no scroll,
                // because scroll kills touch drag
                setTimeout(function() {
                  $('.fc-event .fc-time').simulate('drag', {
                    dx: $('th.fc-wed').width(), // 1 day
                    dy: $('.fc-slats tr:eq(1)').outerHeight() * 2.9, // 1.5 hours
                    isTouch: isTouch,
                    delay: isTouch ? 200 : 0 // delay for FF
                  })
                }, 100) // delay for FF
              },
              function(arg) {
                var delta = createDuration({ day: 1, hour: 1, minute: 30 })
                expect(arg.delta).toEqual(delta)

                expect(arg.event.start).toEqualDate('2014-06-12T07:30:00Z')
                expect(arg.event.end).toBeNull()

                arg.revert()
                var event = currentCalendar.getEvents()[0]

                expect(event.start).toEqualDate('2014-06-11T06:00:00Z')
                expect(event.end).toBeNull()

                done()
              }
            )
          })
        })
      })
    })

    describe('when dragging an all-day event to another all-day', function() {
      it('should be given correct arguments, with whole-day delta', function(done) {
        options.events = [ {
          title: 'all-day event',
          start: '2014-06-11',
          allDay: true
        } ]

        init(
          function() {
            $('.fc-event').simulate('drag', {
              dx: $('th.fc-wed').width() * 2 // 2 days
            })
          },
          function(arg) {
            var delta = createDuration({ day: 2 })
            expect(arg.delta).toEqual(delta)

            expect(arg.event.start).toEqualDate('2014-06-13')
            expect(arg.event.end).toBeNull()

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11')
            expect(event.end).toBeNull()

            done()
          }
        )
      })
    })

    describe('when dragging an all-day event to a time slot on a different day', function() {
      it('should be given correct arguments and delta with days/time', function(done) {
        options.scrollTime = '01:00:00'
        options.height = 400 // short enough to make scrolling happen
        options.events = [ {
          title: 'all-day event',
          start: '2014-06-11',
          allDay: true
        } ]

        init(
          function() {
            var allDayGrid = $('.fc-timeGrid-view .fc-day-grid')
            var hr = allDayGrid.next('hr')
            $('.fc-event').simulate('drag', {
              dx: $('th.fc-wed').width() * -1,
              dy: allDayGrid.outerHeight() + hr.outerHeight()
            })
          },
          function(arg) {
            let delta = createDuration({ day: -1, hour: 1 })
            expect(arg.delta).toEqual(delta)

            expect(arg.event.start).toEqualDate('2014-06-10T01:00:00Z')
            expect(arg.event.end).toBeNull()
            expect(arg.event.allDay).toBe(false)

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11')
            expect(event.end).toBeNull()
            expect(event.allDay).toBe(true)

            done()
          }
        )
      })
    })

    describe('when dragging a timed event to an all-day slot on a different day', function() {
      it('should be given correct arguments, with whole-day delta', function(done) {
        var eventElm

        options.scrollTime = '01:00:00'
        options.height = 400 // short enough to make scrolling happen
        options.events = [ {
          title: 'timed event',
          start: '2014-06-11T01:00:00',
          allDay: false
        } ]

        init(
          function() {
            eventElm = $('.fc-event .fc-time').simulate('drag', { // grabs the top of the event
              dx: $('th.fc-wed').width() * -1,
              dy: -$('.fc-timeGrid-view .fc-day-grid').outerHeight(),
              onBeforeRelease: function() {
                // the all day slot works off of mouse-moving coordinates
                var offset = eventElm.offset()
                $('.fc-timeGrid-allday .fc-day-content')
                  .simulate('mouseover', {
                    clientX: offset.left + 10,
                    clientY: offset.top + 10
                  })
                  .simulate('mousemove', {
                    clientX: offset.left + 10,
                    clientY: offset.top + 10
                  })
              }
            })
          },
          function(arg) {
            var delta = createDuration({ day: -1 })
            expect(arg.delta).toEqual(delta)

            expect(arg.event.start).toEqualDate('2014-06-10')
            expect(arg.event.end).toBeNull()
            expect(arg.event.allDay).toBe(true)

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11T01:00:00Z')
            expect(event.end).toBeNull()
            expect(event.allDay).toBe(false)

            done()
          }
        )
      })
    })

    describe('when dragging a timed event with no end time', function() {
      it('should continue to only show the updated start time', function(done) {
        var dragged = false

        options.scrollTime = '01:00:00'
        options.height = 400 // short enough to make scrolling happen
        options.events = [ {
          title: 'timed event',
          start: '2014-06-11T01:00:00',
          allDay: false
        } ]

        init(
          function() {
            $('.fc-event .fc-time').simulate('drag', {
              dy: $('.fc-slats tr:eq(1)').height() * 2.9, // 1.5 hours
              onBeforeRelease: function() {
                dragged = true
                expect($('.fc-event.fc-mirror .fc-time')).toHaveText('2:30')
              }
            })
          },
          function() {
            expect(dragged).toBe(true)
            done()
          }
        )
      })
    })

    describe('when dragging a timed event with an end time', function() {
      it('should continue to show the updated start and end time', function(done) {
        var dragged = false

        options.scrollTime = '01:00:00'
        options.height = 400 // short enough to make scrolling happen
        options.events = [ {
          title: 'timed event',
          start: '2014-06-11T01:00:00',
          end: '2014-06-11T02:00:00',
          allDay: false
        } ]

        init(
          function() {
            $('.fc-event .fc-time').simulate('drag', {
              dy: $('.fc-slats tr:eq(1)').height() * 2.9, // 1.5 hours
              onBeforeRelease: function() {
                dragged = true
                expect($('.fc-event.fc-mirror .fc-time')).toHaveText('2:30 - 3:30')
              }
            })
          },
          function() {
            expect(dragged).toBe(true)
            done()
          }
        )
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4503
    describe('when dragging to one of the last slots', function() {
      it('should work', function(done) {
        options.scrollTime = '23:00:00'
        options.height = 400 // short enough to make scrolling happen
        options.events = [ {
          title: 'timed event',
          start: '2014-06-11T18:00:00', // should be in view without scrolling
          allDay: false
        } ]

        init(
          function() {
            $('.fc-event .fc-time').simulate('drag', {
              end: $('.fc-slats tr:eq(47)')
            })
          },
          function() {
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11T23:30:00Z')
            expect(event.end).toBeNull()
            expect(event.allDay).toBe(false)

            done()
          }
        )
      })
    })
  })

  // Initialize a calendar, run a drag, and do type-checking of all arguments for all handlers.
  // TODO: more descrimination instead of just checking for 'object'
  function init(dragFunc, dropHandler) {
    var eventsRendered = false

    options._eventsPositioned = function() {
      if (!eventsRendered) { // because event rerendering will happen upon drop
        dragFunc()
        eventsRendered = true
      }
    }
    options.eventDragStart = function(arg) {
      expect(arg.el instanceof Element).toBe(true)
      expect(arg.el).toHaveClass('fc-event')
      expect(typeof arg.event).toBe('object')
      expect(typeof arg.jsEvent).toBe('object')
      expect(typeof arg.view).toBe('object')
    }
    options.eventDragStop = function(arg) {
      expect(options.eventDragStart).toHaveBeenCalled()

      expect(arg.el instanceof Element).toBe(true)
      expect(arg.el).toHaveClass('fc-event')
      expect(typeof arg.event).toBe('object')
      expect(typeof arg.jsEvent).toBe('object')
      expect(typeof arg.view).toBe('object')
    }
    options.eventDrop = function(arg) {
      expect(options.eventDragStop).toHaveBeenCalled()

      expect(arg.el instanceof Element).toBe(true)
      expect(arg.el).toHaveClass('fc-event')
      expect(typeof arg.delta).toBe('object')
      expect(typeof arg.revert).toBe('function')
      expect(typeof arg.jsEvent).toBe('object')
      expect(typeof arg.view).toBe('object')

      dropHandler.apply(this, arguments)
    }

    spyOn(options, 'eventDragStart').and.callThrough()
    spyOn(options, 'eventDragStop').and.callThrough()

    setTimeout(function() { // hack. timeGrid view scroll state would get messed up between tests
      initCalendar(options)
    }, 0)
  }
})
