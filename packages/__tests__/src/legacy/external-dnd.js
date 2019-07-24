import ListenerCounter from '../lib/ListenerCounter'
import { Calendar } from '@fullcalendar/core'
import InteractionPlugin, { ThirdPartyDraggable } from '@fullcalendar/interaction'
import DayGridPlugin from '@fullcalendar/daygrid'
import TimeGridPlugin from '@fullcalendar/timegrid'
import 'components-jqueryui' // for .sortable and .draggable

describe('external drag and drop with jquery UI', function() {

  // TODO: fill out tests for droppable/drop, with RTL

  var doSortable
  var options
  var thirdPartyDraggable

  beforeEach(function() {
    doSortable = false
    options = {
      plugins: [ InteractionPlugin, TimeGridPlugin, DayGridPlugin ],
      defaultDate: '2014-08-23',
      defaultView: 'dayGridMonth',
      droppable: true
    }

    $('body').append(
      '<div id="sidebar" style="width:200px">' +
        '<a class="fc-event event1">event 1</a>' +
        '<a class="fc-event event2">event 2</a>' +
      '</div>' +
      '<div id="cal" style="width:600px;position:absolute;top:10px;left:220px">' +
      '</div>'
    )

    thirdPartyDraggable = new ThirdPartyDraggable({
      itemSelector: '#sidebar .fc-event'
    })
  })

  afterEach(function() {
    var el = currentCalendar.el
    currentCalendar.destroy()
    $(el).remove()
    $('#sidebar').remove()
    thirdPartyDraggable.destroy()
  })

  function init() {
    if (doSortable) {
      $('#sidebar').sortable()
    } else {
      $('#sidebar a').draggable()
    }
    initCalendar(options)
  }

  function getMonthCell(row, col) {
    return $('.fc-day-grid .fc-row:eq(' + row + ') .fc-bg td:not(.fc-axis):eq(' + col + ')')
  }

  [ false, true ].forEach(function(_doSortable) {
    describe(_doSortable ? 'with sortable' : 'with draggable', function() {
      beforeEach(function() {
        doSortable = _doSortable
      })

      describe('in month view', function() {

        beforeEach(function() {
          options.defaultView = 'dayGridMonth'
        })

        it('works after the view is changed', function(done) { // issue 2240
          var callCnt = 0

          options.drop = function(arg) {
            if (callCnt === 0) {
              expect(arg.date).toEqualDate('2014-08-06')

              currentCalendar.next()
              currentCalendar.prev()

              setTimeout(function() {
                $('#sidebar .event1').remove()

                $('#sidebar .event2').simulate('drag', {
                  end: getMonthCell(1, 3)
                })
              }, 0)
            } else if (callCnt === 1) {
              expect(arg.date).toEqualDate('2014-08-06')
              done()
            }
            callCnt++
          }

          init()

          setTimeout(function() { // needed for IE8
            $('#sidebar .event1').simulate('drag', {
              end: getMonthCell(1, 3)
            })
          }, 0)
        })

        describe('dropAccept', function() {

          it('works with a className that does match', function(done) {
            options.dropAccept = '.event1'
            options.drop = function() { }
            spyOn(options, 'drop').and.callThrough()

            init()

            setTimeout(function() { // needed for IE8
              $('#sidebar .event1').simulate('drag', {
                end: getMonthCell(1, 3),
                callback: function() {
                  expect(options.drop).toHaveBeenCalled()
                  done()
                }
              })
            }, 0)
          })

          it('prevents a classNames that doesn\'t match', function(done) {
            options.dropAccept = '.event2'
            options.drop = function() { }
            spyOn(options, 'drop').and.callThrough()

            init()

            setTimeout(function() { // needed for IE8
              $('#sidebar .event1').simulate('drag', {
                end: getMonthCell(1, 3),
                callback: function() {
                  expect(options.drop).not.toHaveBeenCalled()
                  done()
                }
              })
            }, 0)
          })

          it('works with a filter function that returns true', function(done) {
            options.dropAccept = function(el) {
              expect(el instanceof HTMLElement).toBe(true)
              return true
            }
            options.drop = function() { }
            spyOn(options, 'drop').and.callThrough()

            init()

            setTimeout(function() { // needed for IE8
              $('#sidebar .event1').simulate('drag', {
                end: getMonthCell(1, 3),
                callback: function() {
                  expect(options.drop).toHaveBeenCalled()
                  done()
                }
              })
            }, 0)
          })

          it('prevents a drop with a filter function that returns false', function(done) {
            options.dropAccept = function(el) {
              expect(el instanceof HTMLElement).toBe(true)
              return false
            }
            options.drop = function() { }
            spyOn(options, 'drop').and.callThrough()

            init()

            setTimeout(function() { // needed for IE8
              $('#sidebar .event1').simulate('drag', {
                end: getMonthCell(1, 3),
                callback: function() {
                  expect(options.drop).not.toHaveBeenCalled()
                  done()
                }
              })
            }, 0)
          })
        })
      })

      describe('in timeGrid view', function() {

        beforeEach(function() {
          options.defaultView = 'timeGridWeek'
          options.dragScroll = false
          options.scrollTime = '00:00:00'
        })

        it('works after the view is changed', function(done) {
          var callCnt = 0

          options.drop = function(arg) {
            if (callCnt === 0) {
              expect(arg.date).toEqualDate('2014-08-20T01:00:00Z')

              currentCalendar.next()
              currentCalendar.prev()

              setTimeout(function() { // needed for IE8, for firing the second time, for some reason
                $('#sidebar .event1').remove()

                $('#sidebar .event2').simulate('drag', {
                  end: $('.fc-slats tr:eq(2)') // middle is 1:00am on 2014-08-20
                })
              }, 0)
            } else if (callCnt === 1) {
              expect(arg.date).toEqualDate('2014-08-20T01:00:00Z')
              done()
            }
            callCnt++
          }

          init()

          setTimeout(function() { // needed for IE8
            $('#sidebar .event1').simulate('drag', {
              end: $('.fc-slats tr:eq(2)') // middle is 1:00am on 2014-08-20
            })
          }, 0)
        })

        it('works with timezone as "local"', function(done) { // for issue 2225
          options.timeZone = 'local'
          options.drop = function(arg) {
            expect(arg.date).toEqualLocalDate('2014-08-20T01:00:00')
            done()
          }

          init()

          setTimeout(function() { // needed for IE8
            $('#sidebar .event1').simulate('drag', {
              end: $('.fc-slats tr:eq(2)') // middle is 1:00am on 2014-08-20, LOCAL TIME
            })
          }, 0)
        })

        it('works with timezone as "UTC"', function(done) { // for issue 2225
          options.timeZone = 'UTC'
          options.drop = function(arg) {
            expect(arg.date).toEqualDate('2014-08-20T01:00:00Z')
            done()
          }

          init()

          setTimeout(function() { // needed for IE8
            $('#sidebar .event1').simulate('drag', {
              end: $('.fc-slats tr:eq(2)') // middle is 1:00am on 2014-08-20, UTC TIME
            })
          }, 0)
        })

        describe('dropAccept', function() {

          it('works with a className that does match', function(done) {
            options.dropAccept = '.event1'
            options.drop = function() { }
            spyOn(options, 'drop').and.callThrough()

            init()

            setTimeout(function() { // needed for IE8
              $('#sidebar .event1').simulate('drag', {
                end: $('.fc-slats tr:eq(2)'),
                callback: function() {
                  expect(options.drop).toHaveBeenCalled()
                  done()
                }
              })
            }, 0)
          })

          it('prevents a classNames that doesn\'t match', function(done) {
            options.dropAccept = '.event2'
            options.drop = function() { }
            spyOn(options, 'drop').and.callThrough()

            init()

            setTimeout(function() { // needed for IE8
              $('#sidebar .event1').simulate('drag', {
                end: $('.fc-slats tr:eq(2)'),
                callback: function() {
                  expect(options.drop).not.toHaveBeenCalled()
                  done()
                }
              })
            }, 0)
          })

          it('works with a filter function that returns true', function(done) {
            options.dropAccept = function(el) {
              expect(el instanceof HTMLElement).toBe(true)
              return true
            }
            options.drop = function() { }
            spyOn(options, 'drop').and.callThrough()

            init()

            setTimeout(function() { // needed for IE8
              $('#sidebar .event1').simulate('drag', {
                end: $('.fc-slats tr:eq(2)'),
                callback: function() {
                  expect(options.drop).toHaveBeenCalled()
                  done()
                }
              })
            }, 0)
          })

          it('prevents a drop with a filter function that returns false', function(done) {
            options.dropAccept = function(el) {
              expect(el instanceof HTMLElement).toBe(true)
              return false
            }
            options.drop = function() { }
            spyOn(options, 'drop').and.callThrough()

            init()

            setTimeout(function() { // needed for IE8
              $('#sidebar .event1').simulate('drag', {
                end: $('.fc-slats tr:eq(2)'),
                callback: function() {
                  expect(options.drop).not.toHaveBeenCalled()
                  done()
                }
              })
            }, 0)
          })
        })
      })

      // Issue 2433
      it('should not have drag handlers cleared when other calendar navigates', function() {
        init()
        var el1 = currentCalendar.el
        var el2 = $('<div id="calendar2">').insertAfter(el1)
        var currentCalendar2 = new Calendar(el2[0], options)
        currentCalendar2.render()

        var docListenerCounter = new ListenerCounter(document)
        docListenerCounter.startWatching()

        currentCalendar.next()
        expect(docListenerCounter.stopWatching()).toBe(0)

        currentCalendar2.destroy()
        el2.remove()
      })
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/2926
  it('gives a mouseup event to the drop handler', function(done) {
    options.drop = function(info) {
      expect(info.jsEvent.type).toBe('mouseup')
    }
    spyOn(options, 'drop').and.callThrough()

    init()

    $('#sidebar .event1').simulate('drag', {
      end: getMonthCell(1, 3),
      callback: function() {
        expect(options.drop).toHaveBeenCalled()
        done()
      }
    })
  })

})
