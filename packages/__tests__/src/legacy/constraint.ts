import { testEventDrag, testEventResize, testSelection } from '../lib/dnd-resize-utils'

describe('event constraint', () => {
  pushOptions({
    initialDate: '2014-11-10',
    initialView: 'timeGridWeek',
    scrollTime: '00:00',
  })
  describe('when used with a specific date range', () => {
    describe('when an event is being dragged', () => {
      describe('to the middle of the constraint range', () => {
        it('allows a drag', (done) => {
          let options = {
            events: [{
              start: '2014-11-10T01:00:00',
              end: '2014-11-10T02:00:00',
              constraint: {
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T06:00:00',
              },
            }],
          }
          testEventDrag(options, '2014-11-10T04:00:00', true, done)
        })

        describe('when in month view with timed event', () => {
          it('allows a drag, respects time of day', (done) => {
            let options = {
              initialView: 'dayGridMonth',
              events: [{
                start: '2014-11-10T05:00:00',
                end: '2014-11-10T07:00:00',
                constraint: {
                  start: '04:00',
                  end: '20:00',
                },
              }],
            }
            testEventDrag(options, '2014-11-14', true, () => {
              let event = currentCalendar.getEvents()[0]
              expect(event.start).toEqualDate('2014-11-14T05:00:00Z')
              expect(event.end).toEqualDate('2014-11-14T07:00:00Z')
              done()
            })
          })
        })
      })

      describe('to the start of the constraint range', () => {
        it('allows a drag', (done) => {
          let options = {
            events: [{
              start: '2014-11-10T01:00:00',
              end: '2014-11-10T02:00:00',
              constraint: {
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T06:00:00',
              },
            }],
          }
          testEventDrag(options, '2014-11-10T03:00:00', true, done)
        })
      })

      describe('to the end of the constraint range', () => {
        describe('when the event has an explicit end', () => {
          it('allows a drag', (done) => {
            let options = {
              events: [{
                start: '2014-11-10T01:00:00',
                end: '2014-11-10T02:00:00',
                constraint: {
                  start: '2014-11-10T03:00:00',
                  end: '2014-11-10T06:00:00',
                },
              }],
            }
            testEventDrag(options, '2014-11-10T05:00:00', true, done)
          })
        })
        describe('when the event has an implied end', () => {
          it('allows a drag', (done) => {
            let options = {
              defaultTimedEventDuration: '01:30:00',
              events: [{
                start: '2014-11-10T01:00:00',
                constraint: {
                  start: '2014-11-10T03:00:00',
                  end: '2014-11-10T06:00:00',
                },
              }],
            }
            testEventDrag(options, '2014-11-10T04:30:00', true, done)
          })
        })
      })

      describe('before a constraint range', () => {
        it('does not allow a drag', (done) => {
          let options = {
            events: [{
              start: '2014-11-10T01:00:00',
              end: '2014-11-10T02:00:00',
              constraint: {
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T06:00:00',
              },
            }],
          }
          testEventDrag(options, '2014-11-10T02:00:00', false, done)
        })
      })

      describe('after a constraint range', () => {
        describe('using an event object\'s constraint', () => {
          describe('when in week view with timed events', () => {
            it('does not allow a drag', (done) => {
              let options = {
                events: [{
                  start: '2014-11-10T01:00:00',
                  end: '2014-11-10T02:00:00',
                  constraint: {
                    start: '2014-11-10T03:00:00',
                    end: '2014-11-10T06:00:00',
                  },
                }],
              }
              testEventDrag(options, '2014-11-10T06:00:00', false, done)
            })
          })
          describe('when in month view', () => {
            pushOptions({ initialView: 'dayGridMonth' })
            describe('with timed event and all-day constraint', () => {
              it('does not allow a drag', (done) => {
                let options = {
                  events: [{
                    start: '2014-11-10T01:00:00',
                    end: '2014-11-10T02:00:00',
                    constraint: {
                      start: '2014-11-10',
                      end: '2014-11-11',
                    },
                  }],
                }
                testEventDrag(options, '2014-11-12', false, done)
              })
            })
            describe('with timed event and timed constraint', () => {
              it('does not allow a drag', (done) => {
                let options = {
                  events: [{
                    start: '2014-11-10T01:00:00',
                    end: '2014-11-10T02:00:00',
                    constraint: {
                      start: '2014-11-10T00:00:00',
                      end: '2014-11-11T12:00:00',
                    },
                  }],
                }
                testEventDrag(options, '2014-11-12', false, done)
              })
            })
            describe('with all-day event and all-day constraint', () => {
              it('does not allow a drag', (done) => {
                let options = {
                  events: [{
                    start: '2014-11-10',
                    end: '2014-11-12',
                    constraint: {
                      start: '2014-11-09',
                      end: '2014-11-13',
                    },
                  }],
                }
                testEventDrag(options, '2014-11-13', false, done)
              })
            })
            describe('with all-day event and timed constraint', () => {
              it('does not allow a drag', (done) => {
                let options = {
                  events: [{
                    start: '2014-11-10',
                    end: '2014-11-12',
                    constraint: {
                      start: '2014-11-09T01:00:00',
                      end: '2014-11-12T23:00:00',
                    },
                  }],
                }
                testEventDrag(options, '2014-11-13', false, done)
              })
            })
          })
        })
        describe('using an event source\'s constraint', () => {
          it('does not allow a drag', (done) => {
            let options = {
              eventSources: [{
                events: [{
                  start: '2014-11-10T01:00:00',
                  end: '2014-11-10T02:00:00',
                }],
                constraint: {
                  start: '2014-11-10T03:00:00',
                  end: '2014-11-10T06:00:00',
                },
              }],
            }
            testEventDrag(options, '2014-11-10T06:00:00', false, done)
          })
        })
        describe('using eventConstraint', () => {
          it('does not allow a drag and doesnt call eventDataTransform', (done) => {
            let options = {
              events: [{
                start: '2014-11-10T01:00:00',
                end: '2014-11-10T02:00:00',
              }],
              eventConstraint: {
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T06:00:00',
              },
              eventDataTransform(inData) {
                return inData
              },
            }

            spyOn(options, 'eventDataTransform').and.callThrough()

            testEventDrag(options, '2014-11-10T06:00:00', false, () => {
              expect(options.eventDataTransform.calls.count()).toBe(1) // only initial parse
              done()
            })
          })
        })
      })

      describe('intersecting the constraint start', () => {
        describe('with no timezone', () => {
          it('does not allow a drag', (done) => {
            let options = {
              events: [{
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T05:00:00',
                constraint: {
                  start: '2014-11-10T03:00:00',
                  end: '2014-11-10T06:00:00',
                },
              }],
            }
            testEventDrag(options, '2014-11-10T02:00:00', false, done)
          })
        })
        describe('with UTC timezone', () => {
          it('does not allow a drag', (done) => {
            let options = {
              timeZone: 'UTC',
              events: [{
                start: '2014-11-10T03:00:00+00:00',
                end: '2014-11-10T05:00:00+00:00',
                constraint: {
                  start: '2014-11-10T03:00:00+00:00',
                  end: '2014-11-10T06:00:00+00:00',
                },
              }],
            }
            testEventDrag(options, '2014-11-10T02:00:00+00:00', false, done)
          })
        })
      })

      describe('intersecting the constraint end', () => {
        describe('when the event has an explicit end', () => {
          it('does not allow a drag', (done) => {
            let options = {
              events: [{
                start: '2014-11-10T03:00:00',
                end: '2014-11-10T05:00:00',
                constraint: {
                  start: '2014-11-10T03:00:00',
                  end: '2014-11-10T06:00:00',
                },
              }],
            }
            testEventDrag(options, '2014-11-10T05:00:00', false, done)
          })
        })
        describe('when the event has an implied end', () => {
          it('does not allow a drag', (done) => {
            let options = {
              defaultTimedEventDuration: '02:30',
              events: [{
                start: '2014-11-10T03:00:00',
                constraint: {
                  start: '2014-11-10T03:00:00',
                  end: '2014-11-10T12:00:00',
                },
              }],
            }
            testEventDrag(options, '2014-11-10T10:00:00', false, done)
          })
        })
        describe('with UTC timezone', () => {
          it('does not allow a drag', (done) => {
            let options = {
              timeZone: 'UTC',
              events: [{
                start: '2014-11-10T03:00:00+00:00',
                end: '2014-11-10T05:00:00+00:00',
                constraint: {
                  start: '2014-11-10T03:00:00+00:00',
                  end: '2014-11-10T06:00:00+00:00',
                },
              }],
            }
            testEventDrag(options, '2014-11-10T05:00:00+00:00', false, done)
          })
        })
      })

      describe('into a constraint it encompasses', () => {
        it('does not allow a drag', (done) => {
          let options = {
            events: [{
              start: '2014-11-10T01:00:00',
              end: '2014-11-10T05:00:00',
              constraint: {
                start: '2014-11-10T12:00:00',
                end: '2014-11-10T14:00:00',
              },
            }],
          }
          testEventDrag(options, '2014-11-10T10:00:00', false, done)
        })
      })
    })

    describe('when an event is being resized', () => {
      describe('when the start is already outside the constraint', () => {
        it('does not allow a resize', (done) => {
          let options = {
            events: [{
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T03:00:00',
              constraint: {
                start: '2014-11-12T02:00:00',
                end: '2014-11-12T22:00:00',
              },
            }],
          }
          testEventResize(options, '2014-11-12T10:00:00', false, done)
        })
      })

      describe('when resized well within the constraint', () => {
        it('allows a resize', (done) => {
          let options = {
            events: [{
              start: '2014-11-12T02:00:00',
              end: '2014-11-12T04:00:00',
              constraint: {
                start: '2014-11-12T01:00:00',
                end: '2014-11-12T22:00:00',
              },
            }],
          }
          testEventResize(options, '2014-11-12T10:00:00', true, done)
        })
      })

      describe('when resized to the end of the constraint', () => {
        it('allows a resize', (done) => {
          let options = {
            events: [{
              start: '2014-11-12T02:00:00',
              end: '2014-11-12T04:00:00',
              constraint: {
                start: '2014-11-12T01:00:00',
                end: '2014-11-12T06:00:00',
              },
            }],
          }
          testEventResize(options, '2014-11-12T06:00:00', true, done)
        })
      })

      describe('when resized past the end of the constraint', () => {
        it('does not allow a resize', (done) => {
          let options = {
            events: [{
              start: '2014-11-12T02:00:00',
              end: '2014-11-12T04:00:00',
              constraint: {
                start: '2014-11-12T01:00:00',
                end: '2014-11-12T06:00:00',
              },
            }],
          }
          testEventResize(options, '2014-11-12T07:00:00', false, done)
        })
      })
    })
  })

  describe('when used with a recurring date range', () => {
    describe('when an event is being dragged', () => {
      describe('to the middle of the constraint range', () => {
        it('allows a drag', (done) => {
          let options = {
            events: [{
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T03:00:00',
              constraint: {
                startTime: '04:00:00',
                endTime: '08:00:00',
              },
            }],
          }
          testEventDrag(options, '2014-11-12T05:00:00', true, done)
        })
      })

      describe('outside of a constraint range', () => {
        it('does not allow a drag', (done) => {
          let options = {
            events: [{
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T03:00:00',
              constraint: {
                startTime: '04:00:00',
                endTime: '08:00:00',
              },
            }],
          }
          testEventDrag(options, '2014-11-12T07:00:00', false, done)
        })
      })

      describe('on an off-day of a constraint range', () => {
        it('does not allow a drag', (done) => {
          let options = {
            events: [{
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T03:00:00',
              constraint: {
                startTime: '04:00:00',
                endTime: '08:00:00',
                daysOfWeek: [0, 1, 2, 3, 5, 6], // except Thursday
              },
            }],
          }
          testEventDrag(options, '2014-11-13T05:00:00', false, done) // drag to Thursday
        })
      })
    })
  })

  describe('when used with businessHours', () => {
    describe('when an event is being dragged', () => {
      describe('to the middle of the constraint range', () => {
        it('allows a drag', (done) => {
          let options = {
            businessHours: {
              startTime: '02:00',
              endTime: '06:00',
            },
            events: [{
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T02:00:00',
              constraint: 'businessHours',
            }],
          }
          testEventDrag(options, '2014-11-12T03:00:00', true, done)
        })
      })

      describe('outside of a constraint range', () => {
        it('does not allow a drag', (done) => {
          let options = {
            businessHours: {
              startTime: '02:00',
              endTime: '06:00',
            },
            events: [{
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T02:30:00',
              constraint: 'businessHours',
            }],
          }
          testEventDrag(options, '2014-11-12T05:00:00', false, done)
        })
      })

      describe('on an off-day of a constraint range', () => {
        it('does not allow a drag', (done) => {
          let options = {
            businessHours: {
              startTime: '02:00',
              endTime: '06:00',
              daysOfWeek: [1, 2, 3, 4], // Mon - Thurs
            },
            events: [{
              start: '2014-11-12T01:00:00',
              end: '2014-11-12T02:30:00',
              constraint: 'businessHours',
            }],
          }
          testEventDrag(options, '2014-11-14T03:00:00', false, done) // Friday
        })
      })
    })
  })

  describe('when used with an event group ID', () => {
    describe('when an event is being dragged', () => {
      describe('to the middle of the constraint range', () => {
        it('allows a drag', (done) => {
          let options = {
            events: [
              {
                start: '2014-11-12T01:00:00',
                end: '2014-11-12T03:00:00',
                className: 'dragging-event',
                constraint: 'yo',
              },
              {
                groupId: 'yo',
                start: '2014-11-13T01:00:00',
                end: '2014-11-13T05:00:00',
              },
            ],
          }
          testEventDrag(options, '2014-11-13T02:00:00', true, done, 'dragging-event')
        })
      })

      describe('outside of a foreground event constraint', () => {
        describe('with an explicit end time', () => {
          it('does not allow a drag', (done) => {
            let options = {
              events: [
                {
                  start: '2014-11-12T01:00:00',
                  end: '2014-11-12T03:00:00',
                  constraint: 'yo',
                  className: 'dragging-event',
                },
                {
                  id: 'yo',
                  start: '2014-11-13T01:00:00',
                  end: '2014-11-13T04:00:00',
                },
              ],
            }
            testEventDrag(options, '2014-11-13T04:00:00', false, done, 'dragging-event')
          })
        })
        describe('when an implied end time', () => {
          it('does not allow a drag', (done) => {
            let options = {
              defaultTimedEventDuration: '01:00:00',
              events: [
                {
                  start: '2014-11-12T01:00:00',
                  end: '2014-11-12T03:00:00',
                  constraint: 'yo',
                  className: 'dragging-event',
                },
                {
                  id: 'yo',
                  start: '2014-11-13T01:00:00',
                },
              ],
            }
            testEventDrag(options, '2014-11-13T01:00:00', false, done, 'dragging-event')
          })
        })
      })

      describe('outside of a background-event constraint', () => {
        it('does not allow a drag', (done) => {
          let options = {
            events: [
              {
                start: '2014-11-12T01:00:00',
                end: '2014-11-12T03:00:00',
                constraint: 'yo',
                className: 'dragging-event',
              },
              {
                id: 'yo',
                start: '2014-11-13T01:00:00',
                end: '2014-11-13T04:00:00',
                display: 'background',
              },
            ],
          }
          testEventDrag(options, '2014-11-13T04:00:00', false, done, 'dragging-event')
        })
      })

      describe('when the event ID constraint matches no events', () => {
        it('does not allow a drag', (done) => {
          let options = {
            events: [
              {
                start: '2014-11-12T01:00:00',
                end: '2014-11-12T03:00:00',
                constraint: 'yo',
              },
            ],
          }
          testEventDrag(options, '2014-11-13T04:00:00', false, done)
        })
      })

      describe('when in month view', () => {
        pushOptions({ initialView: 'dayGridMonth' })
        describe('when the event ID constraint matches no events', () => {
          it('does not allow a drag', (done) => {
            let options = {
              events: [
                {
                  start: '2014-11-12',
                  end: '2014-11-12',
                  constraint: 'yo',
                },
              ],
            }
            testEventDrag(options, '2014-11-13', false, done)
          })
        })
      })
    })
  })
})

describe('selectConstraint', () => {
  pushOptions({
    initialDate: '2014-11-10',
    initialView: 'timeGridWeek',
    scrollTime: '00:00',
  })

  describe('when used with a specific date range', () => {
    describe('when dragged clearly within', () => {
      it('allows a selection', (done) => {
        let options = {
          selectConstraint: {
            start: '2014-11-12T01:00:00',
            end: '2014-11-12T20:00:00',
          },
        }
        testSelection(options, '2014-11-12T03:00:00Z', '2014-11-12T10:00:00Z', true, done)
      })
    })

    describe('when dragged within, starting with the constraint start', () => {
      it('allows a selection', (done) => {
        let options = {
          selectConstraint: {
            start: '2014-11-12T01:00:00',
            end: '2014-11-12T20:00:00',
          },
        }
        testSelection(options, '2014-11-12T01:00:00Z', '2014-11-12T05:00:00Z', true, done)
      })
    })

    describe('when dragged within, ending with the constraint end', () => {
      it('allows a selection', (done) => {
        let options = {
          selectConstraint: {
            start: '2014-11-12T01:00:00',
            end: '2014-11-12T05:00:00',
          },
        }
        testSelection(options, '2014-11-12T03:00:00Z', '2014-11-12T05:00:00Z', true, done)
      })
    })

    describe('when dragged intersecting the constraint start', () => {
      it('does not allow a selection', (done) => {
        let options = {
          selectConstraint: {
            start: '2014-11-12T03:00:00',
            end: '2014-11-12T20:00:00',
          },
        }
        testSelection(options, '2014-11-12T02:00:00Z', '2014-11-12T04:00:00Z', false, done)
      })
    })

    describe('when dragged intersecting the constraint end', () => {
      it('does not allow a selection', (done) => {
        let options = {
          selectConstraint: {
            start: '2014-11-12T03:00:00',
            end: '2014-11-12T07:00:00',
          },
        }
        testSelection(options, '2014-11-12T04:00:00Z', '2014-11-12T08:00:00Z', false, done)
      })
    })

    describe('when dragged after the constraint', () => {
      describe('when in week view with timed events', () => {
        it('does not allow a selection', (done) => {
          let options = {
            selectConstraint: {
              start: '2014-11-12T03:00:00',
              end: '2014-11-12T05:00:00',
            },
          }
          testSelection(options, '2014-11-12T05:00:00Z', '2014-11-12T07:00:00Z', false, done)
        })
      })
      describe('when in month view', () => {
        pushOptions({ initialView: 'dayGridMonth' })
        describe('when an all-day constraint', () => {
          it('does not allow a selection', (done) => {
            let options = {
              selectConstraint: {
                start: '2014-11-13',
                end: '2014-11-14',
              },
            }
            testSelection(options, '2014-11-12', '2014-11-14', false, done)
          })
        })
        describe('when a timed constraint, out of bounds', () => {
          it('does not allow a selection', (done) => {
            let options = {
              selectConstraint: {
                start: '2014-11-12T01:00:00',
                end: '2014-11-14T00:00:00',
              },
            }
            testSelection(options, '2014-11-12', '2014-11-14', false, done)
          })
        })
        describe('when a timed constraint, in bounds', () => {
          it('allows a selection', (done) => {
            let options = {
              selectConstraint: {
                start: '2014-11-12T00:00:00',
                end: '2014-11-14T00:00:00',
              },
            }
            testSelection(options, '2014-11-12', '2014-11-14', true, done)
          })
        })
      })
    })
  })

  describe('when used with a recurring date range', () => {
    describe('to the middle of the constraint range', () => {
      it('allows a selection when in bounds', (done) => {
        let options = {
          selectConstraint: {
            startTime: '01:00:00',
            endTime: '05:00:00',
          },
        }
        testSelection(options, '2014-11-12T02:00:00Z', '2014-11-12T04:00:00Z', true, done)
      })
    })

    describe('outside of a constraint range', () => {
      it('does not allow a selection when single day', (done) => {
        let options = {
          selectConstraint: {
            startTime: '01:00:00',
            endTime: '05:00:00',
          },
        }
        testSelection(options, '2014-11-12T02:00:00Z', '2014-11-12T06:00:00Z', false, done)
      })
      it('does not allow a selection when multiday', (done) => {
        let options = {
          selectConstraint: {
            startTime: '01:00:00',
            endTime: '05:00:00',
          },
        }
        testSelection(options, '2014-11-12T02:00:00Z', '2014-11-14T04:00:00Z', false, done)
      })
    })
  })

  describe('when used with businessHours', () => {
    describe('to the middle of the constraint range', () => {
      it('allows a selection', (done) => {
        let options = {
          businessHours: {
            startTime: '01:00:00',
            endTime: '05:00:00',
          },
          selectConstraint: 'businessHours',
        }
        testSelection(options, '2014-11-12T02:00:00Z', '2014-11-12T04:00:00Z', true, done)
      })
    })

    describe('outside of a constraint range', () => {
      it('does not allow a selection', (done) => {
        let options = {
          businessHours: {
            startTime: '01:00:00',
            endTime: '05:00:00',
          },
          selectConstraint: 'businessHours',
        }
        testSelection(options, '2014-11-12T02:00:00Z', '2014-11-12T06:00:00Z', false, done)
      })
    })

    describe('with a custom dow when dragged to a dead day', () => {
      it('does not allow a selection', (done) => {
        let options = {
          businessHours: {
            startTime: '01:00:00',
            endTime: '05:00:00',
            daysOfWeek: [1, 2, 4, 5], // Mon,Tue,Thu,Fri
          },
          selectConstraint: 'businessHours',
        }
        testSelection(options, '2014-11-12T02:00:00Z', '2014-11-12T04:00:00Z', false, done) // Wed
      })
    })
  })

  describe('when used with an event group ID', () => {
    describe('to the middle of the constraint range', () => {
      it('allows a selection', (done) => {
        let options = {
          events: [{
            groupId: 'yo',
            start: '2014-11-12T02:00:00',
            end: '2014-11-12T05:00:00',
            display: 'background',
          }],
          selectConstraint: 'yo',
        }
        testSelection(options, '2014-11-12T03:00:00Z', '2014-11-12T04:00:00Z', true, done)
      })
    })

    describe('outside of a constraint range', () => {
      it('does not allow a selection', (done) => {
        let options = {
          events: [{
            groupId: 'yo',
            start: '2014-11-12T02:00:00',
            end: '2014-11-12T05:00:00',
            display: 'background',
          }],
          selectConstraint: 'yo',
        }
        testSelection(options, '2014-11-12T03:00:00Z', '2014-11-12T06:00:00Z', false, done)
      })
    })

    describe('when event ID does not match any events', () => {
      describe('when in week view', () => {
        it('does not allow a selection', (done) => {
          let options = {
            selectConstraint: 'yooo',
          }
          testSelection(options, '2014-11-12T03:00:00Z', '2014-11-12T06:00:00Z', false, done)
        })
      })
      describe('when in month view', () => {
        it('does not allow a selection', (done) => {
          let options = {
            initialView: 'dayGridMonth',
            selectConstraint: 'yooo',
          }
          testSelection(options, '2014-11-12', '2014-11-15', false, done)
        })
      })
    })
  })
})
