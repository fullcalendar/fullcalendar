import { createDuration } from '@fullcalendar/core/internal'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { waitEventDrag2 } from '../lib/wrappers/interaction-util.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'
import { queryEventElInfo } from '../lib/wrappers/TimeGridWrapper.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('eventDrop', () => {
  pushOptions({
    timeZone: 'UTC',
    initialDate: '2014-06-11',
    editable: true,
    dragScroll: false,
    longPressDelay: 100,
  })

  describe('when in month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
    });

    // TODO: test that event's dragged via touch that don't wait long enough for longPressDelay
    // SHOULD NOT drag

    [false, true].forEach((isTouch) => {
      describe('with ' + (isTouch ? 'touch' : 'mouse'), () => {
        describe('when dragging an all-day event to another day', () => {
          it('should be given correct arguments, with whole-day delta', (done) => {
            let calendar = initCalendarWithSpies({
              events: [{
                title: 'all-day event',
                start: '2014-06-11',
                allDay: true,
              }],
            })

            let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
            let dragging = dayGridWrapper.dragEventToDate(
              dayGridWrapper.getFirstEventEl(),
              '2014-06-11',
              '2014-06-20',
              isTouch,
            )

            waitEventDrag2(calendar, dragging).then((arg) => {
              let delta = createDuration({ day: 9 })
              expect(arg.delta).toEqual(delta)

              expect(arg.event.start).toEqualDate('2014-06-20')
              expect(arg.event.end).toBeNull()

              arg.revert()
              let event = currentCalendar.getEvents()[0]

              expect(event.start).toEqualDate('2014-06-11')
              expect(event.end).toBeNull()

              done()
            })
          })
        })
      })
    })

    describe('when gragging a timed event to another day', () => {
      it('should be given correct arguments, with whole-day delta', (done) => {
        let calendar = initCalendarWithSpies({
          events: [{
            title: 'timed event',
            start: '2014-06-11T06:00:00',
            allDay: false,
          }],
        })

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let dragging = dayGridWrapper.dragEventToDate(
          dayGridWrapper.getFirstEventEl(),
          '2014-06-11',
          '2014-06-16',
        )

        waitEventDrag2(calendar, dragging).then((arg) => {
          let delta = createDuration({ day: 5 })
          expect(arg.delta).toEqual(delta)

          expect(arg.event.start).toEqualDate('2014-06-16T06:00:00Z')
          expect(arg.event.end).toBeNull()

          arg.revert()
          let event = currentCalendar.getEvents()[0]

          expect(event.start).toEqualDate('2014-06-11T06:00:00Z')
          expect(event.end).toBeNull()

          done()
        })
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4458
    describe('when dragging an event back in time when duration not editable', () => {
      it('should work', (done) => {
        let calendar = initCalendarWithSpies({
          initialDate: '2019-01-16',
          eventDurationEditable: false,
          events: [{
            title: 'event',
            start: '2019-01-16T10:30:00+00:00',
            end: '2019-01-16T12:30:00+00:00',
          }],
        })

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let dragging = dayGridWrapper.dragEventToDate(
          dayGridWrapper.getFirstEventEl(),
          '2019-01-16',
          '2019-01-14',
        )

        waitEventDrag2(calendar, dragging).then((arg) => {
          expect(arg.delta).toEqual(createDuration({ day: -2 }))
          expect(arg.event.start).toEqualDate('2019-01-14T10:30:00+00:00')
          expect(arg.event.end).toEqualDate('2019-01-14T12:30:00+00:00')
          done()
        })
      })
    })

    // TODO: tests for eventMouseEnter/eventMouseLeave firing correctly when no dragging
    it('should not fire any eventMouseEnter/eventMouseLeave events while dragging', (done) => { // issue 1297
      let eventMouseEnterSpy = spyOnCalendarCallback('eventMouseEnter')
      let eventMouseLeaveSpy = spyOnCalendarCallback('eventMouseLeave')
      let calendar = initCalendar({
        events: [
          {
            title: 'all-day event',
            start: '2014-06-11',
            allDay: true,
            className: 'event1',
          },
          {
            title: 'event2',
            start: '2014-06-10',
            allDay: true,
            className: 'event2',
          },
        ],
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      $('.event1').simulate('drag', {
        end: dayGridWrapper.getDayEl('2014-06-20'),
        moves: 10,
        duration: 1000,
        onRelease() {
          done()
        },
      })

      setTimeout(() => { // wait until half way through drag
        $('.event2')
          .simulate('mouseover')
          .simulate('mouseenter')
          .simulate('mouseout')
          .simulate('mouseleave')

        setTimeout(() => {
          expect(eventMouseEnterSpy).not.toHaveBeenCalled()
          expect(eventMouseLeaveSpy).not.toHaveBeenCalled()
        }, 0)
      }, 500)
    })
  })

  describe('when in timeGrid view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
    });

    [false, true].forEach((isTouch) => {
      describe('with ' + (isTouch ? 'touch' : 'mouse'), () => {
        describe('when dragging a timed event to another time on a different day', () => {
          it('should be given correct arguments and delta with days/time', (done) => {
            let calendar = initCalendarWithSpies({
              events: [{
                title: 'timed event',
                start: '2014-06-11T06:00:00',
                allDay: false,
              }],
            })
            let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
            let dragging = timeGridWrapper.dragEventToDate(
              timeGridWrapper.getFirstEventEl(),
              '2014-06-12T07:30:00',
            )

            waitEventDrag2(calendar, dragging).then((arg) => {
              let delta = createDuration({ day: 1, hour: 1, minute: 30 })
              expect(arg.delta).toEqual(delta)

              expect(arg.event.start).toEqualDate('2014-06-12T07:30:00Z')
              expect(arg.event.end).toBeNull()

              arg.revert()
              let event = currentCalendar.getEvents()[0]

              expect(event.start).toEqualDate('2014-06-11T06:00:00Z')
              expect(event.end).toBeNull()

              done()
            })
          })
        })
      })
    })

    describe('when dragging an all-day event to another all-day', () => {
      it('should be given correct arguments, with whole-day delta', (done) => {
        let calendar = initCalendarWithSpies({
          events: [{
            title: 'all-day event',
            start: '2014-06-11',
            allDay: true,
          }],
        })
        let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid
        let dragging = dayGridWrapper.dragEventToDate(
          dayGridWrapper.getFirstEventEl(),
          '2014-06-11',
          '2014-06-13',
        )

        waitEventDrag2(calendar, dragging).then((arg) => {
          let delta = createDuration({ day: 2 })
          expect(arg.delta).toEqual(delta)

          expect(arg.event.start).toEqualDate('2014-06-13')
          expect(arg.event.end).toBeNull()

          arg.revert()
          let event = currentCalendar.getEvents()[0]

          expect(event.start).toEqualDate('2014-06-11')
          expect(event.end).toBeNull()

          done()
        })
      })
    })

    describe('when dragging an all-day event to a time slot on a different day', () => {
      it('should be given correct arguments and delta with days/time', (done) => {
        let calendar = initCalendarWithSpies({
          scrollTime: '01:00:00',
          height: 400, // short enough to make scrolling happen
          events: [{
            title: 'all-day event',
            start: '2014-06-11',
            allDay: true,
          }],
        })
        let viewWrapper = new TimeGridViewWrapper(calendar)
        let dragging = viewWrapper.timeGrid.dragEventToDate(
          viewWrapper.dayGrid.getFirstEventEl(),
          '2014-06-10T01:00:00',
        )

        waitEventDrag2(calendar, dragging).then((arg) => {
          let delta = createDuration({ day: -1, hour: 1 })
          expect(arg.delta).toEqual(delta)

          expect(arg.event.start).toEqualDate('2014-06-10T01:00:00Z')
          expect(arg.event.end).toBeNull()
          expect(arg.event.allDay).toBe(false)

          arg.revert()
          let event = currentCalendar.getEvents()[0]

          expect(event.start).toEqualDate('2014-06-11')
          expect(event.end).toBeNull()
          expect(event.allDay).toBe(true)

          done()
        })
      })
    })

    describe('when dragging a timed event to an all-day slot on a different day', () => {
      it('should be given correct arguments, with whole-day delta', (done) => {
        let calendar = initCalendarWithSpies({
          scrollTime: '01:00:00',
          height: 400, // short enough to make scrolling happen
          events: [{
            title: 'timed event',
            start: '2014-06-11T01:00:00',
            allDay: false,
          }],
        })
        let viewWrapper = new TimeGridViewWrapper(calendar)
        let dragging = viewWrapper.dayGrid.dragEventToDate(
          viewWrapper.timeGrid.getFirstEventEl(),
          null,
          '2014-06-10',
        )

        waitEventDrag2(calendar, dragging).then((arg) => {
          let delta = createDuration({ day: -1 })
          expect(arg.delta).toEqual(delta)

          expect(arg.event.start).toEqualDate('2014-06-10')
          expect(arg.event.end).toBeNull()
          expect(arg.event.allDay).toBe(true)

          arg.revert()
          let event = currentCalendar.getEvents()[0]

          expect(event.start).toEqualDate('2014-06-11T01:00:00Z')
          expect(event.end).toBeNull()
          expect(event.allDay).toBe(false)

          done()
        })
      })
    })

    describe('when dragging a timed event with no end time', () => {
      it('should continue to only show the updated start time', (done) => {
        let dragged = false
        let calendar = initCalendarWithSpies({
          scrollTime: '01:00:00',
          height: 400, // short enough to make scrolling happen
          events: [{
            title: 'timed event',
            start: '2014-06-11T01:00:00',
            allDay: false,
          }],
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        let dragging = timeGridWrapper.dragEventToDate(
          timeGridWrapper.getFirstEventEl(),
          '2014-06-11T02:30:00',
          () => { // onBeforeRelease
            dragged = true
            let mirrorEls = timeGridWrapper.getMirrorEls()
            expect(mirrorEls.length).toBe(1)
            expect(queryEventElInfo(mirrorEls[0]).timeText).toBe('2:30')
          },
        )

        waitEventDrag2(calendar, dragging).then(() => {
          expect(dragged).toBe(true)
          done()
        })
      })
    })

    describe('when dragging a timed event with an end time', () => {
      it('should continue to show the updated start and end time', (done) => {
        let dragged = false
        let calendar = initCalendarWithSpies({
          scrollTime: '01:00:00',
          height: 400, // short enough to make scrolling happen
          events: [{
            title: 'timed event',
            start: '2014-06-11T01:00:00',
            end: '2014-06-11T02:00:00',
            allDay: false,
          }],
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        let dragging = timeGridWrapper.dragEventToDate(
          timeGridWrapper.getFirstEventEl(),
          '2014-06-11T02:30:00',
          () => { // onBeforeRelease
            dragged = true
            let mirrorEls = timeGridWrapper.getMirrorEls()
            expect(mirrorEls.length).toBe(1)
            expect(queryEventElInfo(mirrorEls[0]).timeText).toBe('2:30 - 3:30')
          },
        )

        waitEventDrag2(calendar, dragging).then(() => {
          expect(dragged).toBe(true)
          done()
        })
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4503
    describe('when dragging to one of the last slots', () => {
      it('should work', (done) => {
        let calendar = initCalendarWithSpies({
          scrollTime: '23:00:00',
          height: 400, // short enough to make scrolling happen
          events: [{
            title: 'timed event',
            start: '2014-06-11T18:00:00', // should be in view without scrolling
            allDay: false,
          }],
        })

        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let dragging = timeGridWrapper.dragEventToDate(
          timeGridWrapper.getFirstEventEl(),
          '2014-06-11T23:30:00',
        )

        waitEventDrag2(calendar, dragging).then(() => {
          let event = currentCalendar.getEvents()[0]

          expect(event.start).toEqualDate('2014-06-11T23:30:00Z')
          expect(event.end).toBeNull()
          expect(event.allDay).toBe(false)

          done()
        })
      })
    })
  })

  // Initialize a calendar, run a drag, and do type-checking of all arguments for all handlers.
  // TODO: more discrimination instead of just checking for 'object'
  function initCalendarWithSpies(options) {
    options.eventDragStart = (arg) => {
      expect(arg.el instanceof Element).toBe(true)
      expect(arg.el).toHaveClass(CalendarWrapper.EVENT_CLASSNAME)
      expect(typeof arg.event).toBe('object')
      expect(typeof arg.jsEvent).toBe('object')
      expect(typeof arg.view).toBe('object')
    }

    options.eventDragStop = (arg) => {
      expect(options.eventDragStart).toHaveBeenCalled()
      expect(arg.el instanceof Element).toBe(true)
      expect(arg.el).toHaveClass(CalendarWrapper.EVENT_CLASSNAME)
      expect(typeof arg.event).toBe('object')
      expect(typeof arg.jsEvent).toBe('object')
      expect(typeof arg.view).toBe('object')
    }

    options.eventDrop = (arg) => {
      expect(options.eventDragStop).toHaveBeenCalled()
      expect(arg.el instanceof Element).toBe(true)
      expect(arg.el).toHaveClass(CalendarWrapper.EVENT_CLASSNAME)
      expect(typeof arg.delta).toBe('object')
      expect(typeof arg.revert).toBe('function')
      expect(typeof arg.jsEvent).toBe('object')
      expect(typeof arg.view).toBe('object')
    }

    spyOn(options, 'eventDragStart').and.callThrough()
    spyOn(options, 'eventDragStop').and.callThrough()

    return initCalendar(options)
  }
})
