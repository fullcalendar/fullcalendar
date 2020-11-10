import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import '../lib/dom-misc'

(function() {

  [ 'height', 'contentHeight' ].forEach(function(heightProp) {
    describe(heightProp, function() {
      var $calendarEl
      var heightEl // HTMLElement
      var asAMethod
      var heightPropDescriptions: { description: string, height: string | number, heightWrapper?: boolean }[] = [
        { description: 'as a number', height: 600 }
      ]

      if (heightProp === 'height') {
        heightPropDescriptions.push({ description: 'as "100%"', height: '100%', heightWrapper: true })
      }

      pushOptions({
        initialDate: '2014-08-01'
      })

      beforeEach(function() {
        $calendarEl = $('<div />').appendTo('body').width(900)
      })

      afterEach(function() {
        $calendarEl.remove()
      })

      // relies on asAMethod (boolean)
      // otherOptions: other calendar options to dynamically set (assumes asAMethod)
      function init(heightVal) {
        let calendar

        if (asAMethod) {

          calendar = initCalendar({}, $calendarEl[0])
          let calendarWrapper = new CalendarWrapper(calendar)
          var dateEl = calendarWrapper.getFirstDateEl()

          calendar.setOption(heightProp, heightVal)
          expect(calendarWrapper.getFirstDateEl()).toBe(dateEl)

        } else {
          calendar = initCalendar({ [heightProp]: heightVal }, $calendarEl[0])
        }

        if (heightProp === 'height') {
          heightEl = calendar.el
        } else {
          heightEl = new CalendarWrapper(calendar).getViewEl()
        }

        return calendar
      }

      function expectHeight(heightVal) {
        var diff = Math.abs(heightEl.offsetHeight - heightVal)
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
                initialView: 'dayGridMonth'
              })

              heightPropDescriptions.forEach(function(testInfo) {
                describe(testInfo.description, function() {

                  if (testInfo.heightWrapper) {
                    beforeEach(function() {
                      $calendarEl.wrap('<div id="calendar-container" style="height: 600px;" />')
                    })
                    afterEach(function() {
                      $('#calendar-container').remove()
                    })
                  }

                  describe('when there are no events', function() {
                    it('should be the specified height, with no scrollbars', function() {
                      let calendar = init(testInfo.height)
                      let viewWrapper = new DayGridViewWrapper(calendar)
                      let diff = Math.abs(heightEl.offsetHeight - 600)

                      expect(diff).toBeLessThan(2)
                      expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
                    })
                  })

                  describe('when there is one tall row of events', function() {
                    pushOptions({
                      events: repeatClone({ title: 'event', start: '2014-08-04' }, 9)
                    })

                    it('should take away height from other rows, but not do scrollbars', function() {
                      let calendar = init(testInfo.height)
                      let viewWrapper = new DayGridViewWrapper(calendar)
                      let $rows = $(viewWrapper.dayGrid.getRowEls())
                      let $tallRow = $rows.eq(1)
                      let $shortRows = $rows.not($tallRow) // 0, 2, 3, 4, 5
                      let shortHeight = $shortRows.eq(0).outerHeight()

                      expectHeight(600)

                      $shortRows.each(function(i, node) {
                        let rowHeight = $(node).outerHeight()
                        let diff = Math.abs(rowHeight - shortHeight)
                        expect(diff).toBeLessThan(10) // all roughly the same
                      })

                      expect($tallRow.outerHeight()).toBeGreaterThan(shortHeight * 2) // much taller
                      expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
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
                      let calendar = init(testInfo.height)
                      let viewWrapper = new DayGridViewWrapper(calendar)

                      expectHeight(600)
                      expect(viewWrapper.getScrollerEl()).toHaveScrollbars()
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
                  let calendar = init('auto')
                  let viewWrapper = new DayGridViewWrapper(calendar)

                  expect(heightEl.offsetHeight).toBeGreaterThan(1000) // pretty tall
                  expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
                })
              })
            });

            [ 'dayGridWeek', 'dayGridDay' ].forEach(function(viewName) {
              describe('in ' + viewName + ' view', function() {
                pushOptions({
                  initialView: viewName
                })

                heightPropDescriptions.forEach(function(testInfo) {
                  describe(testInfo.description, function() {
                    if (testInfo.heightWrapper) {
                      beforeEach(function() {
                        $calendarEl.wrap('<div id="calendar-container" style="height: 600px;" />')
                      })
                      afterEach(function() {
                        $('#calendar-container').remove()
                      })
                    }

                    describe('when there are no events', function() {
                      it('should be the specified height, with no scrollbars', function() {
                        let calendar = init(testInfo.height)
                        let viewWrapper = new DayGridViewWrapper(calendar)

                        expectHeight(600)
                        expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
                      })
                    })

                    describe('when there are many events', function() {
                      pushOptions({
                        events: repeatClone({ title: 'event', start: '2014-08-01' }, 100)
                      })

                      it('should have the correct height, with scrollbars', function() {
                        let calendar = init(testInfo.height)
                        let viewWrapper = new DayGridViewWrapper(calendar)

                        expectHeight(600)
                        expect(viewWrapper.getScrollerEl()).toHaveScrollbars()
                      })
                    })
                  })
                })

                describe('as "auto", when there are many events', function() {
                  pushOptions({
                    events: repeatClone({ title: 'event', start: '2014-08-01' }, 100)
                  })
                  it('should be really tall with no scrollbars', function() {
                    let calendar = init('auto')
                    let viewWrapper = new DayGridViewWrapper(calendar)

                    expect(heightEl.offsetHeight).toBeGreaterThan(1000) // pretty tall
                    expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
                  })
                })
              })
            });

            [ 'timeGridWeek', 'timeGridDay' ].forEach(function(viewName) {
              describe('in ' + viewName + ' view', function() {
                pushOptions({
                  initialView: viewName
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
                          $calendarEl.wrap('<div id="calendar-container" style="height: 600px;" />')
                        })
                        afterEach(function() {
                          $('#calendar-container').remove()
                        })
                      }

                      describe('with many slots', function() {
                        pushOptions({
                          slotMinTime: '00:00:00',
                          slotMaxTime: '24:00:00'
                        })
                        it('should be the correct height, with scrollbars', function() {
                          let calendar = init(testInfo.height)
                          let viewWrapper = new TimeGridViewWrapper(calendar)

                          expectHeight(600)
                          expect(viewWrapper.getScrollerEl()).toHaveScrollbars()
                        })
                      })
                    })
                  })

                  describe('as "auto", with only a few slots', function() {
                    pushOptions({
                      slotMinTime: '06:00:00',
                      slotMaxTime: '10:00:00'
                    })
                    it('should be really short with no scrollbars nor horizontal rule', function() {
                      let calendar = init('auto')
                      let viewWrapper = new TimeGridViewWrapper(calendar)

                      expect(heightEl.offsetHeight).toBeLessThan(500) // pretty short
                      expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
                    })
                  })

                  describe('as a "auto", with many slots', function() {
                    pushOptions({
                      slotMinTime: '00:00:00',
                      slotMaxTime: '24:00:00'
                    })

                    it('should be really tall with no scrollbars nor horizontal rule', function() {
                      let calendar = init('auto')
                      let viewWrapper = new TimeGridViewWrapper(calendar)

                      expect(heightEl.offsetHeight).toBeGreaterThan(900) // pretty tall
                      expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
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


  it('no height oscillation happens', function() {
    let $container = $(
      '<div style="width:301px;height:300px;overflow-y:auto">' +
      '<div style="margin:0"></div>' +
      '</div>'
    ).appendTo('body')

    // will freeze browser if bug exists :)
    let calendar = initCalendar({
      headerToolbar: false,
      initialView: 'dayGridMonth',
      aspectRatio: 1
    }, $container.find('div')[0])

    calendar.destroy()
    $container.remove()
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
