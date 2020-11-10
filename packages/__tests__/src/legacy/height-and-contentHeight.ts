import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import '../lib/dom-misc'

['height', 'contentHeight'].forEach((heightProp) => {
  describe(heightProp, () => {
    let $calendarEl
    let heightEl // HTMLElement
    let asAMethod
    let heightPropDescriptions: { description: string, height: string | number, heightWrapper?: boolean }[] = [
      { description: 'as a number', height: 600 },
    ]

    if (heightProp === 'height') {
      heightPropDescriptions.push({ description: 'as "100%"', height: '100%', heightWrapper: true })
    }

    pushOptions({
      initialDate: '2014-08-01',
    })

    beforeEach(() => {
      $calendarEl = $('<div />').appendTo('body').width(900)
    })

    afterEach(() => {
      $calendarEl.remove()
    })

    // relies on asAMethod (boolean)
    // otherOptions: other calendar options to dynamically set (assumes asAMethod)
    function init(heightVal) {
      let calendar

      if (asAMethod) {
        calendar = initCalendar({}, $calendarEl[0])
        let calendarWrapper = new CalendarWrapper(calendar)
        let dateEl = calendarWrapper.getFirstDateEl()

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
      let diff = Math.abs(heightEl.offsetHeight - heightVal)
      expect(diff).toBeLessThan(2) // off-by-one or exactly the same. for zoom, and firefox
    }

    $.each({
      'as an init option': false,
      'as a method': true,
    }, (desc, bool) => {
      describe(desc, () => {
        beforeEach(() => {
          asAMethod = bool
        })

        describe('for ' + heightProp, () => {
          describe('when in month view', () => {
            pushOptions({
              initialView: 'dayGridMonth',
            })

            heightPropDescriptions.forEach((testInfo) => {
              describe(testInfo.description, () => {
                if (testInfo.heightWrapper) {
                  beforeEach(() => {
                    $calendarEl.wrap('<div id="calendar-container" style="height: 600px;" />')
                  })
                  afterEach(() => {
                    $('#calendar-container').remove()
                  })
                }

                describe('when there are no events', () => {
                  it('should be the specified height, with no scrollbars', () => {
                    let calendar = init(testInfo.height)
                    let viewWrapper = new DayGridViewWrapper(calendar)
                    let diff = Math.abs(heightEl.offsetHeight - 600)

                    expect(diff).toBeLessThan(2)
                    expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
                  })
                })

                describe('when there is one tall row of events', () => {
                  pushOptions({
                    events: repeatClone({ title: 'event', start: '2014-08-04' }, 9),
                  })

                  it('should take away height from other rows, but not do scrollbars', () => {
                    let calendar = init(testInfo.height)
                    let viewWrapper = new DayGridViewWrapper(calendar)
                    let $rows = $(viewWrapper.dayGrid.getRowEls())
                    let $tallRow = $rows.eq(1)
                    let $shortRows = $rows.not($tallRow) // 0, 2, 3, 4, 5
                    let shortHeight = $shortRows.eq(0).outerHeight()

                    expectHeight(600)

                    $shortRows.each((i, node) => {
                      let rowHeight = $(node).outerHeight()
                      let diff = Math.abs(rowHeight - shortHeight)
                      expect(diff).toBeLessThan(10) // all roughly the same
                    })

                    expect($tallRow.outerHeight()).toBeGreaterThan(shortHeight * 2) // much taller
                    expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
                  })
                })

                describe('when there are many tall rows of events', () => {
                  pushOptions({
                    events: [].concat(
                      repeatClone({ title: 'event0', start: '2014-07-28' }, 9),
                      repeatClone({ title: 'event1', start: '2014-08-04' }, 9),
                      repeatClone({ title: 'event2', start: '2014-08-11' }, 9),
                      repeatClone({ title: 'event3', start: '2014-08-18' }, 9),
                      repeatClone({ title: 'event4', start: '2014-08-25' }, 9),
                      repeatClone({ title: 'event5', start: '2014-09-01' }, 9),
                    ),
                  })

                  it('height is correct and scrollbars show up', () => {
                    let calendar = init(testInfo.height)
                    let viewWrapper = new DayGridViewWrapper(calendar)

                    expectHeight(600)
                    expect(viewWrapper.getScrollerEl()).toHaveScrollbars()
                  })
                })
              })
            })

            describe('as "auto", when there are many tall rows of events', () => {
              pushOptions({
                events: [].concat(
                  repeatClone({ title: 'event0', start: '2014-07-28' }, 9),
                  repeatClone({ title: 'event1', start: '2014-08-04' }, 9),
                  repeatClone({ title: 'event2', start: '2014-08-11' }, 9),
                  repeatClone({ title: 'event3', start: '2014-08-18' }, 9),
                  repeatClone({ title: 'event4', start: '2014-08-25' }, 9),
                  repeatClone({ title: 'event5', start: '2014-09-01' }, 9),
                ),
              })

              it('height is really tall and there are no scrollbars', () => {
                let calendar = init('auto')
                let viewWrapper = new DayGridViewWrapper(calendar)

                expect(heightEl.offsetHeight).toBeGreaterThan(1000) // pretty tall
                expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
              })
            })
          });

          ['dayGridWeek', 'dayGridDay'].forEach((viewName) => {
            describe('in ' + viewName + ' view', () => {
              pushOptions({
                initialView: viewName,
              })

              heightPropDescriptions.forEach((testInfo) => {
                describe(testInfo.description, () => {
                  if (testInfo.heightWrapper) {
                    beforeEach(() => {
                      $calendarEl.wrap('<div id="calendar-container" style="height: 600px;" />')
                    })
                    afterEach(() => {
                      $('#calendar-container').remove()
                    })
                  }

                  describe('when there are no events', () => {
                    it('should be the specified height, with no scrollbars', () => {
                      let calendar = init(testInfo.height)
                      let viewWrapper = new DayGridViewWrapper(calendar)

                      expectHeight(600)
                      expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
                    })
                  })

                  describe('when there are many events', () => {
                    pushOptions({
                      events: repeatClone({ title: 'event', start: '2014-08-01' }, 100),
                    })

                    it('should have the correct height, with scrollbars', () => {
                      let calendar = init(testInfo.height)
                      let viewWrapper = new DayGridViewWrapper(calendar)

                      expectHeight(600)
                      expect(viewWrapper.getScrollerEl()).toHaveScrollbars()
                    })
                  })
                })
              })

              describe('as "auto", when there are many events', () => {
                pushOptions({
                  events: repeatClone({ title: 'event', start: '2014-08-01' }, 100),
                })
                it('should be really tall with no scrollbars', () => {
                  let calendar = init('auto')
                  let viewWrapper = new DayGridViewWrapper(calendar)

                  expect(heightEl.offsetHeight).toBeGreaterThan(1000) // pretty tall
                  expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
                })
              })
            })
          });

          ['timeGridWeek', 'timeGridDay'].forEach((viewName) => {
            describe('in ' + viewName + ' view', () => {
              pushOptions({
                initialView: viewName,
              })

              describeOptions({
                'with no all-day section': { allDaySlot: false },
                'with no all-day events': { },
                'with some all-day events': { events: repeatClone({ title: 'event', start: '2014-08-01' }, 6) },
              }, () => {
                heightPropDescriptions.forEach((testInfo) => {
                  describe(testInfo.description, () => {
                    if (testInfo.heightWrapper) {
                      beforeEach(() => {
                        $calendarEl.wrap('<div id="calendar-container" style="height: 600px;" />')
                      })
                      afterEach(() => {
                        $('#calendar-container').remove()
                      })
                    }

                    describe('with many slots', () => {
                      pushOptions({
                        slotMinTime: '00:00:00',
                        slotMaxTime: '24:00:00',
                      })
                      it('should be the correct height, with scrollbars', () => {
                        let calendar = init(testInfo.height)
                        let viewWrapper = new TimeGridViewWrapper(calendar)

                        expectHeight(600)
                        expect(viewWrapper.getScrollerEl()).toHaveScrollbars()
                      })
                    })
                  })
                })

                describe('as "auto", with only a few slots', () => {
                  pushOptions({
                    slotMinTime: '06:00:00',
                    slotMaxTime: '10:00:00',
                  })
                  it('should be really short with no scrollbars nor horizontal rule', () => {
                    let calendar = init('auto')
                    let viewWrapper = new TimeGridViewWrapper(calendar)

                    expect(heightEl.offsetHeight).toBeLessThan(500) // pretty short
                    expect(viewWrapper.getScrollerEl()).not.toHaveScrollbars()
                  })
                })

                describe('as a "auto", with many slots', () => {
                  pushOptions({
                    slotMinTime: '00:00:00',
                    slotMaxTime: '24:00:00',
                  })

                  it('should be really tall with no scrollbars nor horizontal rule', () => {
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

it('no height oscillation happens', () => {
  let $container = $(
    '<div style="width:301px;height:300px;overflow-y:auto">' +
    '<div style="margin:0"></div>' +
    '</div>',
  ).appendTo('body')

  // will freeze browser if bug exists :)
  let calendar = initCalendar({
    headerToolbar: false,
    initialView: 'dayGridMonth',
    aspectRatio: 1,
  }, $container.find('div')[0])

  calendar.destroy()
  $container.remove()
})

function repeatClone(srcObj, times) {
  let a = []
  let i

  for (i = 0; i < times; i += 1) {
    a.push($.extend({}, srcObj))
  }

  return a
}
