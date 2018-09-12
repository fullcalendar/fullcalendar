describe('select callback', function() {

  var options

  beforeEach(function() {
    options = {
      defaultDate: '2014-05-25',
      selectable: true,
      longPressDelay: 100
    }
  })

  afterEach(function() {
    currentCalendar.destroy()
  });

  [ 'ltr', 'rtl' ].forEach(function(dir) {
    let dirSign = dir === 'rtl' ? -1 : 1

    describe('when dir is ' + dir, function() {
      beforeEach(function() {
        options.dir = dir
      })
      describe('when in month view', function() {
        beforeEach(function() {
          options.defaultView = 'month'
        })
        it('gets fired correctly when the user selects cells', function(done) {
          options.select = function(arg) {
            expect(arg.start instanceof Date).toEqual(true)
            expect(arg.end instanceof Date).toEqual(true)
            expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
            expect(typeof arg.view).toEqual('object') // "
            expect(arg.isAllDay).toEqual(true)
            expect(arg.start).toEqualDate('2014-04-28')
            expect(arg.startStr).toEqual('2014-04-28')
            expect(arg.end).toEqualDate('2014-05-07')
            expect(arg.endStr).toEqual('2014-05-07')
          }
          spyOn(options, 'select').and.callThrough()
          initCalendar(options)
          $('.fc-day[data-date="2014-04-28"]').simulate('drag', {
            end: '.fc-day[data-date="2014-05-06"]',
            callback: function() {
              expect(options.select).toHaveBeenCalled()
              done()
            }
          })
        })
        it('gets fired correctly when the user selects cells via touch', function(done) {
          options.select = function(arg) {
            expect(arg.start instanceof Date).toEqual(true)
            expect(arg.end instanceof Date).toEqual(true)
            expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
            expect(typeof arg.view).toEqual('object') // "
            expect(arg.isAllDay).toEqual(true)
            expect(arg.start).toEqualDate('2014-04-28')
            expect(arg.startStr).toEqual('2014-04-28')
            expect(arg.end).toEqualDate('2014-05-07')
            expect(arg.endStr).toEqual('2014-05-07')
          }
          spyOn(options, 'select').and.callThrough()
          initCalendar(options)
          setTimeout(function() {
            $('.fc-day[data-date="2014-04-28"]').simulate('drag', {
              isTouch: true,
              delay: 200,
              end: '.fc-day[data-date="2014-05-06"]',
              callback: function() {
                expect(options.select).toHaveBeenCalled()
                done()
              }
            })
          }, 100) // for FF
        })
        it('gets fired correctly when the user selects just one cell', function(done) {
          options.select = function(arg) {
            expect(arg.start instanceof Date).toEqual(true)
            expect(arg.end instanceof Date).toEqual(true)
            expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
            expect(typeof arg.view).toEqual('object') // "
            expect(arg.isAllDay).toEqual(true)
            expect(arg.start).toEqualDate('2014-04-28')
            expect(arg.startStr).toEqual('2014-04-28')
            expect(arg.end).toEqualDate('2014-04-29')
            expect(arg.endStr).toEqual('2014-04-29')
          }
          spyOn(options, 'select').and.callThrough()
          initCalendar(options)
          $('.fc-day[data-date="2014-04-28"]').simulate('drag', {
            end: '.fc-day[data-date="2014-04-28"]',
            callback: function() {
              expect(options.select).toHaveBeenCalled()
              done()
            }
          })
        })
      })

      describe('when in agendaWeek view', function() {
        beforeEach(function() {
          options.defaultView = 'agendaWeek'
        })
        describe('when selecting all-day slots', function() {
          it('gets fired correctly when the user selects cells', function(done) {
            options.select = function(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.isAllDay).toEqual(true)
              expect(arg.start).toEqualDate('2014-05-28')
              expect(arg.startStr).toEqual('2014-05-28')
              expect(arg.end).toEqualDate('2014-05-30')
              expect(arg.endStr).toEqual('2014-05-30')
            }
            spyOn(options, 'select').and.callThrough()
            initCalendar(options)
            $('.fc-agenda-view .fc-day-grid .fc-day:eq(3)').simulate('drag', { // will be 2014-05-28 for LTR and RTL
              dx: $('.fc-sun').outerWidth() * dirSign, // the width of one column
              callback: function() {
                expect(options.select).toHaveBeenCalled()
                done()
              }
            })
          })
          it('gets fired correctly when the user selects a single cell', function(done) {
            options.select = function(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.isAllDay).toEqual(true)
              expect(arg.start).toEqualDate('2014-05-28')
              expect(arg.startStr).toEqual('2014-05-28')
              expect(arg.end).toEqualDate('2014-05-29')
              expect(arg.endStr).toEqual('2014-05-29')
            }
            spyOn(options, 'select').and.callThrough()
            initCalendar(options)
            $('.fc-agenda-view .fc-day-grid .fc-day:eq(3)').simulate('drag', { // will be 2014-05-28 for LTR and RTL
              callback: function() {
                expect(options.select).toHaveBeenCalled()
                done()
              }
            })
          })
        })
        describe('when selecting timed slots', function() {
          it('gets fired correctly when the user selects slots', function(done) {
            options.select = function(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.isAllDay).toEqual(false)
              expect(arg.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(arg.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(arg.end).toEqualDate('2014-05-28T10:30:00Z')
              expect(arg.endStr).toEqual('2014-05-28T10:30:00Z')
            }
            spyOn(options, 'select').and.callThrough()
            initCalendar(options)
            $('.fc-slats tr:eq(18) td:not(.fc-time)').simulate('drag', { // middle will be 2014-05-28T09:00:00
              dy: $('.fc-slats tr:eq(18)').outerHeight() * 2, // move down two slots
              callback: function() {
                expect(options.select).toHaveBeenCalled()
                done()
              }
            })
          })
          it('gets fired correctly when the user selects slots via touch', function(done) {
            options.select = function(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.isAllDay).toEqual(false)
              expect(arg.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(arg.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(arg.end).toEqualDate('2014-05-28T10:30:00Z')
              expect(arg.endStr).toEqual('2014-05-28T10:30:00Z')
            }
            spyOn(options, 'select').and.callThrough()
            initCalendar(options)
            setTimeout(function() { // prevent scroll from being triggered, killing the select interaction
              $('.fc-slats tr:eq(18) td:not(.fc-time)').simulate('drag', { // middle will be 2014-05-28T09:00:00
                isTouch: true,
                delay: 200,
                dy: $('.fc-slats tr:eq(18)').outerHeight() * 2, // move down two slots
                callback: function() {
                  expect(options.select).toHaveBeenCalled()
                  done()
                }
              })
            }, 100) // for FF
          })
          it('gets fired correctly when the user selects slots in a different day', function(done) {
            options.select = function(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.isAllDay).toEqual(false)
              expect(arg.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(arg.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(arg.end).toEqualDate('2014-05-29T10:30:00Z')
              expect(arg.endStr).toEqual('2014-05-29T10:30:00Z')
            }
            spyOn(options, 'select').and.callThrough()
            initCalendar(options)
            $('.fc-slats tr:eq(18) td:not(.fc-time)').simulate('drag', { // middle will be 2014-05-28T09:00:00
              dx: $('.fc-day-header:first').outerWidth() * 0.9 * dirSign, // one day ahead
              dy: $('.fc-slats tr:eq(18)').outerHeight() * 2, // move down two slots
              callback: function() {
                expect(options.select).toHaveBeenCalled()
                done()
              }
            })
          })
          it('gets fired correctly when the user selects a single slot', function(done) {
            options.select = function(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.isAllDay).toEqual(false)
              expect(arg.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(arg.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(arg.end).toEqualDate('2014-05-28T09:30:00Z')
              expect(arg.endStr).toEqual('2014-05-28T09:30:00Z')
            }
            spyOn(options, 'select').and.callThrough()
            initCalendar(options)
            $('.fc-slats tr:eq(18) td:not(.fc-time)').simulate('drag', { // middle will be 2014-05-28T09:00:00
              callback: function() {
                expect(options.select).toHaveBeenCalled()
                done()
              }
            })
          })
        })
      })
    })
  })

  describe('when selectMinDistance', function() {
    beforeEach(function() {
      options.selectMinDistance = 10
    })

    it('will fire when dragged beyond distance', function(done) {
      options.select = function() {}
      spyOn(options, 'select').and.callThrough()

      initCalendar(options)

      $('.fc-day[data-date="2014-04-28"]').simulate('drag', {
        dx: 12,
        dy: 0,
        callback: function() {
          expect(options.select).toHaveBeenCalled()
          done()
        }
      })
    })

    it('will not fire when not dragged beyond distance', function(done) {
      options.select = function() {}
      spyOn(options, 'select').and.callThrough()

      initCalendar(options)

      $('.fc-day[data-date="2014-04-28"]').simulate('drag', {
        dx: 8,
        dy: 0,
        callback: function() {
          expect(options.select).not.toHaveBeenCalled()
          done()
        }
      })
    })
  })
})
