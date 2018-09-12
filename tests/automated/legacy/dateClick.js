describe('dateClick', function() {
  pushOptions({
    defaultDate: '2014-05-27',
    selectable: false,
    timeZone: 'UTC'
  });

  [ 'ltr', 'rtl' ].forEach(function(dir) {
    describe('when dir is ' + dir, function() {

      pushOptions({ dir });

      [ false, true ].forEach(function(selectable) {
        describe('when selectable is ' + selectable, function() {
          pushOptions({selectable: selectable})
          describe('when in month view', function() {
            pushOptions({defaultView: 'month'})

            it('fires correctly when clicking on a cell', function(done) {
              var options = {}
              options.dateClick = function(arg) {
                expect(arg.date instanceof Date).toEqual(true)
                expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
                expect(typeof arg.view).toEqual('object') // "
                expect(arg.isAllDay).toEqual(true)
                expect(arg.date).toEqualDate('2014-05-07')
                expect(arg.dateStr).toEqual('2014-05-07')
                done()
              }

              initCalendar(options)

              var dayCell = $('.fc-day:eq(10)') // 2014-05-07 (regardless of dir)

              // for simulating the mousedown/mouseup/click (relevant for selectable)
              dayCell.simulate('drag')
            })
          })

          describe('when in agendaWeek view', function() {
            pushOptions({defaultView: 'agendaWeek'})

            it('fires correctly when clicking on an all-day slot', function(done) {
              var options = {}
              options.dateClick = function(arg) {
                expect(arg.date instanceof Date).toEqual(true)
                expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
                expect(typeof arg.view).toEqual('object') // "
                expect(arg.isAllDay).toEqual(true)
                expect(arg.date).toEqualDate('2014-05-28')
                expect(arg.dateStr).toEqual('2014-05-28')
                done()
              }

              initCalendar(options)

              // 2014-05-28 (regardless of dir)
              var dayContent = $('.fc-agenda-view .fc-day-grid .fc-day:eq(3)')

              // for simulating the mousedown/mouseup/click (relevant for selectable)
              dayContent.simulate('drag')
            })

            it('fires correctly when clicking on a timed slot', function(done) {
              var options = {}
              // make sure the click slot will be in scroll view
              options.contentHeight = 500
              options.scrollTime = '07:00:00'

              options.dateClick = function(arg) {
                expect(arg.date instanceof Date).toEqual(true)
                expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
                expect(typeof arg.view).toEqual('object') // "
                expect(arg.isAllDay).toEqual(false)
                expect(arg.date).toEqualDate('2014-05-28T09:00:00Z')
                expect(arg.dateStr).toEqual('2014-05-28T09:00:00Z')
                done()
              }

              initCalendar(options)

              // the middle is 2014-05-28T09:00:00 (regardless of dir)
              var slotRow = $('.fc-slats tr:eq(18) td:not(.fc-time)')

              // for simulating the mousedown/mouseup/click (relevant for selectable)
              slotRow.simulate('drag')
            })

            // issue 2217
            it('fires correctly when clicking on a timed slot, with minTime set', function(done) {
              var options = {}
              // make sure the click slot will be in scroll view
              options.contentHeight = 500
              options.scrollTime = '07:00:00'
              options.minTime = '02:00:00'

              options.dateClick = function(arg) {
                expect(arg.date instanceof Date).toEqual(true)
                expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
                expect(typeof arg.view).toEqual('object') // "
                expect(arg.isAllDay).toEqual(false)
                expect(arg.date).toEqualDate('2014-05-28T11:00:00Z')
                expect(arg.dateStr).toEqual('2014-05-28T11:00:00Z')
                done()
              }

              initCalendar(options)

              // the middle is 2014-05-28T11:00:00 (regardless of dir)
              var slotRow = $('.fc-slats tr:eq(18) td:not(.fc-time)')

              // for simulating the mousedown/mouseup/click (relevant for selectable)
              slotRow.simulate('drag')
            })
          })
        })
      })
    })
  })

  describe('when touch', function() {

    it('fires correctly when simulated short drag on a cell', function(done) {
      var options = {}
      options.dateClick = function(arg) {
        expect(arg.date instanceof Date).toEqual(true)
        expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
        expect(typeof arg.view).toEqual('object') // "
        expect(arg.isAllDay).toEqual(true)
        expect(arg.date).toEqualDate('2014-05-07')
        expect(arg.dateStr).toEqual('2014-05-07')
        done()
      }

      initCalendar(options)

      var dayCell = $('.fc-day:eq(10)') // 2014-05-07 (regardless of dir)

      // for simulating the mousedown/mouseup/click (relevant for selectable)
      dayCell.simulate('drag', {
        isTouch: true
      })
    })

    it('won\'t fire if touch moves outside of date cell', function(done) {
      var options = {}
      options.dateClick = function(arg) {}
      spyOn(options, 'dateClick').and.callThrough()

      initCalendar(options)

      var startCell = $('.fc-day[data-date="2014-05-07"]')
      var endCell = $('.fc-day[data-date="2014-05-08"]')

      startCell.simulate('drag', {
        // FYI, when debug:true, not a good representation because the minimal  delay is required
        // to recreate bug #3332
        isTouch: true,
        end: endCell,
        callback: function() {
          expect(options.dateClick).not.toHaveBeenCalled()
          done()
        }
      })
    })

    it('fires correctly when simulated click on a cell', function(done) {
      var options = {}
      options.dateClick = function(arg) {
        expect(arg.date instanceof Date).toEqual(true)
        expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
        expect(typeof arg.view).toEqual('object') // "
        expect(arg.isAllDay).toEqual(true)
        expect(arg.date).toEqualDate('2014-05-07')
        expect(arg.dateStr).toEqual('2014-05-07')
        done()
      }

      initCalendar(options)

      var dayCell = $('.fc-day:eq(10)') // 2014-05-07 (regardless of dir)
      $.simulateTouchClick(dayCell)
    })
  })
})
