import { createDuration } from 'fullcalendar/protected-api'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitEventDrag } from '../lib/wrappers/interaction-util'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { queryEventElInfo } from '../lib/wrappers/TimeGridWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { enUsSep, waitTimeout } from '../lib/misc'

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
          it('should be given correct arguments, with whole-day delta', async () => {
            let calendar = initCalendarWithSpies({
              events: [{
                title: 'all-day event',
                start: '2014-06-11',
                allDay: true,
              }],
            })
            await waitTimeout()

            let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
            let dragging = dayGridWrapper.dragEventToDate(
              dayGridWrapper.getFirstEventEl(),
              '2014-06-11',
              '2014-06-20',
              isTouch,
            )
            let info = await waitEventDrag(calendar, dragging)
            let delta = createDuration({ day: 9 })
            expect(info.delta).toEqual(delta)

            expect(info.event.start).toEqualDate('2014-06-20')
            expect(info.event.end).toBeNull()

            info.revert()
            await waitTimeout()
            let event = calendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11')
            expect(event.end).toBeNull()
          })
        })
      })
    })

    describe('when dragging a timed event to another day', () => {
      it('should be given correct arguments, with whole-day delta', async () => {
        let calendar = initCalendarWithSpies({
          events: [{
            title: 'timed event',
            start: '2014-06-11T06:00:00',
            allDay: false,
          }],
        })
        await waitTimeout()

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let dragging = dayGridWrapper.dragEventToDate(
          dayGridWrapper.getFirstEventEl(),
          '2014-06-11',
          '2014-06-16',
        )
        let info = await waitEventDrag(calendar, dragging)
        let delta = createDuration({ day: 5 })
        expect(info.delta).toEqual(delta)

        expect(info.event.start).toEqualDate('2014-06-16T06:00:00Z')
        expect(info.event.end).toBeNull()

        info.revert()
        await waitTimeout()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11T06:00:00Z')
        expect(event.end).toBeNull()
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4458
    describe('when dragging an event back in time when duration not editable', () => {
      it('should work', async () => {
        let calendar = initCalendarWithSpies({
          initialDate: '2019-01-16',
          eventDurationEditable: false,
          events: [{
            title: 'event',
            start: '2019-01-16T10:30:00+00:00',
            end: '2019-01-16T12:30:00+00:00',
          }],
        })
        await waitTimeout()

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let dragging = dayGridWrapper.dragEventToDate(
          dayGridWrapper.getFirstEventEl(),
          '2019-01-16',
          '2019-01-14',
        )
        let info = await waitEventDrag(calendar, dragging)
        expect(info.delta).toEqual(createDuration({ day: -2 }))
        expect(info.event.start).toEqualDate('2019-01-14T10:30:00+00:00')
        expect(info.event.end).toEqualDate('2019-01-14T12:30:00+00:00')
      })
    })

    // TODO: tests for eventMouseEnter/eventMouseLeave firing correctly when no dragging
    it('should not fire any eventMouseEnter/eventMouseLeave events while dragging', async () => { // issue 1297
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
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      let dragPromise = new Promise<void>((resolve) => {
        $('.event1').simulate('drag', {
          end: dayGridWrapper.getDayEl('2014-06-20'),
          moves: 10,
          duration: 1000,
          onRelease() {
            resolve()
          },
        })
      })

      let hoverCheckPromise = new Promise<void>((resolve) => {
        setTimeout(() => { // wait until half way through drag
          $('.event2')
            .simulate('mouseover')
            .simulate('mouseenter')
            .simulate('mouseout')
            .simulate('mouseleave')

          setTimeout(() => {
            expect(eventMouseEnterSpy).not.toHaveBeenCalled()
            expect(eventMouseLeaveSpy).not.toHaveBeenCalled()
            resolve()
          }, 0)
        }, 500)
      })

      await Promise.all([dragPromise, hoverCheckPromise])
    })
  })

  describe('when in timeGrid view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
    });

    [false, true].forEach((isTouch) => {
      describe('with ' + (isTouch ? 'touch' : 'mouse'), () => {
        describe('when dragging a timed event to another time on a different day', () => {
          it('should be given correct arguments and delta with days/time', async () => {
            let calendar = initCalendarWithSpies({
              events: [{
                title: 'timed event',
                start: '2014-06-11T06:00:00',
                allDay: false,
              }],
            })
            await waitTimeout()
            let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
            let dragging = timeGridWrapper.dragEventToDate(
              timeGridWrapper.getFirstEventEl(),
              '2014-06-12T07:30:00',
            )
            let info = await waitEventDrag(calendar, dragging)
            let delta = createDuration({ day: 1, hour: 1, minute: 30 })
            expect(info.delta).toEqual(delta)

            expect(info.event.start).toEqualDate('2014-06-12T07:30:00Z')
            expect(info.event.end).toBeNull()

            info.revert()
            await waitTimeout()
            let event = calendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11T06:00:00Z')
            expect(event.end).toBeNull()
          })
        })
      })
    })

    describe('when dragging an all-day event to another all-day', () => {
      it('should be given correct arguments, with whole-day delta', async () => {
        let calendar = initCalendarWithSpies({
          events: [{
            title: 'all-day event',
            start: '2014-06-11',
            allDay: true,
          }],
        })
        await waitTimeout()
        let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid
        let dragging = dayGridWrapper.dragEventToDate(
          dayGridWrapper.getFirstEventEl(),
          '2014-06-11',
          '2014-06-13',
        )
        let info = await waitEventDrag(calendar, dragging)
        let delta = createDuration({ day: 2 })
        expect(info.delta).toEqual(delta)

        expect(info.event.start).toEqualDate('2014-06-13')
        expect(info.event.end).toBeNull()

        info.revert()
        await waitTimeout()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11')
        expect(event.end).toBeNull()
      })
    })

    describe('when dragging an all-day event to a time slot on a different day', () => {
      it('should be given correct arguments and delta with days/time', async () => {
        let calendar = initCalendarWithSpies({
          scrollTime: '01:00:00',
          height: 400, // short enough to make scrolling happen
          events: [{
            title: 'all-day event',
            start: '2014-06-11',
            allDay: true,
          }],
        })
        await waitTimeout()
        let viewWrapper = new TimeGridViewWrapper(calendar)
        let dragging = viewWrapper.timeGrid.dragEventToDate(
          viewWrapper.dayGrid.getFirstEventEl(),
          '2014-06-10T01:00:00',
        )
        let info = await waitEventDrag(calendar, dragging)
        let delta = createDuration({ day: -1, hour: 1 })
        expect(info.delta).toEqual(delta)

        expect(info.event.start).toEqualDate('2014-06-10T01:00:00Z')
        expect(info.event.end).toBeNull()
        expect(info.event.allDay).toBe(false)

        info.revert()
        await waitTimeout()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11')
        expect(event.end).toBeNull()
        expect(event.allDay).toBe(true)
      })
    })

    describe('when dragging a timed event to an all-day slot on a different day', () => {
      it('should be given correct arguments, with whole-day delta', async () => {
        let calendar = initCalendarWithSpies({
          scrollTime: '01:00:00',
          height: 400, // short enough to make scrolling happen
          events: [{
            title: 'timed event',
            start: '2014-06-11T01:00:00',
            allDay: false,
          }],
        })
        await waitTimeout()
        let viewWrapper = new TimeGridViewWrapper(calendar)
        let dragging = viewWrapper.dayGrid.dragEventToDate(
          viewWrapper.timeGrid.getFirstEventEl(),
          null,
          '2014-06-10',
        )
        let info = await waitEventDrag(calendar, dragging)
        let delta = createDuration({ day: -1 })
        expect(info.delta).toEqual(delta)

        expect(info.event.start).toEqualDate('2014-06-10')
        expect(info.event.end).toBeNull()
        expect(info.event.allDay).toBe(true)

        info.revert()
        await waitTimeout()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11T01:00:00Z')
        expect(event.end).toBeNull()
        expect(event.allDay).toBe(false)
      })
    })

    describe('when dragging a timed event with no end time', () => {
      it('should continue to only show the updated start time', async () => {
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
        await waitTimeout()
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
        await waitEventDrag(calendar, dragging)
        expect(dragged).toBe(true)
      })
    })

    describe('when dragging a timed event with an end time', () => {
      it('should continue to show the updated start and end time', async () => {
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
        await waitTimeout()
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        let dragging = timeGridWrapper.dragEventToDate(
          timeGridWrapper.getFirstEventEl(),
          '2014-06-11T02:30:00',
          () => { // onBeforeRelease
            dragged = true
            let mirrorEls = timeGridWrapper.getMirrorEls()
            expect(mirrorEls.length).toBe(1)
            expect(queryEventElInfo(mirrorEls[0]).timeText).toBe(`2:30${enUsSep}3:30`)
          },
        )
        await waitEventDrag(calendar, dragging)
        expect(dragged).toBe(true)
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4503
    describe('when dragging to one of the last slots', () => {
      it('should work', async () => {
        let calendar = initCalendarWithSpies({
          scrollTime: '23:00:00',
          height: 400, // short enough to make scrolling happen
          events: [{
            title: 'timed event',
            start: '2014-06-11T18:00:00', // should be in view without scrolling
            allDay: false,
          }],
        })
        await waitTimeout()

        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let dragging = timeGridWrapper.dragEventToDate(
          timeGridWrapper.getFirstEventEl(),
          '2014-06-11T23:30:00',
        )
        await waitEventDrag(calendar, dragging)
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11T23:30:00Z')
        expect(event.end).toBeNull()
        expect(event.allDay).toBe(false)
      })
    })
  })

  // Initialize a calendar, run a drag, and do type-checking of all arguments for all handlers.
  // TODO: more discrimination instead of just checking for 'object'
  function initCalendarWithSpies(options) {
    options.eventDragStart = (info) => {
      expect(info.el instanceof Element).toBe(true)
      expect(info.el).toHaveClass(CalendarWrapper.EVENT_CLASSNAME)
      expect(typeof info.event).toBe('object')
      expect(typeof info.jsEvent).toBe('object')
      expect(typeof info.view).toBe('object')
    }

    options.eventDragStop = (info) => {
      expect(options.eventDragStart).toHaveBeenCalled()
      expect(info.el instanceof Element).toBe(true)
      expect(info.el).toHaveClass(CalendarWrapper.EVENT_CLASSNAME)
      expect(typeof info.event).toBe('object')
      expect(typeof info.jsEvent).toBe('object')
      expect(typeof info.view).toBe('object')
    }

    options.eventDrop = (info) => {
      expect(options.eventDragStop).toHaveBeenCalled()
      expect(info.el instanceof Element).toBe(true)
      expect(info.el).toHaveClass(CalendarWrapper.EVENT_CLASSNAME)
      expect(typeof info.delta).toBe('object')
      expect(typeof info.revert).toBe('function')
      expect(typeof info.jsEvent).toBe('object')
      expect(typeof info.view).toBe('object')
    }

    spyOn(options, 'eventDragStart').and.callThrough()
    spyOn(options, 'eventDragStop').and.callThrough()

    return initCalendar(options)
  }
})
