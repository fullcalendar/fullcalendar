import { RED_REGEX } from '../lib/dom-misc.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'

// SEE ALSO: event-color.js

describe('background events', () => {
  pushOptions({
    initialDate: '2014-11-04',
    scrollTime: '00:00',
  })

  describe('when in month view', () => {
    pushOptions({ initialView: 'dayGridMonth' })

    describe('when LTR', () => {
      it('render correctly on a single day', () => {
        let calendar = initCalendar({
          events: [{
            title: 'hi',
            start: '2014-11-04',
            display: 'background',
          }],
        })

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let allBgEls = dayGridWrapper.getBgEventEls()

        expect(allBgEls.length).toBe(1)
        expect(dayGridWrapper.getBgEventEls(1).length).toBe(1)
        expect(allBgEls[0]).toBeLeftOf(dayGridWrapper.getDayEl('2014-11-05'))
        expect(dayGridWrapper.getEventEls().length).toBe(0)
      })

      it('render correctly spanning multiple weeks', () => {
        let calendar = initCalendar({
          events: [{
            title: 'hi',
            start: '2014-11-04',
            end: '2014-11-11',
            display: 'background',
          }],
        })

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let allBgEls = dayGridWrapper.getBgEventEls()

        expect(allBgEls.length).toBe(2)
        expect(dayGridWrapper.getBgEventEls(1).length).toBe(1)
        expect(dayGridWrapper.getBgEventEls(2).length).toBe(1)
        expect(allBgEls[0]).toBeRightOf(dayGridWrapper.getDayEl('2014-11-03'))
        expect(allBgEls[1]).toBeLeftOf(dayGridWrapper.getDayEl('2014-11-12'))
        expect(dayGridWrapper.getEventEls().length).toBe(0)
      })

      it('render correctly when two span on top of each other', () => {
        let calendar = initCalendar({
          events: [
            {
              start: '2014-11-04',
              end: '2014-11-07',
              display: 'background',
            },
            {
              start: '2014-11-05',
              end: '2014-11-08',
              display: 'background',
            },
          ],
        })

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let allBgEls = dayGridWrapper.getBgEventEls()

        expect(allBgEls.length).toBe(2)
        expect(dayGridWrapper.getBgEventEls(1).length).toBe(2)
        expect(allBgEls[0]).toBeRightOf(dayGridWrapper.getDayEl('2014-11-02'))
        expect(allBgEls[1]).toBeLeftOf(dayGridWrapper.getDayEl('2014-11-08'))
        expect(dayGridWrapper.getEventEls().length).toBe(0)
      })

      it('renders "business hours" on whole days', () => {
        let calendar = initCalendar({
          businessHours: true,
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        expect(dayGridWrapper.getNonBusinessDayEls().length).toBe(12) // there are 6 weeks. 2 weekend days each
      })
    })

    describe('when RTL', () => {
      pushOptions({ direction: 'rtl' })

      it('render correctly on a single day', () => {
        let calendar = initCalendar({
          events: [{
            title: 'hi',
            start: '2014-11-04',
            display: 'background',
          }],
        })

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let allBgEls = dayGridWrapper.getBgEventEls()

        expect(allBgEls.length).toBe(1)
        expect(dayGridWrapper.getBgEventEls(1).length).toBe(1)
        expect(allBgEls[0]).toBeRightOf(dayGridWrapper.getDayEl('2014-11-06'))
        expect(dayGridWrapper.getEventEls().length).toBe(0)
      })

      it('render correctly spanning multiple weeks', () => {
        let calendar = initCalendar({
          events: [{
            title: 'hi',
            start: '2014-11-04',
            end: '2014-11-11',
            display: 'background',
          }],
        })

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let allBgEls = dayGridWrapper.getBgEventEls()

        expect(allBgEls.length).toBe(2)
        expect(dayGridWrapper.getBgEventEls(1).length).toBe(1)
        expect(dayGridWrapper.getBgEventEls(2).length).toBe(1)
        expect(allBgEls[0]).toBeLeftOf(dayGridWrapper.getDayEl('2014-11-02'))
        expect(allBgEls[1]).toBeRightOf(dayGridWrapper.getDayEl('2014-11-12'))
        expect(dayGridWrapper.getEventEls().length).toBe(0)
      })
    })

    describe('when inverse', () => {
      describe('when LTR', () => {
        it('render correctly on a single day', () => {
          let calendar = initCalendar({
            events: [{
              title: 'hi',
              start: '2014-11-04',
              display: 'inverse-background',
            }],
          })
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          expect(dayGridWrapper.getBgEventEls().length).toBe(7)
          expect(dayGridWrapper.getBgEventEls(0).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(1).length).toBe(2)
          expect(dayGridWrapper.getBgEventEls(2).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(3).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(4).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(5).length).toBe(1)

          let secondRowBgEls = dayGridWrapper.getBgEventEls(1)

          expect(secondRowBgEls[0])
            .toBeLeftOf(dayGridWrapper.getDayEl('2014-11-05'))

          expect(secondRowBgEls[1])
            .toBeRightOf(dayGridWrapper.getDayEl('2014-11-03'))

          expect(dayGridWrapper.getEventEls().length).toBe(0)
        })

        it('render correctly spanning multiple weeks', () => {
          let calendar = initCalendar({
            events: [{
              title: 'hi',
              start: '2014-11-04',
              end: '2014-11-11',
              display: 'inverse-background',
            }],
          })
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          expect(dayGridWrapper.getBgEventEls().length).toBe(6)
          expect(dayGridWrapper.getBgEventEls(0).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(1).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(2).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(3).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(4).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(5).length).toBe(1)

          expect(dayGridWrapper.getBgEventEls(1)[0])
            .toBeLeftOf(dayGridWrapper.getDayEl('2014-11-05'))

          expect(dayGridWrapper.getBgEventEls(2)[0])
            .toBeRightOf(dayGridWrapper.getDayEl('2014-11-09'))

          expect(dayGridWrapper.getEventEls().length).toBe(0)
        })

        it('render correctly when starts before start of month', () => {
          let calendar = initCalendar({
            events: [{
              start: '2014-10-24',
              end: '2014-11-06',
              display: 'inverse-background',
            }],
          })
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          expect(dayGridWrapper.getBgEventEls().length).toBe(5)
          expect(dayGridWrapper.getBgEventEls(0).length).toBe(0)
          expect(dayGridWrapper.getBgEventEls(1).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(2).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(3).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(4).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(5).length).toBe(1)

          expect(dayGridWrapper.getBgEventEls(1))
            .toBeRightOf(dayGridWrapper.getDayEl('2014-11-04'))
        })

        it('render correctly when ends after end of month', () => {
          let calendar = initCalendar({
            events: [{
              start: '2014-11-27',
              end: '2014-12-08',
              display: 'inverse-background',
            }],
          })

          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          expect(dayGridWrapper.getBgEventEls().length).toBe(5)
          expect(dayGridWrapper.getBgEventEls(0).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(1).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(2).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(3).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(4).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(5).length).toBe(0)

          expect(dayGridWrapper.getBgEventEls(4))
            .toBeLeftOf(dayGridWrapper.getDayEl('2014-11-28'))
        })

        it('render correctly with two related events, in reverse order', () => {
          let calendar = initCalendar({
            events: [
              {
                groupId: 'hi',
                start: '2014-11-06',
                display: 'inverse-background',
              },
              {
                groupId: 'hi',
                start: '2014-11-04',
                display: 'inverse-background',
              },
            ],
          })
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          expect(dayGridWrapper.getBgEventEls().length).toBe(8)
          expect(dayGridWrapper.getBgEventEls(0).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(1).length).toBe(3)
          expect(dayGridWrapper.getBgEventEls(2).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(3).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(4).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(5).length).toBe(1)
        })
      })

      describe('when RTL', () => {
        pushOptions({ direction: 'rtl' })

        it('render correctly on a single day', () => {
          let calendar = initCalendar({
            events: [{
              title: 'hi',
              start: '2014-11-04',
              display: 'inverse-background',
            }],
          })
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          expect(dayGridWrapper.getBgEventEls().length).toBe(7)
          expect(dayGridWrapper.getBgEventEls(0).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(1).length).toBe(2)
          expect(dayGridWrapper.getBgEventEls(2).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(3).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(4).length).toBe(1)
          expect(dayGridWrapper.getBgEventEls(5).length).toBe(1)
        })
      })
    })

    describe('when in month view', () => {
      it('can be activated when rendering set on the source', () => {
        let calendar = initCalendar({
          initialView: 'dayGridMonth',
          eventSources: [{
            display: 'background',
            events: [{
              start: '2014-11-04',
            }],
          }],
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        expect(dayGridWrapper.getBgEventEls().length).toBe(1)
        expect(dayGridWrapper.getEventEls().length).toBe(0)
      })
    })

    describe('when in timeGrid view and timed event', () => {
      it('can be activated when rendering set on the source', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
          eventSources: [{
            display: 'background',
            events: [{
              start: '2014-11-04T01:00:00',
            }],
          }],
        })
        let viewWrapper = new TimeGridViewWrapper(calendar)

        expect(viewWrapper.dayGrid.getEventEls().length).toBe(0)
        expect(viewWrapper.timeGrid.getBgEventEls().length).toBe(1)
      })
    })
  })

  describe('when in week view', () => {
    pushOptions({ initialView: 'timeGridWeek' })

    describe('when LTR', () => {
      it('render correctly on one day', () => {
        let calendar = initCalendar({
          events: [{
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T05:00:00',
            display: 'background',
          }],
        })

        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let allBgEvents = timeGridWrapper.getBgEventEls()

        expect(allBgEvents.length).toBe(1)
        expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1) // column
        expect(timeGridWrapper.getEventEls().length).toBe(0) // no fg events

        let rect = allBgEvents[0].getBoundingClientRect()
        let topDiff = Math.abs(rect.top - timeGridWrapper.getTimeTop('01:00:00')) // TODO: make more exact
        let bottomDiff = Math.abs(rect.bottom - timeGridWrapper.getTimeTop('05:00:00'))

        expect(topDiff).toBeLessThanOrEqual(1)
        expect(bottomDiff).toBeLessThanOrEqual(1)
      })

      it('render correctly spanning multiple days', () => {
        let calendar = initCalendar({
          events: [{
            start: '2014-11-04T01:00:00',
            end: '2014-11-05T05:00:00',
            display: 'background',
          }],
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(timeGridWrapper.getBgEventEls().length).toBe(2)
        expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
        expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
      })

      it('render correctly when two span on top of each other', () => {
        let calendar = initCalendar({
          events: [
            {
              start: '2014-11-04T01:00:00',
              end: '2014-11-05T05:00:00',
              display: 'background',
            },
            {
              start: '2014-11-04T03:00:00',
              end: '2014-11-05T08:00:00',
              display: 'background',
            },
          ],
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(timeGridWrapper.getBgEventEls().length).toBe(4)
        expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(2)
        expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(2)
        // TODO: maybe check y coords
      })

      describe('when businessHours', () => {
        it('renders correctly if assumed default', () => {
          let calendar = initCalendar({
            businessHours: true,
          })
          let viewWrapper = new TimeGridViewWrapper(calendar)
          expect(viewWrapper.dayGrid.getNonBusinessDayEls().length).toBe(2) // whole days in the day area
          expect(viewWrapper.timeGrid.getNonBusinessDayEls().length).toBe(12) // strips of gray on the timed area
        })

        it('renders correctly if custom', () => {
          let calendar = initCalendar({
            businessHours: {
              startTime: '02:00',
              endTime: '06:00',
              daysOfWeek: [1, 2, 3, 4], // Mon-Thu
            },
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

    describe('when RTL', () => {
      pushOptions({
        direction: 'rtl',
      })

      it('render correctly on one day', () => {
        let calendar = initCalendar({
          events: [{
            start: '2014-11-04T01:00:00',
            end: '2014-11-04T05:00:00',
            display: 'background',
          }],
        })

        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let allBgEls = timeGridWrapper.getBgEventEls()

        expect(allBgEls.length).toBe(1)
        expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)

        let rect = allBgEls[0].getBoundingClientRect()
        let topDiff = Math.abs(rect.top - timeGridWrapper.getTimeTop('01:00:00'))
        let bottomDiff = Math.abs(rect.bottom - timeGridWrapper.getTimeTop('05:00:00'))

        expect(topDiff).toBeLessThanOrEqual(1) // TODO: tighten up
        expect(bottomDiff).toBeLessThanOrEqual(1)
      })

      it('render correctly spanning multiple days', () => {
        let calendar = initCalendar({
          events: [{
            start: '2014-11-04T01:00:00',
            end: '2014-11-05T05:00:00',
            display: 'background',
          }],
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        expect(timeGridWrapper.getBgEventEls().length).toBe(2)
        expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
        expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
      })

      describe('when businessHours', () => {
        it('renders correctly if custom', () => {
          let calendar = initCalendar({
            businessHours: {
              startTime: '02:00',
              endTime: '06:00',
              daysOfWeek: [1, 2, 3, 4], // Mon-Thu
            },
          })
          let viewWrapper = new TimeGridViewWrapper(calendar)

          // whole days
          let dayGridWrapper = viewWrapper.dayGrid
          expect(dayGridWrapper.getNonBusinessDayEls().length).toBe(2) // each stretch of days is one element

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

    describe('when inverse', () => {
      describe('when LTR', () => {
        it('render correctly on one day', () => {
          let calendar = initCalendar({
            events: [{
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T05:00:00',
              display: 'inverse-background',
            }],
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(timeGridWrapper.getBgEventEls().length).toBe(8)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(2)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)
          // TODO: maybe check y coords
        })

        it('render correctly spanning multiple days', () => {
          let calendar = initCalendar({
            events: [{
              start: '2014-11-04T01:00:00',
              end: '2014-11-05T05:00:00',
              display: 'inverse-background',
            }],
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(timeGridWrapper.getBgEventEls().length).toBe(7)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)
          // TODO: maybe check y coords
        })

        it('render correctly when starts before start of week', () => {
          let calendar = initCalendar({
            events: [{
              start: '2014-10-30T01:00:00',
              end: '2014-11-04T05:00:00',
              display: 'inverse-background',
            }],
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(timeGridWrapper.getBgEventEls().length).toBe(5)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(0)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(0)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)
          // TODO: maybe check y coords
        })

        it('render correctly when ends after end of week', () => {
          let calendar = initCalendar({
            events: [{
              start: '2014-11-04T01:00:00',
              end: '2014-11-12T05:00:00',
              display: 'inverse-background',
            }],
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(timeGridWrapper.getBgEventEls().length).toBe(3)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
          // TODO: maybe check y coords
        })

        it('render correctly with two related events, in reverse order', () => {
          let calendar = initCalendar({
            events: [
              {
                groupId: 'hello',
                start: '2014-11-05T01:00:00',
                end: '2014-11-05T05:00:00',
                display: 'inverse-background',
              },
              {
                groupId: 'hello',
                start: '2014-11-03T01:00:00',
                end: '2014-11-03T05:00:00',
                display: 'inverse-background',
              },
            ],
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(timeGridWrapper.getBgEventEls().length).toBe(9)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(2)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(2)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)
          // TODO: maybe check y coords
        })

        it('render correctly with two related events, nested', () => {
          let calendar = initCalendar({
            events: [
              {
                groupId: 'hello',
                start: '2014-11-05T01:00:00',
                end: '2014-11-05T05:00:00',
                display: 'inverse-background',
              },
              {
                groupId: 'hello',
                start: '2014-11-05T02:00:00',
                end: '2014-11-05T04:00:00',
                display: 'inverse-background',
              },
            ],
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          let allBgEls = timeGridWrapper.getBgEventEls()

          expect(allBgEls.length).toBe(8)
          expect(timeGridWrapper.queryBgEventsInCol(0).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(1).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(2).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(3).length).toBe(2)
          expect(timeGridWrapper.queryBgEventsInCol(4).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(5).length).toBe(1)
          expect(timeGridWrapper.queryBgEventsInCol(6).length).toBe(1)

          expect(allBgEls[3].getBoundingClientRect().top)
            .toBeLessThan(timeGridWrapper.getTimeTop('01:00:00'))
          expect(allBgEls[4].getBoundingClientRect().bottom)
            .toBeGreaterThan(timeGridWrapper.getTimeTop('05:00:00'))
        })
      })

      describe('when RTL', () => {
        pushOptions({
          direction: 'rtl',
        })

        it('render correctly on one day', () => {
          let calendar = initCalendar({
            events: [{
              start: '2014-11-04T01:00:00',
              end: '2014-11-04T05:00:00',
              display: 'inverse-background',
            }],
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          expect(timeGridWrapper.getBgEventEls().length).toBe(8)
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

      describe('when out of view range', () => {
        it('should still render', () => {
          let calendar = initCalendar({
            events: [{
              start: '2014-01-01T01:00:00',
              end: '2014-01-01T05:00:00',
              display: 'inverse-background',
            }],
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          expect(timeGridWrapper.getBgEventEls().length).toBe(7)
        })
      })
    })

    it('can have custom Event Object color', () => {
      let calendar = initCalendar({
        events: [{
          start: '2014-11-04T01:00:00',
          display: 'background',
          color: 'red',
        }],
      })
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let bgEl = timeGridWrapper.getBgEventEls()[0]
      expect($(bgEl).css('background-color')).toMatch(RED_REGEX)
    })

    it('can have custom Event Object backgroundColor', () => {
      let calendar = initCalendar({
        events: [{
          start: '2014-11-04T01:00:00',
          display: 'background',
          backgroundColor: 'red',
        }],
      })
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let bgEl = timeGridWrapper.getBgEventEls()[0]
      expect($(bgEl).css('background-color')).toMatch(RED_REGEX)
    })

    it('can have custom Event Source color', () => {
      let calendar = initCalendar({
        eventSources: [{
          color: 'red',
          events: [{
            start: '2014-11-04T01:00:00',
            display: 'background',
          }],
        }],
      })
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let bgEl = timeGridWrapper.getBgEventEls()[0]
      expect($(bgEl).css('background-color')).toMatch(RED_REGEX)
    })

    it('can have custom Event Source backgroundColor', () => {
      let calendar = initCalendar({
        eventSources: [{
          backgroundColor: 'red',
          events: [{
            start: '2014-11-04T01:00:00',
            display: 'background',
          }],
        }],
      })
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let bgEl = timeGridWrapper.getBgEventEls()[0]
      expect($(bgEl).css('background-color')).toMatch(RED_REGEX)
    })

    it('is affected by global eventColor', () => {
      let calendar = initCalendar({
        eventColor: 'red',
        eventSources: [{
          events: [{
            start: '2014-11-04T01:00:00',
            display: 'background',
          }],
        }],
      })
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let bgEl = timeGridWrapper.getBgEventEls()[0]
      expect($(bgEl).css('background-color')).toMatch(RED_REGEX)
    })

    it('is affected by global eventBackgroundColor', () => {
      let calendar = initCalendar({
        eventBackgroundColor: 'red',
        eventSources: [{
          events: [{
            start: '2014-11-04T01:00:00',
            display: 'background',
          }],
        }],
      })
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let bgEl = timeGridWrapper.getBgEventEls()[0]
      expect($(bgEl).css('background-color')).toMatch(RED_REGEX)
    })
  })
})
