import { testEventDrag, testEventResize, testSelection } from '../lib/dnd-resize-utils'

describe('event overlap', () => {
  let options

  beforeEach(() => {
    options = {
      initialDate: '2014-11-04',
      initialView: 'timeGridWeek',
      scrollTime: '00:00',
    }
  })

  describe('when other event overlap is false', () => {
    describe('when dragged adjacently before the other event', () => {
      describe('when subject event\'s end is explicit', () => {
        it('allows dragging', (done) => {
          options.events = [
            {
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T03:00:00',
            },
            {
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00',
              overlap: false,
            },
          ]
          testEventDrag(options, '2014-11-04T03:00:00', true, done, 'event-a')
        })
      })
      describe('when subject event\'s end is implied', () => {
        it('allows dragging', (done) => {
          options.defaultTimedEventDuration = '01:30'
          options.events = [
            {
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
            },
            {
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00',
              overlap: false,
            },
          ]
          testEventDrag(options, '2014-11-04T03:30:00', true, done, 'event-a')
        })
      })
    })

    describe('when dragged adjacently after the other event', () => {
      it('allows dragging', (done) => {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
            overlap: false,
          },
        ]
        testEventDrag(options, '2014-11-04T09:00:00', true, done, 'event-a')
      })
    })

    describe('when dragged intersecting the other event\'s start', () => {
      describe('when no timezone', () => {
        describe('when subject event\'s end is explicit', () => {
          it('does not allow dragging', (done) => {
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00',
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00',
                overlap: false,
              },
            ]
            testEventDrag(options, '2014-11-04T04:00:00', false, done, 'event-a')
          })
        })
        describe('when subject event\'s end is implied', () => {
          it('does not allow dragging', (done) => {
            options.defaultTimedEventDuration = '03:00'
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00',
                overlap: false,
              },
            ]
            testEventDrag(options, '2014-11-04T03:00:00', false, done, 'event-a')
          })
        })
      })
      describe('when UTC timezone', () => {
        it('does not allow dragging', (done) => {
          options.timeZone = 'UTC'
          options.events = [
            {
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00+00:00',
              end: '2014-11-04T03:00:00+00:00',
            },
            {
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00+00:00',
              end: '2014-11-04T09:00:00+00:00',
              overlap: false,
            },
          ]
          testEventDrag(options, '2014-11-04T04:00:00+00:00', false, done, 'event-a')
        })
      })
    })

    describe('when dragged intersecting the other event\'s end', () => {
      describe('when in week view with timed events', () => {
        describe('when no timezone', () => {
          it('does not allow dragging', (done) => {
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00',
                end: '2014-11-04T03:00:00',
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00',
                end: '2014-11-04T09:00:00',
                overlap: false,
              },
            ]
            testEventDrag(options, '2014-11-04T08:00:00', false, done, 'event-a')
          })
        })
        describe('when UTC timezone', () => {
          it('does not allow dragging', (done) => {
            options.timeZone = 'UTC'
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04T01:00:00+00:00',
                end: '2014-11-04T03:00:00+00:00',
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-04T05:00:00+00:00',
                end: '2014-11-04T09:00:00+00:00',
                overlap: false,
              },
            ]
            testEventDrag(options, '2014-11-04T08:00:00+00:00', false, done, 'event-a')
          })
        })
      })
      describe('when in month view', () => {
        beforeEach(() => {
          options.initialView = 'dayGridMonth'
        })
        describe('with all-day subject and all-day other', () => {
          it('does not allow dragging', (done) => {
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04',
                end: '2014-11-05',
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-07',
                end: '2014-11-09',
                overlap: false,
              },
            ]
            testEventDrag(options, '2014-11-08', false, done, 'event-a')
          })
        })
        describe('with all-day subject and timed other', () => {
          it('does not allow dragging', (done) => {
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04',
                end: '2014-11-05',
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-07T05:00:00',
                end: '2014-11-09T12:00:00',
                overlap: false,
              },
            ]
            testEventDrag(options, '2014-11-08', false, done, 'event-a')
          })
        })
        describe('with timed subject and all-day other', () => {
          it('does not allow dragging', (done) => {
            options.events = [
              {
                title: 'Event A',
                className: 'event-a',
                start: '2014-11-04',
              },
              {
                title: 'Event B',
                className: 'event-b',
                start: '2014-11-07T05:00:00',
                overlap: false,
              },
            ]
            testEventDrag(options, '2014-11-04', false, done, 'event-b')
          })
        })
      })
    })

    describe('when dragged to be encompassed by the other event', () => {
      it('does not allow dragging', (done) => {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
            overlap: false,
          },
        ]
        testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
      })
      describe('when both events have the same group ID', () => {
        it('allows the drag', (done) => {
          options.events = [
            {
              groupId: 'myid',
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T03:00:00',
            },
            {
              groupId: 'myid',
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00',
              overlap: false,
            },
          ]
          testEventDrag(options, '2014-11-04T06:00:00', true, done, 'event-a')
        })
      })
    })

    describe('when resized to be adjacently before the other event', () => {
      it('allows resizing', (done) => {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
            overlap: false,
          },
        ]
        testEventResize(options, '2014-11-04T05:00:00', true, done, 'event-a')
      })
    })

    describe('when resized to intersect the other event\'s start', () => {
      it('does not allow resizing', (done) => {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
            overlap: false,
          },
        ]
        testEventResize(options, '2014-11-04T06:00:00', false, done, 'event-a')
      })
    })
  })

  describe('when both events\' overlap is true AND they intersect', () => {
    it('allows dragging', (done) => {
      options.events = [
        {
          title: 'Event A',
          className: 'event-a',
          start: '2014-11-04T01:00:00',
          end: '2014-11-04T03:00:00',
          overlap: true,
        },
        {
          title: 'Event B',
          className: 'event-b',
          start: '2014-11-04T05:00:00',
          end: '2014-11-04T09:00:00',
          overlap: true,
        },
      ]
      testEventDrag(options, '2014-11-04T04:00:00', true, done, 'event-a')
    })
  })

  describe('when other eventSource overlap is false', () => {
    describe('when dragged over the other event', () => {
      it('does not allow dragging', (done) => {
        options.eventSources = [
          {
            events: [{
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T03:00:00',
            }],
          },
          {
            overlap: false,
            events: [{
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00',
            }],
          },
        ]
        testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
      })
    })
  })

  describe('when subject event is false', () => {
    describe('when dragged adjacently after the other event', () => {
      it('allows dragging', (done) => {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
            overlap: false,
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
          },
        ]
        testEventDrag(options, '2014-11-04T09:00:00', true, done, 'event-a')
      })
    })
    describe('when dragged intersecting the other event\'s end', () => {
      it('does not allow dragging', (done) => {
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
            overlap: false,
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
          },
        ]
        testEventDrag(options, '2014-11-04T04:00:00', false, done, 'event-a')
      })
    })
  })

  describe('when subject eventSource is false', () => {
    describe('when dragged after the other event', () => {
      it('allows dragging', (done) => {
        options.eventSources = [
          {
            overlap: false,
            events: [{
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T03:00:00',
            }],
          },
          {
            events: [{
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00',
            }],
          },
        ]
        testEventDrag(options, '2014-11-04T09:00:00', true, done, 'event-a')
      })
    })
    describe('when dragged over the other event', () => {
      it('does not allow dragging', (done) => {
        options.eventSources = [
          {
            overlap: false,
            events: [{
              title: 'Event A',
              className: 'event-a',
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T03:00:00',
            }],
          },
          {
            events: [{
              title: 'Event B',
              className: 'event-b',
              start: '2014-11-04T05:00:00',
              end: '2014-11-04T09:00:00',
            }],
          },
        ]
        testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
      })
    })
  })

  describe('when eventOverlap is false', () => {
    describe('when dragged adjacently after another event', () => {
      it('allows dragging', (done) => {
        options.eventOverlap = false
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
          },
        ]
        testEventDrag(options, '2014-11-04T09:00:00', true, done, 'event-a')
      })
    })
    describe('when dragged intersecting another event', () => {
      it('does not allow dragging', (done) => {
        options.eventOverlap = false
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
          },
        ]
        testEventDrag(options, '2014-11-04T06:00:00', false, done, 'event-a')
      })
    })
  })

  describe('when eventOverlap is a function', () => {
    describe('when no intersecting events upon drag', () => {
      it('does not get called, allows dragging', (done) => {
        options.eventOverlap = () => {}
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T03:00:00',
            end: '2014-11-04T07:00:00',
          },
        ]
        spyOn(options, 'eventOverlap').and.callThrough()
        testEventDrag(options, '2014-11-04T06:00:00', true, () => {
          expect(options.eventOverlap).not.toHaveBeenCalled()
          done()
        }, 'event-b')
      })
    })
    describe('when an intersection and returning true', () => {
      it('allows dragging AND gets called', (done) => {
        options.eventOverlap = (stillEvent, movingEvent) => {
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
            end: '2014-11-04T03:00:00',
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
          },
        ]
        spyOn(options, 'eventOverlap').and.callThrough()
        testEventDrag(options, '2014-11-04T06:00:00', true, () => {
          expect(options.eventOverlap).toHaveBeenCalled()
          done()
        }, 'event-a')
      })
    })
    describe('when an intersection and returning false', () => {
      it('disallows dragging AND gets called', (done) => {
        options.eventOverlap = () => false
        options.events = [
          {
            title: 'Event A',
            className: 'event-a',
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T03:00:00',
          },
          {
            title: 'Event B',
            className: 'event-b',
            start: '2014-11-04T05:00:00',
            end: '2014-11-04T09:00:00',
          },
        ]
        spyOn(options, 'eventOverlap').and.callThrough()
        testEventDrag(options, '2014-11-04T06:00:00', false, () => {
          expect(options.eventOverlap).toHaveBeenCalled()
          done()
        }, 'event-a')
      })
    })
  })
})

describe('selectOverlap', () => {
  let options

  beforeEach(() => {
    options = {
      initialDate: '2014-11-12',
      initialView: 'timeGridWeek',
      scrollTime: '00:00',
    }
  })

  describe('as false', () => {
    beforeEach(() => {
      options.selectOverlap = false
    })
    describe('when dragged adjacently before an event', () => {
      it('allows selection', (done) => {
        options.events = [{
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T06:00:00',
        }]
        testSelection(options, '2014-11-12T01:00:00Z', '2014-11-12T04:00:00Z', true, done)
      })
    })
    describe('when dragged adjacently after an event', () => {
      it('allows selection', (done) => {
        options.events = [{
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T06:00:00',
        }]
        testSelection(options, '2014-11-12T06:00:00Z', '2014-11-12T12:00:00Z', true, done)
      })
    })
    describe('when dragged intersecting an event\'s start', () => {
      describe('when UTC timezone', () => {
        it('does not allow selection', (done) => {
          options.timeZone = 'UTC'
          options.events = [{
            title: 'Event A',
            start: '2014-11-12T04:00:00+00:00',
            end: '2014-11-12T06:00:00+00:00',
          }]
          testSelection(options, '2014-11-12T01:00:00Z', '2014-11-12T05:00:00Z', false, done)
        })
      })
      describe('when local timezone', () => {
        it('does not allow selection', (done) => {
          options.timeZone = 'local'
          options.events = [{
            title: 'Event A',
            start: '2014-11-12T04:00:00',
            end: '2014-11-12T06:00:00',
          }]
          testSelection(options, '2014-11-12T01:00:00', '2014-11-12T05:00:00', false, done)
        })
      })
    })
    describe('when dragged intersecting an event\'s end', () => {
      describe('when in week view with timed events', () => {
        describe('when no timezone', () => {
          it('does not allow selection', (done) => {
            options.events = [{
              title: 'Event A',
              start: '2014-11-12T04:00:00',
              end: '2014-11-12T06:00:00',
            }]
            testSelection(options, '2014-11-12T05:00:00Z', '2014-11-12T08:00:00Z', false, done)
          })
        })
        describe('when UTC timezone', () => {
          it('does not allow selection', (done) => {
            options.timeZone = 'UTC'
            options.events = [{
              title: 'Event A',
              start: '2014-11-12T04:00:00+00:00',
              end: '2014-11-12T06:00:00+00:00',
            }]
            testSelection(options, '2014-11-12T05:00:00Z', '2014-11-12T08:00:00Z', false, done)
          })
        })
        describe('when local timezone', () => {
          it('does not allow selection', (done) => {
            options.timeZone = 'local'
            options.events = [{
              title: 'Event A',
              start: '2014-11-12T04:00:00',
              end: '2014-11-12T06:00:00',
            }]
            testSelection(options, '2014-11-12T05:00:00', '2014-11-12T08:00:00', false, done)
          })
        })
      })
      describe('when in month view', () => {
        beforeEach(() => {
          options.initialView = 'dayGridMonth'
        })
        describe('with all-day event', () => {
          it('does not allow selection', (done) => {
            options.events = [{
              title: 'Event A',
              start: '2014-11-12',
              end: '2014-11-14',
            }]
            testSelection(options, '2014-11-12', '2014-11-13', false, done)
          })
        })
        describe('with timed event', () => {
          it('does not allow selection', (done) => {
            options.events = [{
              title: 'Event A',
              start: '2014-11-12T05:00:00',
              end: '2014-11-14T20:00:00',
            }]
            testSelection(options, '2014-11-12', '2014-11-13', false, done)
          })
        })
      })
    })
    describe('when dragged to be encompassed by an event', () => {
      it('does not allow selection', (done) => {
        options.events = [{
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T10:00:00',
        }]
        testSelection(options, '2014-11-12T05:00:00Z', '2014-11-12T08:00:00Z', false, done)
      })
    })
  })

  describe('as a function', () => {
    describe('when no intersecting events when selecting', () => {
      it('does not get called, allows selection', (done) => {
        options.selectOverlap = () => {}
        options.events = [{
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T06:00:00',
        }]
        spyOn(options, 'selectOverlap').and.callThrough()
        testSelection(options, '2014-11-12T08:00:00Z', '2014-11-12T10:00:00Z', true, () => {
          expect(options.selectOverlap).not.toHaveBeenCalled()
          done()
        })
      })
    })
    describe('when an intersection and returning true', () => {
      it('allows selection', (done) => {
        options.selectOverlap = (arg0, arg1) => {
          // checks arguments here
          expect(arg0.title).toBe('Event A')
          expect(arg1).toBeFalsy()
          return true
        }
        options.events = [{
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T06:00:00',
        }]
        spyOn(options, 'selectOverlap').and.callThrough()
        testSelection(options, '2014-11-12T05:00:00Z', '2014-11-12T07:00:00Z', true, () => {
          expect(options.selectOverlap).toHaveBeenCalled()
          done()
        })
      })
    })
    describe('when an intersection and returning false', () => {
      it('does not allow selection', (done) => {
        options.selectOverlap = () => false
        options.events = [{
          title: 'Event A',
          start: '2014-11-12T04:00:00',
          end: '2014-11-12T06:00:00',
        }]
        spyOn(options, 'selectOverlap').and.callThrough()
        testSelection(options, '2014-11-12T05:00:00Z', '2014-11-12T07:00:00Z', false, () => {
          expect(options.selectOverlap).toHaveBeenCalled()
          done()
        })
      })
    })
  })

  describe('as true and an event object\'s overlap is false', () => {
    it('is not affected AND allows the selection', (done) => {
      options.selectOverlap = true
      options.events = [{
        title: 'Event A',
        start: '2014-11-12T04:00:00',
        end: '2014-11-12T06:00:00',
        overlap: false,
      }]
      testSelection(options, '2014-11-12T05:00:00Z', '2014-11-12T07:00:00', true, done)
    })
  })
})
