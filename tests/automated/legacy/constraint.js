import { testEventDrag, testEventResize, testSelection } from '../lib/dnd-resize-utils'

describe('event constraint', function() {

  pushOptions({
    defaultDate: '2014-11-10',
    defaultView: 'agendaWeek',
    scrollTime: '00:00'
  })
  describe('when used with a specific date range', function() {
    describe('when an event is being dragged', function() {
      describe('to the middle of the constraint range', function() {
        it('allows a drag', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-11-10T01:00:00',
            end: '2014-11-10T02:00:00',
            constraint: {
              start: '2014-11-10T03:00:00',
              end: '2014-11-10T06:00:00'
            }
          } ]
          testEventDrag(options, '2014-11-10T04:00:00', true, done)
        })

        describe('when in month view with timed event', function() {
          it('allows a drag, respects time of day', function(done) {
            var options = {}
            options.defaultView = 'month'
            options.events = [ {
              start: '2014-11-10T05:00:00',
              end: '2014-11-10T07:00:00',
              constraint: {
                start: '04:00',
                end: '20:00'
              }
            } ]
            testEventDrag(options, '2014-11-14', true, function() {
              var event = currentCalendar.clientEvents()[0]
              expect(event.start).toEqualMoment('2014-11-14T05:00:00')
              expect(event.end).toEqualMoment('2014-11-14T07:00:00')
              done()
            })
          })
        })
      })

      describe('to the start of the constraint range', function() {
        it('allows a drag', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-11-10T01:00:00',
            end: '2014-11-10T02:00:00',
            constraint: {
              start: '2014-11-10T03:00:00',
              end: '2014-11-10T06:00:00'
            }
          } ]
          testEventDrag(options, '2014-11-10T03:00:00', true, done)
        })
      })

      describe('to the end of the constraint range', function() {
        describe('when the event has an explicit end', function() {
          it('allows a drag', function(done) {
            var options = {}

            options.events = [ {
              start: '2014-11-10T01:00:00',
              end: '2014-11-10T02:00:00',
              constraint: {
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T06:00:00'
              }
            } ]
            testEventDrag(options, '2014-11-10T05:00:00', true, done)
          })
        })
        describe('when the event has an implied end', function() {
          it('allows a drag', function(done) {
            var options = {}

            options.defaultTimedEventDuration = '01:30:00'
            options.events = [ {
              start: '2014-11-10T01:00:00',
              constraint: {
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T06:00:00'
              }
            } ]
            testEventDrag(options, '2014-11-10T04:30:00', true, done)
          })
        })
      })

      describe('before a constraint range', function() {
        it('does not allow a drag', function(done) {
          var options = {}

          options.events = [ {
            start: '2014-11-10T01:00:00',
            end: '2014-11-10T02:00:00',
            constraint: {
              start: '2014-11-10T03:00:00',
              end: '2014-11-10T06:00:00'
            }
          } ]
          testEventDrag(options, '2014-11-10T02:00:00', false, done)
        })
      })

      describe('after a constraint range', function() {
        describe('using an event object\'s constraint', function() {
          describe('when in agendaWeek view with timed events', function() {
            it('does not allow a drag', function(done) {
              var options = {}

              options.events = [ {
                start: '2014-11-10T01:00:00',
                end: '2014-11-10T02:00:00',
                constraint: {
                  start: '2014-11-10T03:00:00',
                  end: '2014-11-10T06:00:00'
                }
              } ]
              testEventDrag(options, '2014-11-10T06:00:00', false, done)
            })
          })
          describe('when in month view', function() {
            pushOptions({defaultView: 'month'})
            describe('with timed event and all-day constraint', function() {
              it('does not allow a drag', function(done) {
                var options = {}

                options.events = [ {
                  start: '2014-11-10T01:00:00',
                  end: '2014-11-10T02:00:00',
                  constraint: {
                    start: '2014-11-10',
                    end: '2014-11-11'
                  }
                } ]
                testEventDrag(options, '2014-11-12', false, done)
              })
            })
            describe('with timed event and timed constraint', function() {
              it('does not allow a drag', function(done) {
                var options = {}

                options.events = [ {
                  start: '2014-11-10T01:00:00',
                  end: '2014-11-10T02:00:00',
                  constraint: {
                    start: '2014-11-10T00:00:00',
                    end: '2014-11-11T12:00:00'
                  }
                } ]
                testEventDrag(options, '2014-11-12', false, done)
              })
            })
            describe('with all-day event and all-day constraint', function() {
              it('does not allow a drag', function(done) {
                var options = {}

                options.events = [ {
                  start: '2014-11-10',
                  end: '2014-11-12',
                  constraint: {
                    start: '2014-11-09',
                    end: '2014-11-13'
                  }
                } ]
                testEventDrag(options, '2014-11-13', false, done)
              })
            })
            describe('with all-day event and timed constraint', function() {
              it('does not allow a drag', function(done) {
                var options = {}

                options.events = [ {
                  start: '2014-11-10',
                  end: '2014-11-12',
                  constraint: {
                    start: '2014-11-09T01:00:00',
                    end: '2014-11-12T23:00:00'
                  }
                } ]
                testEventDrag(options, '2014-11-13', false, done)
              })
            })
          })
        })
        describe('using an event source\'s constraint', function() {
          it('does not allow a drag', function(done) {
            var options = {}

            options.eventSources = [ {
              events: [ {
                start: '2014-11-10T01:00:00',
                end: '2014-11-10T02:00:00'
              } ],
              constraint: {
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T06:00:00'
              }
            } ]
            testEventDrag(options, '2014-11-10T06:00:00', false, done)
          })
        })
        describe('using eventConstraint', function() {
          it('does not allow a drag and doesnt call eventDataTransform', function(done) {
            var options = {}

            options.events = [ {
              start: '2014-11-10T01:00:00',
              end: '2014-11-10T02:00:00'
            } ]

            options.eventConstraint = {
              start: '2014-11-10T03:00:00',
              end: '2014-11-10T06:00:00'
            }

            options.eventDataTransform = function(inData) {
              return inData
            }

            spyOn(options, 'eventDataTransform').and.callThrough()

            testEventDrag(options, '2014-11-10T06:00:00', false, function() {
              expect(options.eventDataTransform.calls.count()).toBe(1) // only initial parse
              done()
            })
          })
        })
      })

      describe('intersecting the constraint start', function() {
        describe('with no timezone', function() {
          it('does not allow a drag', function(done) {
            var options = {}

            options.events = [ {
              start: '2014-11-10T03:00:00',
              end: '2014-11-10T05:00:00',
              constraint: {
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T06:00:00'
              }
            } ]
            testEventDrag(options, '2014-11-10T02:00:00', false, done)
          })
        })
        describe('with UTC timezone', function() {
          it('does not allow a drag', function(done) {
            var options = {}

            options.timezone = 'UTC'
            options.events = [ {
              start: '2014-11-10T03:00:00+00:00',
              end: '2014-11-10T05:00:00+00:00',
              constraint: {
                start: '2014-11-10T03:00:00+00:00',
                end: '2014-11-10T06:00:00+00:00'
              }
            } ]
            testEventDrag(options, '2014-11-10T02:00:00+00:00', false, done)
          })
        })
      })

      describe('intersecting the constraint end', function() {
        describe('when the event has an explicit end', function() {
          it('does not allow a drag', function(done) {
            var options = {}

            options.events = [ {
              start: '2014-11-10T03:00:00',
              end: '2014-11-10T05:00:00',
              constraint: {
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T06:00:00'
              }
            } ]
            testEventDrag(options, '2014-11-10T05:00:00', false, done)
          })
        })
        describe('when the event has an implied end', function() {
          it('does not allow a drag', function(done) {
            var options = {}

            options.defaultTimedEventDuration = '02:30'
            options.events = [ {
              start: '2014-11-10T03:00:00',
              constraint: {
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T12:00:00'
              }
            } ]
            testEventDrag(options, '2014-11-10T10:00:00', false, done)
          })
        })
        describe('with UTC timezone', function() {
          it('does not allow a drag', function(done) {
            var options = {}

            options.timezone = 'UTC'
            options.events = [ {
              start: '2014-11-10T03:00:00+00:00',
              end: '2014-11-10T05:00:00+00:00',
              constraint: {
                start: '2014-11-10T03:00:00+00:00',
                end: '2014-11-10T06:00:00+00:00'
              }
            } ]
            testEventDrag(options, '2014-11-10T05:00:00+00:00', false, done)
          })
        })
      })

      describe('into a constraint it encompasses', function() {
        it('does not allow a drag', function(done) {
          var options = {}

          options.events = [ {
            start: '2014-11-10T01:00:00',
            end: '2014-11-10T05:00:00',
            constraint: {
              start: '2014-11-10T12:00:00',
              end: '2014-11-10T14:00:00'
            }
          } ]
          testEventDrag(options, '2014-11-10T10:00:00', false, done)
        })
      })

    })

    describe('when an event is being resized', function() {

      describe('when the start is already outside the constraint', function() {
        it('does not allow a resize', function(done) {
          var options = {}

          options.events = [ {
            start: '2014-11-12T01:00:00',
            end: '2014-11-12T03:00:00',
            constraint: {
              start: '2014-11-12T02:00:00',
              end: '2014-11-12T22:00:00'
            }
          } ]
          testEventResize(options, '2014-11-12T10:00:00', false, done)
        })
      })

      describe('when resized well within the constraint', function() {
        it('allows a resize', function(done) {
          var options = {}

          options.events = [ {
            start: '2014-11-12T02:00:00',
            end: '2014-11-12T04:00:00',
            constraint: {
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T22:00:00'
            }
          } ]
          testEventResize(options, '2014-11-12T10:00:00', true, done)
        })
      })

      describe('when resized to the end of the constraint', function() {
        it('allows a resize', function(done) {
          var options = {}

          options.events = [ {
            start: '2014-11-12T02:00:00',
            end: '2014-11-12T04:00:00',
            constraint: {
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T06:00:00'
            }
          } ]
          testEventResize(options, '2014-11-12T06:00:00', true, done)
        })
      })

      describe('when resized past the end of the constraint', function() {
        it('does not allow a resize', function(done) {
          var options = {}

          options.events = [ {
            start: '2014-11-12T02:00:00',
            end: '2014-11-12T04:00:00',
            constraint: {
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T06:00:00'
            }
          } ]
          testEventResize(options, '2014-11-12T07:00:00', false, done)
        })
      })

    })
  })

  describe('when used with a recurring date range', function() {

    describe('when an event is being dragged', function() {

      describe('to the middle of the constraint range', function() {

        it('allows a drag', function(done) {
          var options = {}

          options.events = [ {
            start: '2014-11-12T01:00:00',
            end: '2014-11-12T03:00:00',
            constraint: {
              start: '04:00:00',
              end: '08:00:00'
            }
          } ]
          testEventDrag(options, '2014-11-12T05:00:00', true, done)
        })
      })

      describe('outside of a constraint range', function() {
        it('does not allow a drag', function(done) {
          var options = {}

          options.events = [ {
            start: '2014-11-12T01:00:00',
            end: '2014-11-12T03:00:00',
            constraint: {
              start: '04:00:00',
              end: '08:00:00'
            }
          } ]
          testEventDrag(options, '2014-11-12T07:00:00', false, done)
        })
      })

      describe('on an off-day of a constraint range', function() {
        it('does not allow a drag', function(done) {
          var options = {}

          options.events = [ {
            start: '2014-11-12T01:00:00',
            end: '2014-11-12T03:00:00',
            constraint: {
              start: '04:00:00',
              end: '08:00:00',
              dow: [ 0, 1, 2, 3, 5, 6 ] // except Thursday
            }
          } ]
          testEventDrag(options, '2014-11-13T05:00:00', false, done) // drag to Thursday
        })
      })
    })
  })

  describe('when used with businessHours', function() {

    describe('when an event is being dragged', function() {

      describe('to the middle of the constraint range', function() {

        it('allows a drag', function(done) {
          var options = {}

          options.businessHours = {
            start: '02:00',
            end: '06:00'
          }
          options.events = [ {
            start: '2014-11-12T01:00:00',
            end: '2014-11-12T02:00:00',
            constraint: 'businessHours'
          } ]
          testEventDrag(options, '2014-11-12T03:00:00', true, done)
        })
      })

      describe('outside of a constraint range', function() {
        it('does not allow a drag', function(done) {
          var options = {}

          options.businessHours = {
            start: '02:00',
            end: '06:00'
          }
          options.events = [ {
            start: '2014-11-12T01:00:00',
            end: '2014-11-12T02:30:00',
            constraint: 'businessHours'
          } ]
          testEventDrag(options, '2014-11-12T05:00:00', false, done)
        })
      })

      describe('on an off-day of a constraint range', function() {
        it('does not allow a drag', function(done) {
          var options = {}

          options.businessHours = {
            start: '02:00',
            end: '06:00',
            dow: [ 1, 2, 3, 4 ] // Mon - Thurs
          }
          options.events = [ {
            start: '2014-11-12T01:00:00',
            end: '2014-11-12T02:30:00',
            constraint: 'businessHours'
          } ]
          testEventDrag(options, '2014-11-14T03:00:00', false, done) // Friday
        })
      })
    })
  })

  describe('when used with an event ID', function() {

    describe('when an event is being dragged', function() {

      describe('to the middle of the constraint range', function() {
        it('allows a drag', function(done) {
          var options = {}

          options.events = [
            {
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T03:00:00',
              className: 'dragging-event',
              constraint: 'yo'
            },
            {
              id: 'yo',
              start: '2014-11-13T01:00:00',
              end: '2014-11-13T05:00:00'
            }
          ]
          testEventDrag(options, '2014-11-13T02:00:00', true, done, 'dragging-event')
        })
      })

      describe('outside of a foreground event constraint', function() {
        describe('with an explicit end time', function() {
          it('does not allow a drag', function(done) {
            var options = {}

            options.events = [
              {
                start: '2014-11-12T01:00:00',
                end: '2014-11-12T03:00:00',
                constraint: 'yo',
                className: 'dragging-event'
              },
              {
                id: 'yo',
                start: '2014-11-13T01:00:00',
                end: '2014-11-13T04:00:00'
              }
            ]
            testEventDrag(options, '2014-11-13T04:00:00', false, done, 'dragging-event')
          })
        })
        describe('when an implied end time', function() {
          it('does not allow a drag', function(done) {
            var options = {}

            options.defaultTimedEventDuration = '01:00:00'
            options.events = [
              {
                start: '2014-11-12T01:00:00',
                end: '2014-11-12T03:00:00',
                constraint: 'yo',
                className: 'dragging-event'
              },
              {
                id: 'yo',
                start: '2014-11-13T01:00:00'
              }
            ]
            testEventDrag(options, '2014-11-13T01:00:00', false, done, 'dragging-event')
          })
        })
      })

      describe('outside of a background-event constraint', function() {
        it('does not allow a drag', function(done) {
          var options = {}

          options.events = [
            {
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T03:00:00',
              constraint: 'yo',
              className: 'dragging-event'
            },
            {
              id: 'yo',
              start: '2014-11-13T01:00:00',
              end: '2014-11-13T04:00:00',
              rendering: 'background'
            }
          ]
          testEventDrag(options, '2014-11-13T04:00:00', false, done, 'dragging-event')
        })
      })

      describe('when the event ID constraint matches no events', function() {
        it('does not allow a drag', function(done) {
          var options = {}

          options.events = [
            {
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T03:00:00',
              constraint: 'yo'
            }
          ]
          testEventDrag(options, '2014-11-13T04:00:00', false, done)
        })
      })

      describe('when in month view', function() {
        pushOptions({defaultView: 'month'})
        describe('when the event ID constraint matches no events', function() {
          it('does not allow a drag', function(done) {
            var options = {}

            options.events = [
              {
                start: '2014-11-12',
                end: '2014-11-12',
                constraint: 'yo'
              }
            ]
            testEventDrag(options, '2014-11-13', false, done)
          })
        })
      })
    })
  })
})

describe('selectConstraint', function() {

  pushOptions({
    defaultDate: '2014-11-10',
    defaultView: 'agendaWeek',
    scrollTime: '00:00'
  })

  describe('when used with a specific date range', function() {

    describe('when dragged clearly within', function() {
      it('allows a selection', function(done) {
        var options = {}

        options.selectConstraint = {
          start: '2014-11-12T01:00:00',
          end: '2014-11-12T20:00:00'
        }
        testSelection(options, '03:00', '2014-11-12T10:00:00', true, done)
      })
    })

    describe('when dragged within, starting with the constraint start', function() {
      it('allows a selection', function(done) {
        var options = {}

        options.selectConstraint = {
          start: '2014-11-12T01:00:00',
          end: '2014-11-12T20:00:00'
        }
        testSelection(options, '01:00', '2014-11-12T05:00:00', true, done)
      })
    })

    describe('when dragged within, ending with the constraint end', function() {
      it('allows a selection', function(done) {
        var options = {}

        options.selectConstraint = {
          start: '2014-11-12T01:00:00',
          end: '2014-11-12T05:00:00'
        }
        testSelection(options, '03:00', '2014-11-12T05:00:00', true, done)
      })
    })

    describe('when dragged intersecting the constraint start', function() {
      it('does not allow a selection', function(done) {
        var options = {}

        options.selectConstraint = {
          start: '2014-11-12T03:00:00',
          end: '2014-11-12T20:00:00'
        }
        testSelection(options, '02:00', '2014-11-12T04:00:00', false, done)
      })
    })

    describe('when dragged intersecting the constraint end', function() {
      it('does not allow a selection', function(done) {
        var options = {}

        options.selectConstraint = {
          start: '2014-11-12T03:00:00',
          end: '2014-11-12T07:00:00'
        }
        testSelection(options, '04:00', '2014-11-12T08:00:00', false, done)
      })
    })

    describe('when dragged after the constraint', function() {
      describe('when in agendaWeek view with timed events', function() {
        it('does not allow a selection', function(done) {
          var options = {}

          options.selectConstraint = {
            start: '2014-11-12T03:00:00',
            end: '2014-11-12T05:00:00'
          }
          testSelection(options, '05:00', '2014-11-12T07:00:00', false, done)
        })
      })
      describe('when in month view', function() {
        pushOptions({defaultView: 'month'})
        describe('when an all-day constraint', function() {
          it('does not allow a selection', function(done) {
            var options = {}

            options.selectConstraint = {
              start: '2014-11-13',
              end: '2014-11-14'
            }
            testSelection(options, null, '2014-11-14', false, done)
          })
        })
        describe('when a timed constraint, out of bounds', function() {
          it('does not allow a selection', function(done) {
            var options = {}

            options.selectConstraint = {
              start: '2014-11-12T01:00:00',
              end: '2014-11-14T00:00:00'
            }
            testSelection(options, null, '2014-11-14', false, done)
          })
        })
        describe('when a timed constraint, in bounds', function() {
          it('allows a selection', function(done) {
            var options = {}

            options.selectConstraint = {
              start: '2014-11-12T00:00:00',
              end: '2014-11-14T00:00:00'
            }
            testSelection(options, null, '2014-11-14', true, done)
          })
        })
      })
    })
  })

  describe('when used with a recurring date range', function() {

    describe('to the middle of the constraint range', function() {
      it('allows a selection when in bounds', function(done) {
        var options = {}

        options.selectConstraint = {
          start: '01:00:00',
          end: '05:00:00'
        }
        testSelection(options, '02:00', '2014-11-12T04:00:00', true, done)
      })
    })

    describe('outside of a constraint range', function() {
      it('does not allow a selection when single day', function(done) {
        var options = {}

        options.selectConstraint = {
          start: '01:00:00',
          end: '05:00:00'
        }
        testSelection(options, '02:00', '2014-11-12T06:00:00', false, done)
      })
      it('does not allow a selection when multiday', function(done) {
        var options = {}

        options.selectConstraint = {
          start: '01:00:00',
          end: '05:00:00'
        }
        testSelection(options, '02:00', '2014-11-14T04:00:00', false, done)
      })
    })
  })

  describe('when used with businessHours', function() {

    describe('to the middle of the constraint range', function() {
      it('allows a selection', function(done) {
        var options = {}

        options.businessHours = {
          start: '01:00:00',
          end: '05:00:00'
        }
        options.selectConstraint = 'businessHours'
        testSelection(options, '02:00', '2014-11-12T04:00:00', true, done)
      })
    })

    describe('outside of a constraint range', function() {
      it('does not allow a selection', function(done) {
        var options = {}

        options.businessHours = {
          start: '01:00:00',
          end: '05:00:00'
        }
        options.selectConstraint = 'businessHours'
        testSelection(options, '02:00', '2014-11-12T06:00:00', false, done)
      })
    })

    describe('with a custom dow when dragged to a dead day', function() {
      it('does not allow a selection', function(done) {
        var options = {}

        options.businessHours = {
          start: '01:00:00',
          end: '05:00:00',
          dow: [ 1, 2, 4, 5 ] // Mon,Tue,Thu,Fri
        }
        options.selectConstraint = 'businessHours'
        testSelection(options, '02:00', '2014-11-12T04:00:00', false, done) // Wed
      })
    })
  })

  describe('when used with an event ID', function() {

    describe('to the middle of the constraint range', function() {
      it('allows a selection', function(done) {
        var options = {}

        options.events = [ {
          id: 'yo',
          start: '2014-11-12T02:00:00',
          end: '2014-11-12T05:00:00',
          rendering: 'background'
        } ]
        options.selectConstraint = 'yo'
        testSelection(options, '03:00', '2014-11-12T04:00:00', true, done)
      })
    })

    describe('outside of a constraint range', function() {
      it('does not allow a selection', function(done) {
        var options = {}

        options.events = [ {
          id: 'yo',
          start: '2014-11-12T02:00:00',
          end: '2014-11-12T05:00:00',
          rendering: 'background'
        } ]
        options.selectConstraint = 'yo'
        testSelection(options, '03:00', '2014-11-12T06:00:00', false, done)
      })
    })

    describe('when event ID does not match any events', function() {
      describe('when in agendaWeek view', function() {
        it('does not allow a selection', function(done) {
          var options = {}

          options.selectConstraint = 'yooo'
          testSelection(options, '03:00', '2014-11-12T06:00:00', false, done)
        })
      })
      describe('when in month view', function() {
        it('does not allow a selection', function(done) {
          var options = {}

          options.defaultView = 'month'
          options.selectConstraint = 'yooo'
          testSelection(options, null, '2014-11-15', false, done)
        })
      })
    })
  })
})
