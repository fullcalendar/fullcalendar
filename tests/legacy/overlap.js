import { testEventDrag, testEventResize, testSelection } from '../lib/dnd-resize-utils'

describe('event overlap', function() {
  var options

  beforeEach(function() {
    options = {
      defaultDate: '2014-11-04',
      defaultView: 'agendaWeek',
      scrollTime: '00:00'
    }
    affix('#cal')
    $('#cal').width(1100)
  })

  describe('when other event overlap is false', function() {

    describe('when dragged adjacently before the other event', function() {
      describe('when subject event\'s end is explicit', function() {
        it('allows dragging', function(done) {
          options.events = [
            {
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T03:00:00'
            },
            {
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00',
              overlap: false
            }
          ]
          testEventDrag(options, '2014-11-04T03:00:00', true, done, 'event-a')
        })
      })
      describe('when subject event\'s end is implied', function() {
        it('allows dragging', function(done) {
          options.defaultTimedEventDuration = '01:30'
          options.events = [
            {
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00'
            },
            {
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00',
              overlap: false
            }
          ]
          testEventDrag(options, '2014-11-04T03:30:00', true, done, 'event-a')
        })
      })
    })

    describe('when dragged adjacently after the other event', function() {
      it('allows dragging', function(done) {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00'
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
            overlap: false
          }
        ]
        testEventDrag(options, '2014-11-04T09:00:00', true, done, 'event-a')
      })
    })

    describe('when dragged intersecting the other event\'s start', function() {
      describe('when no timezone', function() {
        describe('when subject event\'s end is explicit', function() {
          it('does not allow dragging', function(done) {
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00'
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00',
                overlap: false
              }
            ]
            testEventDrag(options, '2014-11-04T04:00:00', false, done, 'event-a')
          })
        })
        describe('when subject event\'s end is implied', function() {
          it('does not allow dragging', function(done) {
            options.defaultTimedEventDuration = '03:00'
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00'
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00',
                overlap: false
              }
            ]
            testEventDrag(options, '2014-11-04T03:00:00', false, done, 'event-a')
          })
        })
      })
      describe('when UTC timezone', function() {
        it('does not allow dragging', function(done) {
          options.timezone = 'UTC'
          options.events = [
            {
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00+00:00',
              end: '2014-11-04T03:00:00+00:00'
            },
            {
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00+00:00',
              end: '2014-11-04T09:00:00+00:00',
              overlap: false
            }
          ]
          testEventDrag(options, '2014-11-04T04:00:00+00:00', false, done, 'event-a')
        })
      })
    })

    describe('when dragged intersecting the other event\'s end', function() {
      describe('when in agendaWeek view with timed events', function() {
        describe('when no timezone', function() {
          it('does not allow dragging', function(done) {
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00'
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00',
                overlap: false
              }
            ]
            testEventDrag(options, '2014-11-04T08:00:00', false, done, 'event-a')
          })
        })
        describe('when UTC timezone', function() {
          it('does not allow dragging', function(done) {
            options.timezone = 'UTC'
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00+00:00',
                end: '2014-11-04T03:00:00+00:00'
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00+00:00',
                end: '2014-11-04T09:00:00+00:00',
                overlap: false
              }
            ]
            testEventDrag(options, '2014-11-04T08:00:00+00:00', false, done, 'event-a')
          })
        })
      })
      describe('when in month view', function() {
        beforeEach(function() {
          options.defaultView = 'month'
        })
        describe('with all-day subject and all-day other', function() {
          it('does not allow dragging', function(done) {
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04',
                end: '2014-11-05'
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-07',
                end: '2014-11-09',
                overlap: false
              }
            ]
            testEventDrag(options, '2014-11-08', false, done, 'event-a')
          })
        })
        describe('with all-day subject and timed other', function() {
          it('does not allow dragging', function(done) {
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04',
                end: '2014-11-05'
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-07T05:00:00',
                end: '2014-11-09T12:00:00',
                overlap: false
              }
            ]
            testEventDrag(options, '2014-11-08', false, done, 'event-a')
          })
        })
        describe('with timed subject and all-day other', function() {
          it('does not allow dragging', function(done) {
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04'
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-07T05:00:00',
                overlap: false
              }
            ]
            testEventDrag(options, '2014-11-04', false, done, 'event-b')
          })
        })
      })
    })

    describe('when dragged to be encompassed by the other event', function() {
      it('does not allow dragging', function(done) {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00'
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
            overlap: false
          }
        ]
        testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
      })
      describe('when both events have the same ID', function() {
        it('allows the drag', function(done) {
          options.events = [
            {
              id: 'myid',
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T03:00:00'
            },
            {
              id: 'myid',
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00',
              overlap: false
            }
          ]
          testEventDrag(options, '2014-11-04T06:00:00', true, done, 'event-a')
        })
      })
    })

    describe('when resized to be adjacently before the other event', function() {
      it('allows resizing', function(done) {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00'
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
            overlap: false
          }
        ]
        testEventResize(options, '2014-11-04T05:00:00', true, done, 'event-a')
      })
    })

    describe('when resized to intersect the other event\'s start', function() {
      it('does not allow resizing', function(done) {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00'
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
            overlap: false
          }
        ]
        testEventResize(options, '2014-11-04T06:00:00', false, done, 'event-a')
      })
    })
  })

  describe('when both events\' overlap is true AND they intersect', function() {
    it('allows dragging', function(done) {
      options.events = [
        {
          title: 'Event A',
          className: 'event-a',
          start: '2014-11-04T01:00:00',
          end: '2014-11-04T03:00:00',
          overlap: true
        },
        {
          title: 'Event B',
          className: 'event-b',
          start: '2014-11-04T05:00:00',
          end: '2014-11-04T09:00:00',
          overlap: true
        }
      ]
      testEventDrag(options, '2014-11-04T04:00:00', true, done, 'event-a')
    })
  })

  describe('when other eventSource overlap is false', function() {
    describe('when dragged over the other event', function() {
      it('does not allow dragging', function(done) {
        options.eventSources = [
          {
            events: [ {
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T03:00:00'
            } ]
          },
          {
            overlap: false,
            events: [ {
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00'
            } ]
          }
        ]
        testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
      })
    })
  })

  describe('when other eventSource overlap is a function', function() {
    describe('when dragged over an intersecting event', function() {
      describe('and function returns false', function() {
        it('does not allow dragging', function(done) {
          options.eventSources = [
            {
              events: [ {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00'
              } ]
            },
            {
              overlap: function(stillEvent, draggingEvent) {
                // checks that the arguments are correct
                expect(stillEvent.title).toBe('Event B')
                expect(draggingEvent.title).toBe('Event A')
                return false
              },
              events: [ {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00'
              } ]
            }
          ]
          testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
        })
      })
      describe('and function returns true', function() {
        it('allows dragging', function(done) {
          options.eventSources = [
            {
              events: [ {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00'
              } ]
            },
            {
              overlap: function() {
                return true
              },
              events: [ {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00'
              } ]
            }
          ]
          testEventDrag(options, '2014-11-04T06:00:00', true, done, 'event-a')
        })
      })
    })
  })

  describe('when subject event is false', function() {
    describe('when dragged adjacently after the other event', function() {
      it('allows dragging', function(done) {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
            overlap: false
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00'
          }
        ]
        testEventDrag(options, '2014-11-04T09:00:00', true, done, 'event-a')
      })
    })
    describe('when dragged intersecting the other event\'s end', function() {
      it('does not allow dragging', function(done) {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
            overlap: false
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00'
          }
        ]
        testEventDrag(options, '2014-11-04T04:00:00', false, done, 'event-a')
      })
    })
  })

  describe('when subject eventSource is false', function() {
    describe('when dragged after the other event', function() {
      it('allows dragging', function(done) {
        options.eventSources = [
          {
            overlap: false,
            events: [ {
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T03:00:00'
            } ]
          },
          {
            events: [ {
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00'
            } ]
          }
        ]
        testEventDrag(options, '2014-11-04T09:00:00', true, done, 'event-a')
      })
    })
    describe('when dragged over the other event', function() {
      it('does not allow dragging', function(done) {
        options.eventSources = [
          {
            overlap: false,
            events: [ {
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T03:00:00'
            } ]
          },
          {
            events: [ {
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00'
            } ]
          }
        ]
        testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
      })
    })
  })

  describe('when subject eventSource is a function', function() {
    describe('when dragged over an intersecting event', function() {
      describe('and function returns false', function() {
        it('does not allow dragging', function(done) {
          options.eventSources = [
            {
              overlap: function(stillEvent, draggingEvent) {
                // checking parameters here
                expect(stillEvent.title).toBe('Event B')
                expect(draggingEvent.title).toBe('Event A')
                return false
              },
              events: [ {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00'
              } ]
            },
            {
              events: [ {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00'
              } ]
            }
          ]
          testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
        })
      })
      describe('and function returns true', function() {
        it('allows dragging', function(done) {
          options.eventSources = [
            {
              overlap: function(otherEvent, thisEvent) {
                return true
              },
              events: [ {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00'
              } ]
            },
            {
              events: [ {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00'
              } ]
            }
          ]
          testEventDrag(options, '2014-11-04T06:00:00', true, done, 'event-a')
        })
      })
    })
    describe('when other eventSource is ALSO a function', function() {
      describe('and only the subject\'s function returns false', function() {
        it('disallows dragging', function(done) {
          options.eventSources = [
            {
              overlap: function(otherEvent, thisEvent) {
                return false
              },
              events: [ {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00'
              } ]
            },
            {
              overlap: function(otherEvent, thisEvent) {
                return true
              },
              events: [ {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00'
              } ]
            }
          ]
          testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
        })
      })
      describe('and only the other\'s function returns false', function() {
        it('disallows dragging', function(done) {
          options.eventSources = [
            {
              overlap: function(otherEvent, thisEvent) {
                return true
              },
              events: [ {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00'
              } ]
            },
            {
              overlap: function(otherEvent, thisEvent) {
                return false
              },
              events: [ {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00'
              } ]
            }
          ]
          testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
        })
      })
      describe('and neither function returns false', function() {
        it('allows dragging', function(done) {
          options.eventSources = [
            {
              overlap: function(otherEvent, thisEvent) {
                return true
              },
              events: [ {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00'
              } ]
            },
            {
              overlap: function(otherEvent, thisEvent) {
                return true
              },
              events: [ {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00'
              } ]
            }
          ]
          testEventDrag(options, '2014-11-04T06:00:00', true, done, 'event-a')
        })
      })
    })
  })

  describe('when eventOverlap is false', function() {
    describe('when dragged adjacently after another event', function() {
      it('allows dragging', function(done) {
        options.eventOverlap = false
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00'
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00'
          }
        ]
        testEventDrag(options, '2014-11-04T09:00:00', true, done, 'event-a')
      })
    })
    describe('when dragged intersecting another event', function() {
      it('does not allow dragging', function(done) {
        options.eventOverlap = false
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00'
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00'
          }
        ]
        testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
      })
    })
  })

  describe('when eventOverlap is a function', function() {
    describe('when no intersecting events upon drag', function() {
      it('does not get called, allows dragging', function(done) {
        options.eventOverlap = function() { }
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00'
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T03:00:00',
            end: '2014-11-04T07:00:00'
          }
        ]
        spyOn(options, 'eventOverlap').and.callThrough()
        testEventDrag(options, '2014-11-04T06:00:00', true, function() {
          expect(options.eventOverlap).not.toHaveBeenCalled()
          done()
        }, 'event-b')
      })
    })
    describe('when an intersection and returning true', function() {
      it('allows dragging AND gets called', function(done) {
        options.eventOverlap = function(stillEvent, movingEvent) {
          // checks arguments here
          expect(stillEvent.title).toBe('Event B')
          expect(movingEvent.title).toBe('Event A')
          return true
        }
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00'
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00'
          }
        ]
        spyOn(options, 'eventOverlap').and.callThrough()
        testEventDrag(options, '2014-11-04T06:00:00', true, function() {
          expect(options.eventOverlap).toHaveBeenCalled()
          done()
        }, 'event-a')
      })
    })
    describe('when an intersection and returning false', function() {
      it('disallows dragging AND gets called', function(done) {
        options.eventOverlap = function() {
          return false
        }
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00'
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00'
          }
        ]
        spyOn(options, 'eventOverlap').and.callThrough()
        testEventDrag(options, '2014-11-04T06:00:00', false, function() {
          expect(options.eventOverlap).toHaveBeenCalled()
          done()
        }, 'event-a')
      })
    })
  })
})

describe('selectOverlap', function() {
  var options

  beforeEach(function() {
    options = {
      defaultDate: '2014-11-12',
      defaultView: 'agendaWeek',
      scrollTime: '00:00'
    }
    affix('#cal')
    $('#cal').width(1100)
  })

  describe('as false', function() {
    beforeEach(function() {
      options.selectOverlap = false
    })
    describe('when dragged adjacently before an event', function() {
      it('allows selection', function(done) {
        options.events = [ {
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T06:00:00'
        } ]
        testSelection(options, '01:00', '2014-11-12T04:00:00', true, done)
      })
    })
    describe('when dragged adjacently after an event', function() {
      it('allows selection', function(done) {
        options.events = [ {
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T06:00:00'
        } ]
        testSelection(options, '06:00', '2014-11-12T12:00:00', true, done)
      })
    })
    describe('when dragged intersecting an event\'s start', function() {
      describe('when no timezone', function() {
        it('does not allow selection', function(done) {
          options.events = [ {
            title: 'Event A',
            start: '2014-11-12T04:00:00',
            end: '2014-11-12T06:00:00'
          } ]
          testSelection(options, '01:00', '2014-11-12T05:00:00', false, done)
        })
      })
      describe('when UTC timezone', function() {
        it('does not allow selection', function(done) {
          options.timezone = 'UTC'
          options.events = [ {
            title: 'Event A',
            start: '2014-11-12T04:00:00+00:00',
            end: '2014-11-12T06:00:00+00:00'
          } ]
          testSelection(options, '01:00', '2014-11-12T05:00:00+00:00', false, done)
        })
      })
    })
    describe('when dragged intersecting an event\'s end', function() {
      describe('when in agendaWeek view with timed events', function() {
        describe('when no timezone', function() {
          it('does not allow selection', function(done) {
            options.events = [ {
              title: 'Event A',
              start: '2014-11-12T04:00:00',
              end: '2014-11-12T06:00:00'
            } ]
            testSelection(options, '05:00', '2014-11-12T08:00:00', false, done)
          })
        })
        describe('when UTC timezone', function() {
          it('does not allow selection', function(done) {
            options.timezone = 'UTC'
            options.events = [ {
              title: 'Event A',
              start: '2014-11-12T04:00:00+00:00',
              end: '2014-11-12T06:00:00+00:00'
            } ]
            testSelection(options, '05:00', '2014-11-12T08:00:00+00:00', false, done)
          })
        })
      })
      describe('when in month view', function() {
        beforeEach(function() {
          options.defaultView = 'month'
        })
        describe('with all-day event', function() {
          it('does not allow selection', function(done) {
            options.events = [ {
              title: 'Event A',
              start: '2014-11-12',
              end: '2014-11-14'
            } ]
            testSelection(options, null, '2014-11-13', false, done)
          })
        })
        describe('with timed event', function() {
          it('does not allow selection', function(done) {
            options.events = [ {
              title: 'Event A',
              start: '2014-11-12T05:00:00',
              end: '2014-11-14T20:00:00'
            } ]
            testSelection(options, null, '2014-11-13', false, done)
          })
        })
      })
    })
    describe('when dragged to be encompassed by an event', function() {
      it('does not allow selection', function(done) {
        options.events = [ {
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T10:00:00'
        } ]
        testSelection(options, '05:00', '2014-11-12T08:00:00', false, done)
      })
    })
  })

  describe('as a function', function() {
    describe('when no intersecting events when selecting', function() {
      it('does not get called, allows selection', function(done) {
        options.selectOverlap = function() { }
        options.events = [ {
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T06:00:00'
        } ]
        spyOn(options, 'selectOverlap').and.callThrough()
        testSelection(options, '08:00', '2014-11-12T10:00:00', true, function() {
          expect(options.selectOverlap).not.toHaveBeenCalled()
          done()
        })
      })
    })
    describe('when an intersection and returning true', function() {
      it('allows selection', function(done) {
        options.selectOverlap = function(o) {
          // checks arguments here
          expect(o.title).toBe('Event A')
          expect(arguments[1]).toBeFalsy()
          return true
        }
        options.events = [ {
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T06:00:00'
        } ]
        spyOn(options, 'selectOverlap').and.callThrough()
        testSelection(options, '05:00', '2014-11-12T07:00:00', true, function() {
          expect(options.selectOverlap).toHaveBeenCalled()
          done()
        })
      })
    })
    describe('when an intersection and returning false', function() {
      it('does not allow selection', function(done) {
        options.selectOverlap = function() {
          return false
        }
        options.events = [ {
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T06:00:00'
        } ]
        spyOn(options, 'selectOverlap').and.callThrough()
        testSelection(options, '05:00', '2014-11-12T07:00:00', false, function() {
          expect(options.selectOverlap).toHaveBeenCalled()
          done()
        })
      })
    })
  })

  describe('as true and an event object\'s overlap is false', function() {
    it('is not affected AND allows the selection', function(done) {
      options.selectOverlap = true
      options.events = [ {
        title: 'Event A',
        start: '2014-11-12T04:00:00',
        end: '2014-11-12T06:00:00',
        overlap: false
      } ]
      testSelection(options, '05:00', '2014-11-12T07:00:00', true, done)
    })
  })
})
