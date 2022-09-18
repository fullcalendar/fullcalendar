import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('select method', () => {
  pushOptions({
    initialDate: '2014-05-25',
    selectable: true,
  })

  /*
  THINGS TO IMPLEMENT IN SRC (in addition to notes further down):
  - better date normalization (for both render and reporting to select callback)
    - if second date is the same or before the first
    - if given a mixture of timed/all-day
    - for dayGrid/month views, when given timed dates, should really be all-day
  */

  describeOptions('direction', {
    'when LTR': 'ltr',
    'when RTL': 'rtl',
  }, () => {
    describe('when in month view', () => {
      pushOptions({
        initialView: 'dayGridMonth',
      })

      describe('when called with all-day date strings', () => {
        describe('when in bounds', () => {
          it('renders a selection', () => {
            let calendar = initCalendar()
            calendar.select('2014-05-07', '2014-05-09')
            let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
            expect(dayGridWrapper.getHighlightEls()).toBeVisible()
          })

          it('renders a selection when called with one argument', () => {
            let calendar = initCalendar()
            calendar.select('2014-05-07')
            let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
            expect(dayGridWrapper.getHighlightEls()).toBeVisible()
          })

          it('fires a selection event', () => {
            let selectSpy = spyOnCalendarCallback('select', (arg) => {
              expect(arg.allDay).toEqual(true)
              expect(arg.start).toEqualDate('2014-05-07')
              expect(arg.end).toEqualDate('2014-05-09')
            })
            let calendar = initCalendar()
            calendar.select('2014-05-07', '2014-05-09')
            expect(selectSpy).toHaveBeenCalled()
          })
        })

        describe('when out of bounds', () => {
          it('doesn\'t render a selection', () => {
            let calendar = initCalendar()
            calendar.select('2015-05-07', '2015-05-09')
            let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
            expect(dayGridWrapper.getHighlightEls()).not.toBeVisible()
          })

          /*
          TODO: implement this behavior
          it('doesn\'t fire a selection event', function() {
            options.select = function(arg) {
              expect(arg.start).toEqualDate('2014-05-07');
              expect(arg.end).toEqualDate('2014-05-09');
            };
            spyOn(options, 'select').and.callThrough();
            let calendar = initCalendar(options);
            calendar.select('2015-05-07', '2015-05-09');
            expect(options.select).not.toHaveBeenCalled();
          });
          */
        })
      })

      describe('when called with timed date strings', () => {
        it('renders a selection', () => {
          let calendar = initCalendar()
          calendar.select('2014-05-07T06:00:00', '2014-05-09T07:00:00')
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
          expect(dayGridWrapper.getHighlightEls()).toBeVisible()
        })

        it('fires a selection event', () => {
          let selectSpy = spyOnCalendarCallback('select', (arg) => {
            expect(arg.allDay).toEqual(false)
            expect(arg.start).toEqualDate('2014-05-07T06:00:00Z')
            expect(arg.end).toEqualDate('2014-05-09T06:00:00Z')
          })
          let calendar = initCalendar()
          calendar.select('2014-05-07T06:00:00', '2014-05-09T06:00:00')
          expect(selectSpy).toHaveBeenCalled()
        })
      })
    })

    describe('when in week view', () => { // May 25 - 31
      pushOptions({
        initialView: 'timeGridWeek',
        scrollTime: '01:00:00', // so that most events will be below the divider
        height: 400, // short enought to make scrolling happen
      })

      describe('when called with timed date strings', () => {
        describe('when in bounds', () => {
          it('renders a selection when called with one argument', () => {
            let calendar = initCalendar()
            calendar.select('2014-05-26T06:00:00')
            let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
            expect(timeGridWrapper.getHighlightEls()).toBeVisible()
          })

          it('renders a selection over the slot area', () => {
            let calendar = initCalendar()
            calendar.select('2014-05-26T06:00:00', '2014-05-26T08:00:00')
            let viewWrapper = new TimeGridViewWrapper(calendar)
            let highlightEls = viewWrapper.timeGrid.getHighlightEls()
            expect(highlightEls).toBeVisible()
            let slotAreaTop = $(viewWrapper.getScrollerEl()).offset().top
            let overlayTop = $(highlightEls[0]).offset().top
            expect(overlayTop).toBeGreaterThan(slotAreaTop)
          })
        })

        describe('when out of bounds', () => {
          it('doesn\'t render a selection', () => {
            let calendar = initCalendar()
            calendar.select('2015-05-26T06:00:00', '2015-05-26T07:00:00')
            let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
            expect(timeGridWrapper.getHighlightEls()).not.toBeVisible()
          })

          /*
          TODO: implement this behavior
          it('doesn\'t fire a selection event', function() {
            options.select = function(arg) {
              expect(arg.start).toEqualDate('2015-05-07T06:00:00Z');
              expect(arg.end).toEqualDate('2015-05-09T07:00:00Z');
            };
            spyOn(options, 'select').and.callThrough();
            let calendar = initCalendar(options);
            calendar.select('2015-05-07T06:00:00', '2015-05-09T07:00:00');
            expect(options.select).not.toHaveBeenCalled();
          });
          */
        })
      })

      describe('when called with all-day date strings', () => { // forget about in/out bounds for this :)
        describe('when allDaySlot is on', () => {
          pushOptions({
            allDaySlot: true,
          })

          it('renders a selection over the day area', () => {
            let calendar = initCalendar()
            calendar.select('2014-05-26', '2014-05-28')
            let viewWrapper = new TimeGridViewWrapper(calendar)
            let highlightEls = viewWrapper.dayGrid.getHighlightEls()
            expect(highlightEls).toBeVisible()
            let slotAreaTop = $(viewWrapper.getScrollerEl()).offset().top
            let overlayTop = $(highlightEls[0]).offset().top
            expect(overlayTop).toBeLessThan(slotAreaTop)
          })

          it('fires a selection event', () => {
            let selectSpy = spyOnCalendarCallback('select', (arg) => {
              expect(arg.allDay).toEqual(true)
              expect(arg.start).toEqualDate('2014-05-26')
              expect(arg.end).toEqualDate('2014-05-28')
            })
            let calendar = initCalendar()
            calendar.select('2014-05-26', '2014-05-28')
            expect(selectSpy).toHaveBeenCalled()
          })
        })

        describe('when allDaySlot is off', () => {
          pushOptions({
            allDaySlot: false,
          })

          it('doesn\'t render the all-day selection over time area', () => {
            let calendar = initCalendar()
            calendar.select('2014-05-26', '2014-05-28')
            let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
            expect(timeGridWrapper.getHighlightEls()).not.toBeVisible()
          })

          /*
          TODO: implement
          it('doesn\'t fire a selection event', function() {
            options.select = function(arg) {
              expect(arg.allDay).toEqual(true);
              expect(arg.start).toEqualDate('2014-05-26');
              expect(arg.end).toEqualDate('2014-05-28');
            };
            spyOn(options, 'select').and.callThrough();
            let calendar = initCalendar(options);
            calendar.select('2014-05-26', '2014-05-28');
            expect(options.select).not.toHaveBeenCalled();
          });
          */
        })
      })
    })
  })
})
