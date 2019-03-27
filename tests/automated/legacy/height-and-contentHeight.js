import { getFirstDateEl } from '../lib/ViewUtils'

(function() {

  [ 'height', 'contentHeight' ].forEach(function(heightProp) {
    describe(heightProp, function() {
      var calendarEl
      var heightElm
      var asAMethod

      /** @type {any} */
      var heightPropDescriptions = [
        { description: 'as a number', height: 600 },
        { description: 'as a function', height: getParentHeight, heightWrapper: true }
      ]

      if (heightProp === 'height') {
        heightPropDescriptions.push({ description: 'as "parent"', height: 'parent', heightWrapper: true })
      }

      pushOptions({
        defaultDate: '2014-08-01'
      })

      beforeEach(function() {
        calendarEl = $('<div />').appendTo('body').width(900)
      })

      afterEach(function() {
        calendarEl.remove()
      })

      function getParentHeight() {
        return calendarEl.parent().height()
      }

      // relies on asAMethod (boolean)
      // otherOptions: other calendar options to dynamically set (assumes asAMethod)
      function init(heightVal) {

        if (asAMethod) {

          initCalendar({}, calendarEl)
          var dateEl = getFirstDateEl()
          currentCalendar.setOption(heightProp, heightVal)
          expect(getFirstDateEl()).toBe(dateEl)

        } else {
          initCalendar({ [heightProp]: heightVal }, calendarEl)
        }

        if (heightProp === 'height') {
          heightElm = $('.fc')
        } else {
          heightElm = $('.fc-view')
        }
      }

      function expectHeight(heightVal) {
        var diff = Math.abs(heightElm.outerHeight() - heightVal)
        expect(diff).toBeLessThan(2) // off-by-one or exactly the same. for zoom, and firefox
      }

      $.each({
        'as an init option': false,
        'as a method': true
      }, function(desc, bool) {
        describe(desc, function() {

          beforeEach(function() {
            asAMethod = bool
          })

          describe('for ' + heightProp, function() {
            describe('when in month view', function() {
              pushOptions({
                defaultView: 'dayGridMonth'
              })

              heightPropDescriptions.forEach(function(testInfo) {
                describe(testInfo.description, function() {

                  if (testInfo.heightWrapper) {
                    beforeEach(function() {
                      calendarEl.wrap('<div id="calendar-container" style="height: 600px;" />')
                    })
                    afterEach(function() {
                      $('#calendar-container').remove()
                    })
                  }

                  describe('when there are no events', function() {
                    it('should be the specified height, with no scrollbars', function() {
                      var diff
                      init(testInfo.height)
                      diff = Math.abs(heightElm.outerHeight() - 600)
                      expect(diff).toBeLessThan(2)
                      expect('.fc-day-grid-container').not.toHaveScrollbars()
                    })
                  })

                  describe('when there is one tall row of events', function() {
                    pushOptions({
                      events: repeatClone({ title: 'event', start: '2014-08-04' }, 9)
                    })

                    it('should take away height from other rows, but not do scrollbars', function() {
                      init(testInfo.height)
                      var rows = $('.fc-day-grid .fc-row')
                      var tallRow = rows.eq(1)
                      var shortRows = rows.not(tallRow) // 0, 2, 3, 4, 5
                      var shortHeight = shortRows.eq(0).outerHeight()

                      expectHeight(600)

                      shortRows.each(function(i, node) {
                        var rowHeight = $(node).outerHeight()
                        var diff = Math.abs(rowHeight - shortHeight)
                        expect(diff).toBeLessThan(10) // all roughly the same
                      })

                      expect(tallRow.outerHeight()).toBeGreaterThan(shortHeight * 2) // much taller
                      expect('.fc-day-grid-container').not.toHaveScrollbars()
                    })
                  })

                  describe('when there are many tall rows of events', function() {
                    pushOptions({
                      events: [].concat(
                        repeatClone({ title: 'event0', start: '2014-07-28' }, 9),
                        repeatClone({ title: 'event1', start: '2014-08-04' }, 9),
                        repeatClone({ title: 'event2', start: '2014-08-11' }, 9),
                        repeatClone({ title: 'event3', start: '2014-08-18' }, 9),
                        repeatClone({ title: 'event4', start: '2014-08-25' }, 9),
                        repeatClone({ title: 'event5', start: '2014-09-01' }, 9)
                      )
                    })

                    it('height is correct and scrollbars show up', function() {
                      init(testInfo.height)
                      expectHeight(600)
                      expect($('.fc-day-grid-container')).toHaveScrollbars()
                    })
                  })
                })
              })

              describe('as "auto", when there are many tall rows of events', function() {
                pushOptions({
                  events: [].concat(
                    repeatClone({ title: 'event0', start: '2014-07-28' }, 9),
                    repeatClone({ title: 'event1', start: '2014-08-04' }, 9),
                    repeatClone({ title: 'event2', start: '2014-08-11' }, 9),
                    repeatClone({ title: 'event3', start: '2014-08-18' }, 9),
                    repeatClone({ title: 'event4', start: '2014-08-25' }, 9),
                    repeatClone({ title: 'event5', start: '2014-09-01' }, 9)
                  )
                })
                it('height is really tall and there are no scrollbars', function() {
                  init('auto')
                  expect(heightElm.outerHeight()).toBeGreaterThan(1000) // pretty tall
                  expect($('.fc-day-grid-container')).not.toHaveScrollbars()
                })
              })
            });

            [ 'dayGridWeek', 'dayGridDay' ].forEach(function(viewName) {
              describe('in ' + viewName + ' view', function() {
                pushOptions({
                  defaultView: viewName
                })

                heightPropDescriptions.forEach(function(testInfo) {
                  describe(testInfo.description, function() {
                    if (testInfo.heightWrapper) {
                      beforeEach(function() {
                        calendarEl.wrap('<div id="calendar-container" style="height: 600px;" />')
                      })
                      afterEach(function() {
                        $('#calendar-container').remove()
                      })
                    }

                    describe('when there are no events', function() {
                      it('should be the specified height, with no scrollbars', function() {
                        init(testInfo.height)
                        expectHeight(600)
                        expect('.fc-day-grid-container').not.toHaveScrollbars()
                      })
                    })

                    describe('when there are many events', function() {
                      pushOptions({
                        events: repeatClone({ title: 'event', start: '2014-08-01' }, 100)
                      })
                      it('should have the correct height, with scrollbars', function() {
                        init(testInfo.height)
                        expectHeight(600)
                        expect('.fc-day-grid-container').toHaveScrollbars()
                      })
                    })
                  })
                })

                describe('as "auto", when there are many events', function() {
                  pushOptions({
                    events: repeatClone({ title: 'event', start: '2014-08-01' }, 100)
                  })
                  it('should be really tall with no scrollbars', function() {
                    init('auto')
                    expect(heightElm.outerHeight()).toBeGreaterThan(1000) // pretty tall
                    expect('.fc-day-grid-container').not.toHaveScrollbars()
                  })
                })
              })
            });

            [ 'timeGridWeek', 'timeGridDay' ].forEach(function(viewName) {
              describe('in ' + viewName + ' view', function() {
                pushOptions({
                  defaultView: viewName
                })

                describeOptions({
                  'with no all-day section': { allDaySlot: false },
                  'with no all-day events': { },
                  'with some all-day events': { events: repeatClone({ title: 'event', start: '2014-08-01' }, 6) }
                }, function() {

                  heightPropDescriptions.forEach(function(testInfo) {
                    describe(testInfo.description, function() {
                      if (testInfo.heightWrapper) {
                        beforeEach(function() {
                          calendarEl.wrap('<div id="calendar-container" style="height: 600px;" />')
                        })
                        afterEach(function() {
                          $('#calendar-container').remove()
                        })
                      }

                      describe('with only a few slots', function() {
                        pushOptions({
                          minTime: '06:00:00',
                          maxTime: '10:00:00'
                        })
                        it('should be the correct height, with a horizontal rule to occupy space', function() {
                          init(testInfo.height)
                          expectHeight(600)
                          expect($('.fc-time-grid > hr')).toBeVisible()
                        })
                      })

                      describe('with many slots', function() {
                        pushOptions({
                          minTime: '00:00:00',
                          maxTime: '24:00:00'
                        })
                        it('should be the correct height, with scrollbars and no filler hr', function() {
                          init(testInfo.height)
                          expectHeight(600)
                          expect($('.fc-time-grid-container')).toHaveScrollbars()
                          expect($('.fc-time-grid > hr')).not.toBeVisible()
                        })
                      })
                    })
                  })

                  describe('as "auto", with only a few slots', function() {
                    pushOptions({
                      minTime: '06:00:00',
                      maxTime: '10:00:00'
                    })
                    it('should be really short with no scrollbars nor horizontal rule', function() {
                      init('auto')
                      expect(heightElm.outerHeight()).toBeLessThan(500) // pretty short
                      expect($('.fc-time-grid-container')).not.toHaveScrollbars()
                      expect($('.fc-time-grid > hr')).not.toBeVisible()
                    })
                  })

                  describe('as a "auto", with many slots', function() {
                    pushOptions({
                      minTime: '00:00:00',
                      maxTime: '24:00:00'
                    })
                    it('should be really tall with no scrollbars nor horizontal rule', function() {
                      init('auto')
                      expect(heightElm.outerHeight()).toBeGreaterThan(900) // pretty tall
                      expect($('.fc-time-grid-container')).not.toHaveScrollbars()
                      expect($('.fc-time-grid > hr')).not.toBeVisible()
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })


  function repeatClone(srcObj, times) {
    var a = []
    var i

    for (i = 0; i < times; i++) {
      a.push($.extend({}, srcObj))
    }

    return a
  }

})()
