import { RED_REGEX } from '../lib/dom-misc'
import {
  getBackgroundEventEls,
  getEventEls,
  getSingleBackgroundEventEl
} from '../lib/EventRenderUtils'
import {
  getBackgroundEventElsResizerEls,
  getDayGridNonBusinessDayEls,
  getNonBusinessDayEls,
  getDayGridRowEls
} from '../lib/DayGridRenderUtils'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('background events', function() {

  // SEE ALSO: event-color.js
  pushOptions({
    defaultDate: '2014-11-04',
    scrollTime: '00:00'
  })

  describe('when in month view', function() {
    pushOptions({ defaultView: 'dayGridMonth' })

    describe('when LTR', function() {

      it('render correctly on a single day', function() {
        initCalendar({
          events: [ {
            title: 'hi',
            start: '2014-11-04',
            rendering: 'background'
          } ]
        })
        expect(getBackgroundEventEls().length).toBe(1)
        expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
        expect(getSingleBackgroundEventEl()).toBeLeftOf('.fc-day[data-date="2014-11-05"]')
        expect(getEventEls().length).toBe(0)
        expect(getBackgroundEventElsResizerEls().length).toBe(0) // can't resize
      })

      it('render correctly spanning multiple weeks', function() {
        initCalendar({
          events: [ {
            title: 'hi',
            start: '2014-11-04',
            end: '2014-11-11',
            rendering: 'background'
          } ]
        })
        expect(getBackgroundEventEls().length).toBe(2)
        expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
        expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
        expect(getBackgroundEventEls().eq(0)).toBeRightOf('.fc-day[data-date="2014-11-03"]')
        expect(getBackgroundEventEls().eq(1)).toBeLeftOf('.fc-day[data-date="2014-11-12"]')
        expect(getEventEls().length).toBe(0)
      })

      it('render correctly when two span on top of each other', function() {
        initCalendar({
          events: [
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
        })
        expect(getBackgroundEventEls().length).toBe(2)
        expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(2)
        expect(getBackgroundEventEls().eq(0)).toBeRightOf('.fc-day[data-date="2014-11-02"]')
        expect(getBackgroundEventEls().eq(1)).toBeLeftOf('.fc-day[data-date="2014-11-08"]')
        expect(getEventEls().length).toBe(0)
      })

      describe('when weekNumbers', function() {

        it('renders to right of week numbers', function() {
          initCalendar({
            weekNumbers: true,
            events: [ {
              start: '2014-11-02',
              end: '2014-11-09',
              rendering: 'background'
            } ]
          })
          expect(getBackgroundEventEls().length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
          expect(getBackgroundEventEls()).toBeRightOf('.fc-day-grid .fc-row:eq(1) .fc-week-number')
          expect(getEventEls().length).toBe(0)
        })
      })

      it('renders "business hours" on whole days', function() {
        initCalendar({
          businessHours: true
        })
        expect(getNonBusinessDayEls().length).toBe(12) // there are 6 weeks. 2 weekend days each
      })
    })

    describe('when RTL', function() {
      pushOptions({dir: 'rtl'})

      it('render correctly on a single day', function() {
        initCalendar({
          events: [ {
            title: 'hi',
            start: '2014-11-04',
            rendering: 'background'
          } ]
        })
        expect(getBackgroundEventEls().length).toBe(1)
        expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
        expect(getBackgroundEventEls()).toBeRightOf('.fc-day[data-date="2014-11-06"]')
        expect(getEventEls().length).toBe(0)
      })

      it('render correctly spanning multiple weeks', function() {
        initCalendar({
          events: [ {
            title: 'hi',
            start: '2014-11-04',
            end: '2014-11-11',
            rendering: 'background'
          } ]
        })
        expect(getBackgroundEventEls().length).toBe(2)
        expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
        expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
        expect(getBackgroundEventEls().eq(0)).toBeLeftOf('.fc-day[data-date="2014-11-02"]')
        expect(getBackgroundEventEls().eq(1)).toBeRightOf('.fc-day[data-date="2014-11-12"]')
        expect(getEventEls().length).toBe(0)
      })

      describe('when weekNumbers', function() {
        it('renders to left of week numbers', function() {
          initCalendar({
            weekNumbers: true,
            events: [ {
              start: '2014-11-02',
              end: '2014-11-09',
              rendering: 'background'
            } ]
          })
          expect(getBackgroundEventEls().length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
          expect(getBackgroundEventEls()).toBeLeftOf('.fc-day-grid .fc-row:eq(1) .fc-week-number span')
          expect(getEventEls().length).toBe(0)
        })
      })
    })

    describe('when inverse', function() {

      describe('when LTR', function() {

        it('render correctly on a single day', function() {
          initCalendar({
            events: [ {
              title: 'hi',
              start: '2014-11-04',
              rendering: 'inverse-background'
            } ]
          })

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
        })

        it('render correctly spanning multiple weeks', function() {
          initCalendar({
            events: [ {
              title: 'hi',
              start: '2014-11-04',
              end: '2014-11-11',
              rendering: 'inverse-background'
            } ]
          })

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
        })

        it('render correctly when starts before start of month', function() {
          initCalendar({
            events: [ {
              start: '2014-10-24',
              end: '2014-11-06',
              rendering: 'inverse-background'
            } ]
          })

          expect(getBackgroundEventEls().length).toBe(5)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(0)).length).toBe(0)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(3)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(4)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(5)).length).toBe(1)

          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)))
            .toBeRightOf('.fc-day[data-date="2014-11-04"]')
        })

        it('render correctly when ends after end of month', function() {
          initCalendar({
            events: [ {
              start: '2014-11-27',
              end: '2014-12-08',
              rendering: 'inverse-background'
            } ]
          })

          expect(getBackgroundEventEls().length).toBe(5)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(0)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(3)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(4)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(5)).length).toBe(0)

          expect(getBackgroundEventEls(getDayGridRowEls().eq(4)))
            .toBeLeftOf('.fc-day[data-date="2014-11-28"]')
        })

        it('render correctly with two related events, in reverse order', function() {
          initCalendar({
            events: [
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
          })
          expect(getBackgroundEventEls().length).toBe(8)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(0)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(3)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(3)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(4)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(5)).length).toBe(1)
        })

      })

      describe('when RTL', function() {
        pushOptions({ dir: 'rtl' })

        it('render correctly on a single day', function() {
          initCalendar({
            events: [ {
              title: 'hi',
              start: '2014-11-04',
              rendering: 'inverse-background'
            } ]
          })
          expect(getBackgroundEventEls().length).toBe(7)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(0)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(1)).length).toBe(2)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(2)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(3)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(4)).length).toBe(1)
          expect(getBackgroundEventEls(getDayGridRowEls().eq(5)).length).toBe(1)
        })
      })
    })

    describe('when in month view', function() {
      // disabled for v4
      xit('can be activated when rendering set on the source', function() {
        initCalendar({
          defaultView: 'dayGridMonth',
          eventSources: [ {
            rendering: 'background',
            events: [ {
              start: '2014-11-04'
            } ]
          } ]
        })
        expect(getBackgroundEventEls().length).toBe(1)
        expect(getEventEls().length).toBe(0)
      })
    })

    describe('when in timeGrid view and timed event', function() {
      // disabled for v4
      xit('can be activated when rendering set on the source', function() {
        initCalendar({
          defaultView: 'timeGridWeek',
          eventSources: [ {
            rendering: 'background',
            events: [ {
              start: '2014-11-04T01:00:00'
            } ]
          } ]
        })
        expect(getBackgroundEventEls().length).toBe(1)
        expect(getEventEls().length).toBe(0)
      })
    })
  })

  describe('when in week view', function() {
    pushOptions({ defaultView: 'timeGridWeek' })

    describe('when LTR', function() {

      it('render correctly on one day', function() {
        let calendar = initCalendar({
          events: [ {
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T05:00:00',
            rendering: 'background'
          } ]
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(getBackgroundEventEls().length).toBe(1)
        expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1) // column 2
        expect(getBackgroundEventEls()).toBeBelow('.fc-slats tr:eq(0)') // should be 1am (eq(1)) but FF cmplaning
        expect(getBackgroundEventEls()).toBeAbove('.fc-slats tr:eq(10)') // 5am
        expect(getEventEls().length).toBe(0)
        expect(getBackgroundEventElsResizerEls().length).toBe(0) // can't resize
      })

      it('render correctly spanning multiple days', function() {
        let calendar = initCalendar({
          events: [ {
            start: '2014-11-04T01:00:00',
            end: '2014-11-05T05:00:00',
            rendering: 'background'
          } ]
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(getBackgroundEventEls().length).toBe(2)
        expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
        expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
      })

      it('render correctly when two span on top of each other', function() {
        let calendar = initCalendar({
          events: [
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
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(getBackgroundEventEls().length).toBe(4)
        expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(2)
        expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(2)
        // TODO: maybe check y coords
      })

      describe('when businessHours', function() {

        it('renders correctly if assumed default', function() {
          let calendar = initCalendar({
            businessHours: true
          })
          let viewWrapper = new TimeGridViewWrapper(calendar)
          expect(viewWrapper.dayGrid.getNonBusinessDayEls().length).toBe(2) // whole days in the day area
          expect(viewWrapper.timeGrid.getNonBusinessDayEls().length).toBe(12) // strips of gray on the timed area
        })

        it('renders correctly if custom', function() {
          let calendar = initCalendar({
            businessHours: {
              startTime: '02:00',
              endTime: '06:00',
              daysOfWeek: [ 1, 2, 3, 4 ] // Mon-Thu
            }
          })
          let viewWrapper = new TimeGridViewWrapper(calendar)

          // whole days
          expect(viewWrapper.dayGrid.getNonBusinessDayEls().length).toBe(2) // each multi-day stretch is one element

          // time area
          let timeGridWrapper = viewWrapper.timeGrid
          expect(timeGridWrapper.getNonBusinessDayEls().length).toBe(11)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(1).length).toBe(2)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(2).length).toBe(2)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(3).length).toBe(2)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(4).length).toBe(2)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(6).length).toBe(1)
        })
      })
    })

    describe('when RTL', function() {
      pushOptions({
        dir: 'rtl'
      })

      it('render correctly on one day', function() {
        let calendar = initCalendar({
          events: [ {
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T05:00:00',
            rendering: 'background'
          } ]
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(getBackgroundEventEls().length).toBe(1)
        expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
        expect(getBackgroundEventEls()).toBeBelow('.fc-slats tr:eq(0)') // should be 1am (eq(1)) but FF cmplaining
        expect(getBackgroundEventEls()).toBeAbove('.fc-slats tr:eq(10)') // 5am
      })

      it('render correctly spanning multiple days', function() {
        let calendar = initCalendar({
          events: [ {
            start: '2014-11-04T01:00:00',
            end: '2014-11-05T05:00:00',
            rendering: 'background'
          } ]
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(getBackgroundEventEls().length).toBe(2)
        expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
        expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
      })

      describe('when businessHours', function() {

        it('renders correctly if custom', function() {
          let calendar = initCalendar({
            businessHours: {
              startTime: '02:00',
              endTime: '06:00',
              daysOfWeek: [ 1, 2, 3, 4 ] // Mon-Thu
            }
          })
          let viewWrapper = new TimeGridViewWrapper(calendar)

          // whole days
          expect(getDayGridNonBusinessDayEls().length).toBe(2) // each stretch of days is one element

          // time area
          let timeGridWrapper = viewWrapper.timeGrid
          expect(timeGridWrapper.getNonBusinessDayEls().length).toBe(11)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(1).length).toBe(2)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(2).length).toBe(2)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(3).length).toBe(2)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(4).length).toBe(2)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryNonBusinessSegsInCol(6).length).toBe(1)
        })
      })
    })

    describe('when inverse', function() {

      describe('when LTR', function() {

        it('render correctly on one day', function() {
          let calendar = initCalendar({
            events: [ {
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T05:00:00',
              rendering: 'inverse-background'
            } ]
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(getBackgroundEventEls().length).toBe(8)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(2)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)
          // TODO: maybe check y coords
        })

        it('render correctly spanning multiple days', function() {
          let calendar = initCalendar({
            events: [ {
              start: '2014-11-04T01:00:00',
              end: '2014-11-05T05:00:00',
              rendering: 'inverse-background'
            } ]
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(getBackgroundEventEls().length).toBe(7)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)
          // TODO: maybe check y coords
        })

        it('render correctly when starts before start of week', function() {
          let calendar = initCalendar({
            events: [ {
              start: '2014-10-30T01:00:00',
              end: '2014-11-04T05:00:00',
              rendering: 'inverse-background'
            } ]
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(getBackgroundEventEls().length).toBe(5)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(0)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(0)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)
          // TODO: maybe check y coords
        })

        it('render correctly when ends after end of week', function() {
          let calendar = initCalendar({
            events: [ {
              start: '2014-11-04T01:00:00',
              end: '2014-11-12T05:00:00',
              rendering: 'inverse-background'
            } ]
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(getBackgroundEventEls().length).toBe(3)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
          // TODO: maybe check y coords
        })

        it('render correctly with two related events, in reverse order', function() {
          let calendar = initCalendar({
            events: [
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
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(getBackgroundEventEls().length).toBe(9)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(2)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(2)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)
          // TODO: maybe check y coords
        })

        it('render correctly with two related events, nested', function() {
          let calendar = initCalendar({
            events: [
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
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(getBackgroundEventEls().length).toBe(8)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(2)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)
          expect(getBackgroundEventEls().eq(3)).toBeAbove('.fc-slats tr:eq(2)') // first part before 1am
          expect(getBackgroundEventEls().eq(4)).toBeBelow('.fc-slats tr:eq(9)') // second part after 5am
        })

      })

      describe('when RTL', function() {
        pushOptions({
          dir: 'rtl'
        })

        it('render correctly on one day', function() {
          let calendar = initCalendar({
            events: [ {
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T05:00:00',
              rendering: 'inverse-background'
            } ]
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(getBackgroundEventEls().length).toBe(8)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(2)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)
          // TODO: maybe check y coords
        })
      })

      describe('when out of view range', function() {

        it('should still render', function() {
          initCalendar({
            events: [ {
              start: '2014-01-01T01:00:00',
              end: '2014-01-01T05:00:00',
              rendering: 'inverse-background'
            } ]
          })
          expect(getBackgroundEventEls().length).toBe(7)
        })
      })
    })

    it('can have custom Event Object color', function() {
      initCalendar({
        events: [ {
          start: '2014-11-04T01:00:00',
          rendering: 'background',
          color: 'red'
        } ]
      })
      expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
    })

    it('can have custom Event Object backgroundColor', function() {
      initCalendar({
        events: [ {
          start: '2014-11-04T01:00:00',
          rendering: 'background',
          backgroundColor: 'red'
        } ]
      })
      expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
    })

    it('can have custom Event Source color', function() {
      initCalendar({
        eventSources: [ {
          color: 'red',
          events: [ {
            start: '2014-11-04T01:00:00',
            rendering: 'background'
          } ]
        } ]
      })
      expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
    })

    it('can have custom Event Source backgroundColor', function() {
      initCalendar({
        eventSources: [ {
          backgroundColor: 'red',
          events: [ {
            start: '2014-11-04T01:00:00',
            rendering: 'background'
          } ]
        } ]
      })
      expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
    })

    it('is affected by global eventColor', function() {
      initCalendar({
        eventColor: 'red',
        eventSources: [ {
          events: [ {
            start: '2014-11-04T01:00:00',
            rendering: 'background'
          } ]
        } ]
      })
      expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
    })

    it('is affected by global eventBackgroundColor', function() {
      initCalendar({
        eventBackgroundColor: 'red',
        eventSources: [ {
          events: [ {
            start: '2014-11-04T01:00:00',
            rendering: 'background'
          } ]
        } ]
      })
      expect(getBackgroundEventEls().css('background-color')).toMatch(RED_REGEX)
    })
  })
})
