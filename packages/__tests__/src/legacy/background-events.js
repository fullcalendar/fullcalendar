import { RED_REGEX } from '../lib/dom-misc'
import {
  getBackgroundEventEls,
  getEventEls,
  getSingleBackgroundEventEl
} from '../event-render/EventRenderUtils'
import {
  getBackgroundEventElsResizerEls,
  getDayGridNonBusinessDayEls,
  getNonBusinessDayEls,
  getDayGridRowEls

} from '../view-render/DayGridRenderUtils'
import {
  getTimeGridNonBusinessDayEls,
  queryBgEventsInCol,
  queryNonBusinessSegsInCol
} from '../lib/time-grid'

describe('background events', function() {

  // SEE ALSO: event-color.js
  pushOptions({
    defaultDate: '2014-11-04',
    scrollTime: '00:00'
  })

  describe('when in month view', function() {
    pushOptions({ defaultView: 'dayGridMonth' })

    describe('when LTR', function() {
      it('render correctly on a single day', function(done) {
        var options = {}
        options.events = [ {
          title: 'hi',
          start: '2014-11-04',
          rendering: 'background'
        } ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
          expect(getSingleBackgroundEventEl()).toBeLeftOf('.fc-day[data-date="2014-11-05"]')
          expect(getEventEls().length).toBe(0)
          expect(getBackgroundEventElsResizerEls().length).toBe(0) // can't resize
          done()
        }
        initCalendar(options)
      })
      it('render correctly spanning multiple weeks', function(done) {
        var options = {}
        options.events = [ {
          title: 'hi',
          start: '2014-11-04',
          end: '2014-11-11',
          rendering: 'background'
        } ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(2)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
          expect(getBackgroundEventEls().eq(0)).toBeRightOf('.fc-day[data-date="2014-11-03"]')
          expect(getBackgroundEventEls().eq(1)).toBeLeftOf('.fc-day[data-date="2014-11-12"]')
          expect(getEventEls().length).toBe(0)
          done()
        }
        initCalendar(options)
      })
      it('render correctly when two span on top of each other', function(done) {
        var options = {}
        options.events = [
          {
            start: '2014-11-04',
            end: '2014-11-07',
            rendering: 'background'
          },
          {
            start: '2014-11-05',
            end: '2014-11-08',
            rendering: 'background'
          }
        ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(2)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(2)
          expect(getBackgroundEventEls().eq(0)).toBeRightOf('.fc-day[data-date="2014-11-02"]')
          expect(getBackgroundEventEls().eq(1)).toBeLeftOf('.fc-day[data-date="2014-11-08"]')
          expect(getEventEls().length).toBe(0)
          done()
        }
        initCalendar(options)
      })
      describe('when weekNumbers', function() {
        it('renders to right of week numbers', function(done) {
          var options = {}
          options.weekNumbers = true
          options.events = [ {
            start: '2014-11-02',
            end: '2014-11-09',
            rendering: 'background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
            expect(getBackgroundEventEls()).toBeRightOf('.fc-day-grid .fc-row:eq(1) .fc-week-number')
            expect(getEventEls().length).toBe(0)
            done()
          }
          initCalendar(options)
        })
      })
      it('renders "business hours" on whole days', function(done) {
        var options = {}
        options.businessHours = true
        options._eventsPositioned = function() {
          setTimeout(function() { // no trigger when business hours renders. this will have to do.
            expect(getNonBusinessDayEls().length).toBe(12) // there are 6 weeks. 2 weekend days each
            done()
          }, 0)
        }
        initCalendar(options)
      })
    })

    describe('when RTL', function() {
      pushOptions({dir: 'rtl'})

      it('render correctly on a single day', function(done) {
        var options = {}
        options.events = [ {
          title: 'hi',
          start: '2014-11-04',
          rendering: 'background'
        } ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
          expect(getBackgroundEventEls()).toBeRightOf('.fc-day[data-date="2014-11-06"]')
          expect(getEventEls().length).toBe(0)
          done()
        }
        initCalendar(options)
      })
      it('render correctly spanning multiple weeks', function(done) {
        var options = {}
        options.events = [ {
          title: 'hi',
          start: '2014-11-04',
          end: '2014-11-11',
          rendering: 'background'
        } ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(2)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
          expect(getBackgroundEventEls().eq(0)).toBeLeftOf('.fc-day[data-date="2014-11-02"]')
          expect(getBackgroundEventEls().eq(1)).toBeRightOf('.fc-day[data-date="2014-11-12"]')
          expect(getEventEls().length).toBe(0)
          done()
        }
        initCalendar(options)
      })
      describe('when weekNumbers', function() {
        it('renders to left of week numbers', function(done) {
          var options = {}
          options.weekNumbers = true
          options.events = [ {
            start: '2014-11-02',
            end: '2014-11-09',
            rendering: 'background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
            expect(getBackgroundEventEls()).toBeLeftOf('.fc-day-grid .fc-row:eq(1) .fc-week-number span')
            expect(getEventEls().length).toBe(0)
            done()
          }
          initCalendar(options)
        })
      })
    })

    describe('when inverse', function() {

      describe('when LTR', function() {
        it('render correctly on a single day', function(done) {
          var options = {}
          options.events = [ {
            title: 'hi',
            start: '2014-11-04',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(7)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(0)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(2)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(3)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(4)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(5)).length).toBe(1)

            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).eq(0))
              .toBeLeftOf('.fc-day[data-date="2014-11-05"]')
            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).eq(1))
              .toBeRightOf('.fc-day[data-date="2014-11-03"]')

            expect(getEventEls().length).toBe(0)
            done()
          }
          initCalendar(options)
        })
        it('render correctly spanning multiple weeks', function(done) {
          var options = {}
          options.events = [ {
            title: 'hi',
            start: '2014-11-04',
            end: '2014-11-11',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(6)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(0)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(3)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(4)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(5)).length).toBe(1)

            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).eq(0))
              .toBeLeftOf('.fc-day[data-date="2014-11-05"]')

            expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).eq(0))
              .toBeRightOf('.fc-day[data-date="2014-11-09"]')

            expect(getEventEls().length).toBe(0)
            done()
          }
          initCalendar(options)
        })
        it('render correctly when starts before start of month', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-10-24',
            end: '2014-11-06',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(5)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(0)).length).toBe(0)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(3)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(4)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(5)).length).toBe(1)

            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)))
              .toBeRightOf('.fc-day[data-date="2014-11-04"]')

            done()
          }
          initCalendar(options)
        })
        it('render correctly when ends after end of month', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-11-27',
            end: '2014-12-08',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(5)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(0)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(3)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(4)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(5)).length).toBe(0)

            expect(getBackgroundEventEls(getDayGridRowEls().eq(4)))
              .toBeLeftOf('.fc-day[data-date="2014-11-28"]')

            done()
          }
          initCalendar(options)
        })
        it('render correctly with two related events, in reverse order', function(done) {
          var options = {}
          options.events = [
            {
              groupId: 'hi',
              start: '2014-11-06',
              rendering: 'inverse-background'
            },
            {
              groupId: 'hi',
              start: '2014-11-04',
              rendering: 'inverse-background'
            }
          ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(8)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(0)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(3)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(3)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(4)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(5)).length).toBe(1)

            /* order in DOM is reversed
            expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(0)'))
              .toBeLeftOf('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(1)')
            expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(1)'))
              .toBeLeftOf('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(2)')
            */

            done()
          }
          initCalendar(options)
        })
      })

      describe('when RTL', function() {
        pushOptions({ dir: 'rtl' })

        it('render correctly on a single day', function(done) {
          var options = {}
          options.events = [ {
            title: 'hi',
            start: '2014-11-04',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(7)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(0)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(2)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(3)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(4)).length).toBe(1)
            expect(getBackgroundEventEls(getDayGridRowEls().eq(5)).length).toBe(1)

            /* order in DOM is reversed
            expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(0)'))
              .toBeLeftOf('.fc-day[data-date="2014-11-03"]')
            expect($('.fc-day-grid .fc-row:eq(1) .fc-bgevent:eq(1)'))
              .toBeRightOf('.fc-day[data-date="2014-11-05"]')
            */

            done()
          }
          initCalendar(options)
        })
      })
    })

    describe('when in month view', function() {
      // disabled for v4
      xit('can be activated when rendering set on the source', function(done) {
        var options = {}
        options.defaultView = 'dayGridMonth'
        options.eventSources = [ {
          rendering: 'background',
          events: [ {
            start: '2014-11-04'
          } ]
        } ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(1)
          expect(getEventEls().length).toBe(0)
          done()
        }
        initCalendar(options)
      })
    })

    describe('when in timeGrid view and timed event', function() {
      // disabled for v4
      xit('can be activated when rendering set on the source', function(done) {
        var options = {}
        options.defaultView = 'timeGridWeek'
        options.eventSources = [ {
          rendering: 'background',
          events: [ {
            start: '2014-11-04T01:00:00'
          } ]
        } ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(1)
          expect(getEventEls().length).toBe(0)
          done()
        }
        initCalendar(options)
      })
    })
  })

  describe('when in week view', function() {
    pushOptions({ defaultView: 'timeGridWeek' })

    describe('when LTR', function() {
      it('render correctly on one day', function(done) {
        var options = {}
        options.events = [ {
          start: '2014-11-04T01:00:00',
          end: '2014-11-04T05:00:00',
          rendering: 'background'
        } ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(1)
          expect(queryBgEventsInCol(2).length).toBe(1) // column 2
          expect(getBackgroundEventEls()).toBeBelow('.fc-slats tr:eq(0)') // should be 1am (eq(1)) but FF cmplaning
          expect(getBackgroundEventEls()).toBeAbove('.fc-slats tr:eq(10)') // 5am
          expect(getEventEls().length).toBe(0)
          expect(getBackgroundEventElsResizerEls().length).toBe(0) // can't resize
          done()
        }
        initCalendar(options)
      })
      it('render correctly spanning multiple days', function(done) {
        var options = {}
        options.events = [ {
          start: '2014-11-04T01:00:00',
          end: '2014-11-05T05:00:00',
          rendering: 'background'
        } ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(2)
          expect(queryBgEventsInCol(2).length).toBe(1)
          expect(queryBgEventsInCol(3).length).toBe(1)
          // TODO: maybe check y coords
          done()
        }
        initCalendar(options)
      })
      it('render correctly when two span on top of each other', function(done) {
        var options = {}
        options.events = [
          {
            start: '2014-11-04T01:00:00',
            end: '2014-11-05T05:00:00',
            rendering: 'background'
          },
          {
            start: '2014-11-04T03:00:00',
            end: '2014-11-05T08:00:00',
            rendering: 'background'
          }
        ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(4)
          expect(queryBgEventsInCol(2).length).toBe(2)
          expect(queryBgEventsInCol(3).length).toBe(2)
          // TODO: maybe check y coords
          done()
        }
        initCalendar(options)
      })
      describe('when businessHours', function() {
        it('renders correctly if assumed default', function() {
          var options = {}
          options.businessHours = true
          initCalendar(options)
          expect(getDayGridNonBusinessDayEls().length).toBe(2) // whole days in the day area
          expect(getTimeGridNonBusinessDayEls().length).toBe(12) // strips of gray on the timed area
        })
        it('renders correctly if custom', function() {
          var options = {}
          options.businessHours = {
            startTime: '02:00',
            endTime: '06:00',
            daysOfWeek: [ 1, 2, 3, 4 ] // Mon-Thu
          }
          initCalendar(options)

          // whole days
          expect(getDayGridNonBusinessDayEls().length).toBe(2) // each multi-day stretch is one element

          // time area
          expect(getTimeGridNonBusinessDayEls().length).toBe(11)
          expect(queryNonBusinessSegsInCol(0).length).toBe(1)
          expect(queryNonBusinessSegsInCol(1).length).toBe(2)
          expect(queryNonBusinessSegsInCol(2).length).toBe(2)
          expect(queryNonBusinessSegsInCol(3).length).toBe(2)
          expect(queryNonBusinessSegsInCol(4).length).toBe(2)
          expect(queryNonBusinessSegsInCol(5).length).toBe(1)
          expect(queryNonBusinessSegsInCol(6).length).toBe(1)
        })
      })
    })
    describe('when RTL', function() {
      pushOptions({ dir: 'rtl' })
      it('render correctly on one day', function(done) {
        var options = {}
        options.events = [ {
          start: '2014-11-04T01:00:00',
          end: '2014-11-04T05:00:00',
          rendering: 'background'
        } ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(1)
          expect(queryBgEventsInCol(4).length).toBe(1)
          expect(getBackgroundEventEls()).toBeBelow('.fc-slats tr:eq(0)') // should be 1am (eq(1)) but FF cmplaining
          expect(getBackgroundEventEls()).toBeAbove('.fc-slats tr:eq(10)') // 5am
          done()
        }
        initCalendar(options)
      })
      it('render correctly spanning multiple days', function(done) {
        var options = {}
        options.events = [ {
          start: '2014-11-04T01:00:00',
          end: '2014-11-05T05:00:00',
          rendering: 'background'
        } ]
        options._eventsPositioned = function() {
          expect(getBackgroundEventEls().length).toBe(2)
          expect(queryBgEventsInCol(3).length).toBe(1)
          expect(queryBgEventsInCol(4).length).toBe(1)
          done()
        }
        initCalendar(options)
      })
      describe('when businessHours', function() {
        it('renders correctly if custom', function() {
          var options = {}
          options.businessHours = {
            startTime: '02:00',
            endTime: '06:00',
            daysOfWeek: [ 1, 2, 3, 4 ] // Mon-Thu
          }
          initCalendar(options)

          // whole days
          expect(getDayGridNonBusinessDayEls().length).toBe(2) // each stretch of days is one element

          // time area
          expect(getTimeGridNonBusinessDayEls().length).toBe(11)
          expect(queryNonBusinessSegsInCol(0).length).toBe(1)
          expect(queryNonBusinessSegsInCol(1).length).toBe(1)
          expect(queryNonBusinessSegsInCol(2).length).toBe(2)
          expect(queryNonBusinessSegsInCol(3).length).toBe(2)
          expect(queryNonBusinessSegsInCol(4).length).toBe(2)
          expect(queryNonBusinessSegsInCol(5).length).toBe(2)
          expect(queryNonBusinessSegsInCol(6).length).toBe(1)
        })
      })
    })

    describe('when inverse', function() {

      describe('when LTR', function() {

        it('render correctly on one day', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T05:00:00',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(8)
            expect(queryBgEventsInCol(0).length).toBe(1)
            expect(queryBgEventsInCol(1).length).toBe(1)
            expect(queryBgEventsInCol(2).length).toBe(2)
            expect(queryBgEventsInCol(3).length).toBe(1)
            expect(queryBgEventsInCol(4).length).toBe(1)
            expect(queryBgEventsInCol(5).length).toBe(1)
            expect(queryBgEventsInCol(6).length).toBe(1)
            // TODO: maybe check y coords
            done()
          }
          initCalendar(options)
        })

        it('render correctly spanning multiple days', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-11-04T01:00:00',
            end: '2014-11-05T05:00:00',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(7)
            expect(queryBgEventsInCol(0).length).toBe(1)
            expect(queryBgEventsInCol(1).length).toBe(1)
            expect(queryBgEventsInCol(2).length).toBe(1)
            expect(queryBgEventsInCol(3).length).toBe(1)
            expect(queryBgEventsInCol(4).length).toBe(1)
            expect(queryBgEventsInCol(5).length).toBe(1)
            expect(queryBgEventsInCol(6).length).toBe(1)
            // TODO: maybe check y coords
            done()
          }
          initCalendar(options)
        })

        it('render correctly when starts before start of week', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-10-30T01:00:00',
            end: '2014-11-04T05:00:00',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(5)
            expect(queryBgEventsInCol(0).length).toBe(0)
            expect(queryBgEventsInCol(1).length).toBe(0)
            expect(queryBgEventsInCol(2).length).toBe(1)
            expect(queryBgEventsInCol(3).length).toBe(1)
            expect(queryBgEventsInCol(4).length).toBe(1)
            expect(queryBgEventsInCol(5).length).toBe(1)
            expect(queryBgEventsInCol(6).length).toBe(1)
            // TODO: maybe check y coords
            done()
          }
          initCalendar(options)
        })

        it('render correctly when ends after end of week', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-11-04T01:00:00',
            end: '2014-11-12T05:00:00',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(3)
            expect(queryBgEventsInCol(0).length).toBe(1)
            expect(queryBgEventsInCol(1).length).toBe(1)
            expect(queryBgEventsInCol(2).length).toBe(1)
            // TODO: maybe check y coords
            done()
          }
          initCalendar(options)
        })

        it('render correctly with two related events, in reverse order', function(done) {
          var options = {}
          options.events = [
            {
              groupId: 'hello',
              start: '2014-11-05T01:00:00',
              end: '2014-11-05T05:00:00',
              rendering: 'inverse-background'
            },
            {
              groupId: 'hello',
              start: '2014-11-03T01:00:00',
              end: '2014-11-03T05:00:00',
              rendering: 'inverse-background'
            }
          ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(9)
            expect(queryBgEventsInCol(0).length).toBe(1)
            expect(queryBgEventsInCol(1).length).toBe(2)
            expect(queryBgEventsInCol(2).length).toBe(1)
            expect(queryBgEventsInCol(3).length).toBe(2)
            expect(queryBgEventsInCol(4).length).toBe(1)
            expect(queryBgEventsInCol(5).length).toBe(1)
            expect(queryBgEventsInCol(6).length).toBe(1)
            // TODO: maybe check y coords
            done()
          }
          initCalendar(options)
        })

        it('render correctly with two related events, nested', function(done) {
          var options = {}
          options.events = [
            {
              groupId: 'hello',
              start: '2014-11-05T01:00:00',
              end: '2014-11-05T05:00:00',
              rendering: 'inverse-background'
            },
            {
              groupId: 'hello',
              start: '2014-11-05T02:00:00',
              end: '2014-11-05T04:00:00',
              rendering: 'inverse-background'
            }
          ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(8)
            expect(queryBgEventsInCol(0).length).toBe(1)
            expect(queryBgEventsInCol(1).length).toBe(1)
            expect(queryBgEventsInCol(2).length).toBe(1)
            expect(queryBgEventsInCol(3).length).toBe(2)
            expect(queryBgEventsInCol(4).length).toBe(1)
            expect(queryBgEventsInCol(5).length).toBe(1)
            expect(queryBgEventsInCol(6).length).toBe(1)

            expect(getBackgroundEventEls().eq(3)).toBeAbove('.fc-slats tr:eq(2)') // first part before 1am
            expect(getBackgroundEventEls().eq(4)).toBeBelow('.fc-slats tr:eq(9)') // second part after 5am

            done()
          }
          initCalendar(options)
        })

      })

      describe('when RTL', function() {
        pushOptions({ dir: 'rtl' })
        it('render correctly on one day', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T05:00:00',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(8)
            expect(queryBgEventsInCol(0).length).toBe(1)
            expect(queryBgEventsInCol(1).length).toBe(1)
            expect(queryBgEventsInCol(2).length).toBe(1)
            expect(queryBgEventsInCol(3).length).toBe(1)
            expect(queryBgEventsInCol(4).length).toBe(2)
            expect(queryBgEventsInCol(5).length).toBe(1)
            expect(queryBgEventsInCol(6).length).toBe(1)
            // TODO: maybe check y coords
            done()
          }
          initCalendar(options)
        })
      })

      describe('when out of view range', function() {
        it('should still render', function(done) {
          var options = {}
          options.events = [ {
            start: '2014-01-01T01:00:00',
            end: '2014-01-01T05:00:00',
            rendering: 'inverse-background'
          } ]
          options._eventsPositioned = function() {
            expect(getBackgroundEventEls().length).toBe(7)
            done()
          }
          initCalendar(options)
        })
      })
    })

    it('can have custom Event Object color', function(done) {
      var options = {}
      options.events = [ {
        start: '2014-11-04T01:00:00',
        rendering: 'background',
        color: 'red'
      } ]
      options._eventsPositioned = function() {
        expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
        done()
      }
      initCalendar(options)
    })

    it('can have custom Event Object backgroundColor', function(done) {
      var options = {}
      options.events = [ {
        start: '2014-11-04T01:00:00',
        rendering: 'background',
        backgroundColor: 'red'
      } ]
      options._eventsPositioned = function() {
        expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
        done()
      }
      initCalendar(options)
    })

    it('can have custom Event Source color', function(done) {
      var options = {}
      options.eventSources = [ {
        color: 'red',
        events: [ {
          start: '2014-11-04T01:00:00',
          rendering: 'background'
        } ]
      } ]
      options._eventsPositioned = function() {
        expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
        done()
      }
      initCalendar(options)
    })

    it('can have custom Event Source backgroundColor', function(done) {
      var options = {}
      options.eventSources = [ {
        backgroundColor: 'red',
        events: [ {
          start: '2014-11-04T01:00:00',
          rendering: 'background'
        } ]
      } ]
      options._eventsPositioned = function() {
        expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
        done()
      }
      initCalendar(options)
    })

    it('is affected by global eventColor', function(done) {
      var options = {}
      options.eventColor = 'red'
      options.eventSources = [ {
        events: [ {
          start: '2014-11-04T01:00:00',
          rendering: 'background'
        } ]
      } ]
      options._eventsPositioned = function() {
        expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
        done()
      }
      initCalendar(options)
    })

    it('is affected by global eventBackgroundColor', function(done) {
      var options = {}
      options.eventBackgroundColor = 'red'
      options.eventSources = [ {
        events: [ {
          start: '2014-11-04T01:00:00',
          rendering: 'background'
        } ]
      } ]
      options._eventsPositioned = function() {
        expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
        done()
      }
      initCalendar(options)
    })
  })
})
