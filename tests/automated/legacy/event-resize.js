import { createDuration } from '@fullcalendar/core'

describe('eventResize', function() {
  pushOptions({
    defaultDate: '2014-06-11',
    editable: true,
    longPressDelay: 100
  })

  describe('when in month view', function() {
    pushOptions({defaultView: 'dayGridMonth'})

    describe('when resizing an all-day event with mouse', function() {
      it('should have correct arguments with a whole-day delta', function(done) {
        var options = {}
        options.events = [ {
          title: 'all-day event',
          start: '2014-06-11',
          allDay: true
        } ]

        init(
          options,
          function() {
            $('.fc-event').simulate('mouseover') // for revealing resizer
            $('.fc-event .fc-resizer').simulate('drag', {
              dx: $('.fc-day').width() * -2.5, // guarantee 2 days to left
              dy: $('.fc-day').height()
            })
          },
          function(arg) {
            expect(arg.endDelta).toEqual(createDuration({ day: 5 }))

            expect(arg.event.start).toEqualDate('2014-06-11')
            expect(arg.event.end).toEqualDate('2014-06-17')

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11')
            expect(event.end).toBeNull()

            done()
          }
        )
      })
    })

    describe('when resizing an all-day event via touch', function() {

      // for https://github.com/fullcalendar/fullcalendar/issues/3118
      [ true, false ].forEach(function(eventStartEditable) {
        describe('when eventStartEditable is ' + eventStartEditable, function() {
          pushOptions({eventStartEditable: eventStartEditable})

          it('should have correct arguments with a whole-day delta', function(done) {
            var options = {}
            options.dragRevertDuration = 0 // so that eventDragStop happens immediately after touchend
            options.events = [ {
              title: 'all-day event',
              start: '2014-06-11',
              allDay: true
            } ]

            init(
              options,
              function() {
                $('.fc-event').simulate('drag', {
                  isTouch: true,
                  delay: 200,
                  onRelease: function() {
                    $('.fc-event .fc-resizer').simulate('drag', {
                      dx: $('.fc-day').width() * -2.5, // guarantee 2 days to left
                      dy: $('.fc-day').height(),
                      isTouch: true
                    })
                  }
                })
              },
              function(arg) {
                expect(arg.endDelta).toEqual(createDuration({ day: 5 }))

                expect(arg.event.start).toEqualDate('2014-06-11')
                expect(arg.event.end).toEqualDate('2014-06-17')

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

    describe('when rendering a timed event', function() {
      it('should not have resize capabilities', function(done) {
        var options = {}

        options.events = [ {
          title: 'timed event',
          start: '2014-06-11T08:00:00',
          allDay: false
        } ]

        options._eventsPositioned = function() {
          expect($('.fc-event .fc-resizer').length).toBe(0)
          done()
        }

        initCalendar(options)
      })
    })
  })

  describe('when in timeGrid view', function() {
    pushOptions({defaultView: 'timeGridWeek'})

    describe('when resizing an all-day event', function() {
      it('should have correct arguments with a whole-day delta', function(done) {
        var options = {}
        options.events = [ {
          title: 'all-day event',
          start: '2014-06-11',
          allDay: true
        } ]

        init(
          options,
          function() {
            $('.fc-event').simulate('mouseover') // for revealing resizer
            $('.fc-event .fc-resizer').simulate('drag', {
              dx: $('th.fc-wed').width() * 1.5 // two days
            })
          },
          function(arg) {
            expect(arg.endDelta).toEqual(createDuration({ day: 2 }))

            expect(arg.event.start).toEqualDate('2014-06-11')
            expect(arg.event.end).toEqualDate('2014-06-14')

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11')
            expect(event.end).toBeNull()

            done()
          }
        )
      })
    })

    describe('when resizing a timed event with an end', function() {
      pushOptions({
        events: [ {
          title: 'timed event event',
          start: '2014-06-11T05:00:00',
          end: '2014-06-11T07:00:00',
          allDay: false
        } ]
      })

      it('should have correct arguments with a timed delta', function(done) {
        var options = {}
        init(
          options,
          function() {
            $('.fc-event').simulate('mouseover') // for revealing resizer
            $('.fc-event .fc-resizer').simulate('drag', {
              dy: $('.fc-slats tr:eq(1)').height() * 4.5 // 5 slots, so 2.5 hours
            })
          },
          function(arg) {
            expect(arg.endDelta).toEqual(createDuration({ hour: 2, minute: 30 }))

            expect(arg.event.start).toEqualDate('2014-06-11T05:00:00Z')
            expect(arg.event.end).toEqualDate('2014-06-11T09:30:00Z')

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11T05:00:00Z')
            expect(event.end).toEqualDate('2014-06-11T07:00:00Z')

            done()
          }
        )
      })

      it('should have correct arguments with a timed delta via touch', function(done) {
        var options = {}
        options.dragRevertDuration = 0 // so that eventDragStop happens immediately after touchend
        init(
          options,
          function() {
            setTimeout(function() { // wait for scroll to init, so don't do a rescroll which kills drag
              $('.fc-event').simulate('drag', {
                isTouch: true,
                localPoint: { left: '50%', top: '90%' },
                delay: 200,
                onRelease: function() {
                  setTimeout(function() {
                    $('.fc-event .fc-resizer').simulate('drag', {
                      dy: $('.fc-slats tr:eq(1)').height() * 4.5, // 5 slots, so 2.5 hours
                      isTouch: true
                    })
                  }, 100) // delay for FF
                }
              })
            }, 100) // delay for FF
          },
          function(arg) {
            expect(arg.endDelta).toEqual(createDuration({ hour: 2, minute: 30 }))

            expect(arg.event.start).toEqualDate('2014-06-11T05:00:00Z')
            expect(arg.event.end).toEqualDate('2014-06-11T09:30:00Z')

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11T05:00:00Z')
            expect(event.end).toEqualDate('2014-06-11T07:00:00Z')

            done()
          }
        )
      })

      // TODO: test RTL
      it('should have correct arguments with a timed delta when resized to a different day', function(done) {
        var options = {}
        init(
          options,
          function() {
            $('.fc-event').simulate('mouseover') // for revealing resizer
            $('.fc-event .fc-resizer').simulate('drag', {
              dx: $('.fc-day-header:first').width() * 0.9, // one day
              dy: $('.fc-slats tr:eq(1)').height() * 4.5 // 5 slots, so 2.5 hours
            })
          },
          function(arg) {
            expect(arg.endDelta).toEqual(createDuration({ day: 1, hour: 2, minute: 30 }))

            expect(arg.event.start).toEqualDate('2014-06-11T05:00:00Z')
            expect(arg.event.end).toEqualDate('2014-06-12T09:30:00Z')

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11T05:00:00Z')
            expect(event.end).toEqualDate('2014-06-11T07:00:00Z')

            done()
          }
        )
      })

      it('should have correct arguments with a timed delta, when timezone is local', function(done) {
        var options = {}
        options.timeZone = 'local'
        init(
          options,
          function() {
            $('.fc-event').simulate('mouseover') // for revealing resizer
            $('.fc-event .fc-resizer').simulate('drag', {
              dy: $('.fc-slats tr:eq(1)').height() * 4.5 // 5 slots, so 2.5 hours
            })
          },
          function(arg) {
            expect(arg.endDelta).toEqual(createDuration({ hour: 2, minute: 30 }))

            expect(arg.event.start).toEqualLocalDate('2014-06-11T05:00:00')
            expect(arg.event.end).toEqualLocalDate('2014-06-11T09:30:00')

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualLocalDate('2014-06-11T05:00:00')
            expect(event.end).toEqualLocalDate('2014-06-11T07:00:00')

            done()
          }
        )
      })

      it('should have correct arguments with a timed delta, when timezone is UTC', function(done) {
        var options = {}
        options.timeZone = 'UTC'
        init(
          options,
          function() {
            $('.fc-event').simulate('mouseover') // for revealing resizer
            $('.fc-event .fc-resizer').simulate('drag', {
              dy: $('.fc-slats tr:eq(1)').height() * 4.5 // 5 slots, so 2.5 hours
            })
          },
          function(arg) {
            expect(arg.endDelta).toEqual(createDuration({ hour: 2, minute: 30 }))

            expect(arg.event.start).toEqualDate('2014-06-11T05:00:00+00:00')
            expect(arg.event.end).toEqualDate('2014-06-11T09:30:00+00:00')

            arg.revert()
            var event = currentCalendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11T05:00:00+00:00')
            expect(event.end).toEqualDate('2014-06-11T07:00:00+00:00')

            done()
          }
        )
      })

      it('should display the correct time text while resizing', function(done) {
        var renderCnt = 0
        var options = {}

        options._eventsPositioned = function() {
          renderCnt++

          if (renderCnt === 1) {
            setTimeout(function() {
              var dy = $('.fc-slats tr:eq(1)').height() * 5 // 5 slots, so 2.5 hours
              $('.fc-event').simulate('mouseover') // for revealing resizer
              $('.fc-event .fc-resizer').simulate('drag', {
                dy: dy,
                onBeforeRelease: function() {
                  expect($('.fc-event.fc-mirror .fc-time')).toHaveText('5:00 - 9:30')

                  // drag it back
                  $('.fc-event.fc-mirror').simulate('drag', {
                    dy: -dy,
                    onBeforeRelease: function() {
                      expect($('.fc-event.fc-mirror')).not.toExist()
                      expect($('.fc-event')).toBeVisible()
                      expect($('.fc-event .fc-time')).toHaveText('5:00 - 7:00')
                    },
                    onRelease: function() {
                      done()
                    }
                  })
                }
              })
            }, 0) // idk
          }
        }

        initCalendar(options)
      })

      it('should run the temporarily rendered event through eventRender', function(done) {
        var renderCnt = 0

        initCalendar({
          eventRender(arg) {
            $(arg.el).addClass('eventDidRender')
          },
          eventPositioned(arg) {
            $(arg.el).addClass('eventDidPosition')
          },
          _eventsPositioned() {
            renderCnt++

            if (renderCnt === 1) {
              setTimeout(function() {
                var dy = $('.fc-slats tr:eq(1)').height() * 5 // 5 slots, so 2.5 hours
                $('.fc-event').simulate('mouseover') // for revealing resizer
                $('.fc-event .fc-resizer').simulate('drag', {
                  dy: dy,
                  onBeforeRelease: function() {
                    expect($('.fc-event.fc-mirror')).toHaveClass('eventDidRender')
                    expect($('.fc-event.fc-mirror')).toHaveClass('eventDidPosition')

                    // drag it back
                    $('.fc-event.fc-mirror').simulate('drag', {
                      dy: -dy,
                      onBeforeRelease: function() {
                        expect($('.fc-event.fc-mirror')).not.toExist()
                      },
                      onRelease: function() {
                        done()
                      }
                    })
                  }
                })
              }, 0) // idk
            }
          }
        })
      })

      it('should not fire the windowResize handler', function(done) { // bug 1116
        var alreadyRendered = false

        // has to do this crap because PhantomJS was trigger false window resizes unrelated to the fc-event resize
        var isDragging = false
        var calledWhileDragging = false
        var options = {}
        options.windowResizeDelay = 0
        options.windowResize = function(ev) {
          if (isDragging) {
            calledWhileDragging = true
          }
        }

        options._eventsPositioned = function() {
          if (alreadyRendered) {
            return
          }
          alreadyRendered = true
          setTimeout(function() {
            isDragging = true
            $('.fc-event').simulate('mouseover') // for revealing resizer
            $('.fc-event .fc-resizer').simulate('drag', {
              dy: 100,
              onBeforeRelease: function() {
                isDragging = false
              },
              onRelease: function() {
                expect(calledWhileDragging).toBe(false)
                done()
              }
            })
          }, 100) // hack for PhantomJS. after any initial false window resizes
        }

        initCalendar(options)
      })
    })

    describe('when resizing a timed event without an end', function() {
      pushOptions({
        defaultTimedEventDuration: '02:00',
        events: [ {
          title: 'timed event event',
          start: '2014-06-11T05:00:00',
          allDay: false
        } ]
      })

      it('should display the correct time text while resizing', function(done) {
        var renderCnt = 0
        var options = {}

        options._eventsPositioned = function() {
          renderCnt++

          if (renderCnt === 1) {
            setTimeout(function() {
              var dy = $('.fc-slats tr:eq(1)').height() * 5 // 5 slots, so 2.5 hours
              $('.fc-event').simulate('mouseover') // for revealing resizer
              $('.fc-event .fc-resizer').simulate('drag', {
                dy: dy,
                onBeforeRelease: function() {
                  expect($('.fc-event.fc-mirror .fc-time')).toHaveText('5:00 - 9:30')

                  // drag it back
                  $('.fc-event.fc-mirror').simulate('drag', {
                    dy: -dy,
                    onBeforeRelease: function() {
                      expect($('.fc-event.fc-mirror')).not.toExist()
                      expect($('.fc-event')).toBeVisible()
                      expect($('.fc-event .fc-time')).toHaveText('5:00')
                    },
                    onRelease: function() {
                      done()
                    }
                  })
                }
              })
            }, 0) // idk
          }
        }

        initCalendar(options)
      })
    })
  })

  // Initialize a calendar, run a resize, and do type-checking of all arguments for all handlers.
  // TODO: more descrimination instead of just checking for 'object'
  function init(options, resizeStartFunc, resizeDoneFunc) {
    var eventsRendered = false

    options._eventsPositioned = function() {
      if (!eventsRendered) { // because event rerendering will happen when resize is over
        resizeStartFunc()
        eventsRendered = true
      }
    }
    options.eventResizeStart = function(arg) {
      expect(arg.el instanceof Element).toBe(true)
      expect(arg.el).toHaveClass('fc-event')
      expect(typeof arg.event).toBe('object')
      expect(typeof arg.jsEvent).toBe('object')
      expect(typeof arg.view).toBe('object')
    }
    options.eventResizeStop = function(arg) {
      expect(options.eventResizeStart).toHaveBeenCalled()

      expect(arg.el instanceof Element).toBe(true)
      expect(arg.el).toHaveClass('fc-event')
      expect(typeof arg.event).toBe('object')
      expect(typeof arg.jsEvent).toBe('object')
      expect(typeof arg.view).toBe('object')
    }
    options.eventResize = function(arg) {
      expect(options.eventResizeStop).toHaveBeenCalled()

      expect(arg.el instanceof Element).toBe(true)
      expect(arg.el).toHaveClass('fc-event')
      expect(typeof arg.event).toBe('object')
      expect(typeof arg.startDelta).toBe('object')
      expect(typeof arg.endDelta).toBe('object')
      expect(typeof arg.revert).toBe('function')
      expect(typeof arg.jsEvent).toBe('object')
      expect(typeof arg.view).toBe('object')

      resizeDoneFunc.apply(this, arguments)
    }

    spyOn(options, 'eventResizeStart').and.callThrough()
    spyOn(options, 'eventResizeStop').and.callThrough()

    setTimeout(function() { // hack. timeGrid view scroll state would get messed up between tests
      initCalendar(options)
    }, 0)
  }
})
