import { countHandlers } from '../lib/dom-misc'

describe('external drag and drop', function() {

  // TODO: fill out tests for droppable/drop, with RTL

  var doSortable
  var options

  beforeEach(function() {
    doSortable = false
    options = {
      defaultDate: '2014-08-23',
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
  })

  afterEach(function() {
    $('#cal').remove()
    $('#sidebar').remove()
  })

  function init() {
    if (doSortable) {
      $('#sidebar').sortable()
    } else {
      $('#sidebar a').draggable()
    }

    $('#cal').fullCalendar(options)
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
          options.defaultView = 'month'
        })

        it('works after the view is changed', function(done) { // issue 2240
          var callCnt = 0

          options.drop = function(date, jsEvent, ui) {
            if (callCnt === 0) {
              expect(date).toEqualMoment('2014-08-06')

              $('#cal').fullCalendar('next')
              $('#cal').fullCalendar('prev')

              setTimeout(function() {
                $('#sidebar .event1').remove()

                $('#sidebar .event2').simulate('drag', {
                  end: getMonthCell(1, 3)
                })
              }, 0)
            } else if (callCnt === 1) {
              expect(date).toEqualMoment('2014-08-06')
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
            options.dropAccept = function(jqEl) {
              expect(typeof jqEl).toBe('object')
              expect(jqEl.length).toBe(1)
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
            options.dropAccept = function(jqEl) {
              expect(typeof jqEl).toBe('object')
              expect(jqEl.length).toBe(1)
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

      describe('in agenda view', function() {

        beforeEach(function() {
          options.defaultView = 'agendaWeek'
          options.dragScroll = false
          options.scrollTime = '00:00:00'
        })

        it('works after the view is changed', function(done) {
          var callCnt = 0

          options.drop = function(date, jsEvent, ui) {
            if (callCnt === 0) {
              expect(date).toEqualMoment('2014-08-20T01:00:00')

              $('#cal').fullCalendar('next')
              $('#cal').fullCalendar('prev')

              setTimeout(function() { // needed for IE8, for firing the second time, for some reason
                $('#sidebar .event1').remove()

                $('#sidebar .event2').simulate('drag', {
                  end: $('.fc-slats tr:eq(2)') // middle is 1:00am on 2014-08-20
                })
              }, 0)
            } else if (callCnt === 1) {
              expect(date).toEqualMoment('2014-08-20T01:00:00')
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
          options.timezone = 'local'
          options.drop = function(date, jsEvent) {
            expect(date).toEqualMoment(moment('2014-08-20T01:00:00')) // compate it to a local moment
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
          options.timezone = 'UTC'
          options.drop = function(date, jsEvent) {
            expect(date).toEqualMoment('2014-08-20T01:00:00+00:00')
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
            options.dropAccept = function(jqEl) {
              expect(typeof jqEl).toBe('object')
              expect(jqEl.length).toBe(1)
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
            options.dropAccept = function(jqEl) {
              expect(typeof jqEl).toBe('object')
              expect(jqEl.length).toBe(1)
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
        var el1 = $('#cal')

        $('#cal').after('<div id="cal2"/>')
        var el2 = $('#cal2').fullCalendar(options)

        var beforeCnt = countHandlers(document)
        var afterCnt

        el1.fullCalendar('next')
        afterCnt = countHandlers(document)
        expect(beforeCnt).toBe(afterCnt)

        el1.remove()
        el2.remove()
      })
    })
  })
})
