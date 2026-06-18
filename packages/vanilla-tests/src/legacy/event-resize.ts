import { createDuration } from 'fullcalendar/protected-api'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitEventResize } from '../lib/wrappers/interaction-util'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { enUsSep, waitTimeout } from '../lib/misc'

describe('eventResize', () => {
  pushOptions({
    initialDate: '2014-06-11',
    editable: true,
    longPressDelay: 100,
    scrollTime: 0,
  })

  describe('when in month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
    })

    describe('when resizing an all-day event with mouse', () => {
      it('should have correct arguments with a whole-day delta', async () => {
        let calendar = initCalendar({
          events: [{
            title: 'all-day event',
            start: '2014-06-11',
            allDay: true,
          }],
        })
        await waitTimeout()
        checkCalendarTriggers(calendar)

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let resizing = dayGridWrapper.resizeEvent(
          dayGridWrapper.getFirstEventEl(), '2014-06-11', '2014-06-16',
        )
        let info = await waitEventResize(calendar, resizing)
        expect(info.endDelta).toEqual(createDuration({ day: 5 }))

        expect(info.event.start).toEqualDate('2014-06-11')
        expect(info.event.end).toEqualDate('2014-06-17')

        info.revert()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11')
        expect(event.end).toBeNull()
      })
    })

    describe('when resizing an all-day event via touch', () => {
      // for https://github.com/fullcalendar/fullcalendar/issues/3118
      [true, false].forEach((eventStartEditable) => {
        describe('when eventStartEditable is ' + eventStartEditable, () => {
          pushOptions({ eventStartEditable })

          it('should have correct arguments with a whole-day delta', async () => {
            let calendar = initCalendar({
              dragRevertDuration: 0, // so that eventDragStop happens immediately after touchend
              events: [{
                title: 'all-day event',
                start: '2014-06-11',
                allDay: true,
              }],
            })
            await waitTimeout()

            let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
            let resizing = dayGridWrapper.resizeEventTouch(
              dayGridWrapper.getFirstEventEl(), '2014-06-11', '2014-06-16',
            )
            let info = await waitEventResize(calendar, resizing)
            expect(info.endDelta).toEqual(createDuration({ day: 5 }))

            expect(info.event.start).toEqualDate('2014-06-11')
            expect(info.event.end).toEqualDate('2014-06-17')

            info.revert()
            let event = calendar.getEvents()[0]

            expect(event.start).toEqualDate('2014-06-11')
            expect(event.end).toBeNull()
          })
        })
      })
    })

    describe('when rendering a timed event', () => {
      it('should not have resize capabilities', async () => {
        initCalendar({
          events: [{
            title: 'timed event',
            start: '2014-06-11T08:00:00',
            allDay: false,
          }],
        })
        await waitTimeout()
        expect(
          $(`.${CalendarWrapper.EVENT_CLASSNAME} .${CalendarWrapper.EVENT_RESIZER_CLASSNAME}`),
        ).not.toBeInDOM()
      })
    })
  })

  describe('when in timeGrid view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
    })

    describe('when resizing an all-day event', () => {
      it('should have correct arguments with a whole-day delta', async () => {
        let calendar = initCalendar({
          events: [{
            title: 'all-day event',
            start: '2014-06-11',
            allDay: true,
          }],
        })
        await waitTimeout()

        let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid
        let resizing = dayGridWrapper.resizeEvent(
          dayGridWrapper.getFirstEventEl(), '2014-06-11', '2014-06-13',
        )
        let info = await waitEventResize(calendar, resizing)
        expect(info.endDelta).toEqual(createDuration({ day: 2 }))

        expect(info.event.start).toEqualDate('2014-06-11')
        expect(info.event.end).toEqualDate('2014-06-14')

        info.revert()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11')
        expect(event.end).toBeNull()
      })
    })

    describe('when resizing a timed event with an end', () => {
      pushOptions({
        events: [{
          title: 'timed event event',
          start: '2014-06-11T05:00:00',
          end: '2014-06-11T07:00:00',
          allDay: false,
        }],
      })

      it('should have correct arguments with a timed delta', async () => {
        let calendar = initCalendar()
        await waitTimeout()

        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let resizing = timeGridWrapper.resizeEvent(
          timeGridWrapper.getFirstEventEl(), '2014-06-11T07:00:00', '2014-06-11T09:30:00',
        )
        let info = await waitEventResize(calendar, resizing)
        expect(info.endDelta).toEqual(createDuration({ hour: 2, minute: 30 }))

        expect(info.event.start).toEqualDate('2014-06-11T05:00:00Z')
        expect(info.event.end).toEqualDate('2014-06-11T09:30:00Z')

        info.revert()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11T05:00:00Z')
        expect(event.end).toEqualDate('2014-06-11T07:00:00Z')
      })

      it('should have correct arguments with a timed delta via touch', async () => {
        let calendar = initCalendar({
          dragRevertDuration: 0, // so that eventDragStop happens immediately after touchend
        })
        await waitTimeout()

        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let resizing = timeGridWrapper.resizeEventTouch(
          timeGridWrapper.getFirstEventEl(), '2014-06-11T07:00:00Z', '2014-06-11T09:30:00Z',
        )
        let info = await waitEventResize(calendar, resizing)
        expect(info.endDelta).toEqual(createDuration({ hour: 2, minute: 30 }))

        expect(info.event.start).toEqualDate('2014-06-11T05:00:00Z')
        expect(info.event.end).toEqualDate('2014-06-11T09:30:00Z')

        info.revert()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11T05:00:00Z')
        expect(event.end).toEqualDate('2014-06-11T07:00:00Z')
      })

      // TODO: test RTL
      it('should have correct arguments with a timed delta when resized to a different day', async () => {
        let calendar = initCalendar()
        await waitTimeout()

        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let resizing = timeGridWrapper.resizeEventTouch(
          timeGridWrapper.getFirstEventEl(), '2014-06-11T07:00:00Z', '2014-06-12T09:30:00Z',
        )
        let info = await waitEventResize(calendar, resizing)
        expect(info.endDelta).toEqual(createDuration({ day: 1, hour: 2, minute: 30 }))

        expect(info.event.start).toEqualDate('2014-06-11T05:00:00Z')
        expect(info.event.end).toEqualDate('2014-06-12T09:30:00Z')

        info.revert()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11T05:00:00Z')
        expect(event.end).toEqualDate('2014-06-11T07:00:00Z')
      })

      it('should have correct arguments with a timed delta, when timezone is local', async () => {
        let calendar = initCalendar({
          timeZone: 'local',
        })
        await waitTimeout()

        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let resizing = timeGridWrapper.resizeEventTouch(
          timeGridWrapper.getFirstEventEl(), '2014-06-11T07:00:00', '2014-06-11T09:30:00',
        )
        let info = await waitEventResize(calendar, resizing)
        expect(info.endDelta).toEqual(createDuration({ hour: 2, minute: 30 }))

        expect(info.event.start).toEqualLocalDate('2014-06-11T05:00:00')
        expect(info.event.end).toEqualLocalDate('2014-06-11T09:30:00')

        info.revert()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualLocalDate('2014-06-11T05:00:00')
        expect(event.end).toEqualLocalDate('2014-06-11T07:00:00')
      })

      it('should have correct arguments with a timed delta, when timezone is UTC', async () => {
        let calendar = initCalendar({
          timeZone: 'UTC',
        })
        await waitTimeout()

        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let resizing = timeGridWrapper.resizeEventTouch(
          timeGridWrapper.getFirstEventEl(), '2014-06-11T07:00:00', '2014-06-11T09:30:00',
        )
        let info = await waitEventResize(calendar, resizing)
        expect(info.endDelta).toEqual(createDuration({ hour: 2, minute: 30 }))

        expect(info.event.start).toEqualDate('2014-06-11T05:00:00+00:00')
        expect(info.event.end).toEqualDate('2014-06-11T09:30:00+00:00')

        info.revert()
        let event = calendar.getEvents()[0]

        expect(event.start).toEqualDate('2014-06-11T05:00:00')
        expect(event.end).toEqualDate('2014-06-11T07:00:00+00:00')
      })

      it('should display the correct time text while resizing', async () => {
        let calendar = initCalendar()
        await waitTimeout()
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let onBeforeReleaseCalled = false // don't trust ourselves :(

        await timeGridWrapper.resizeEvent(
          timeGridWrapper.getFirstEventEl(),
          '2014-06-11T07:00:00Z',
          '2014-06-11T09:30:00Z',
          () => { // onBeforeRelease
            let $mirrorEls = $(timeGridWrapper.getMirrorEls())
            expect($mirrorEls.length).toBe(1)
            expect($mirrorEls.find('.' + CalendarWrapper.EVENT_TIME_CLASSNAME)).toHaveText(`5:00${enUsSep}9:30`)
            onBeforeReleaseCalled = true
          },
        )
        expect(onBeforeReleaseCalled).toBe(true)
      })

      it('should run the temporarily rendered event through eventDidMount', async () => {
        let calendar = initCalendar({
          eventDidMount(info) {
            $(info.el).addClass('eventDidRender')
          },
        })
        await waitTimeout()

        let onBeforeReleaseCalled = false // don't trust ourselves :(
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        await timeGridWrapper.resizeEvent(
          timeGridWrapper.getFirstEventEl(),
          '2014-06-11T07:00:00Z',
          '2014-06-11T09:30:00Z',
          () => { // onBeforeRelease
            let $mirrorEls = $(timeGridWrapper.getMirrorEls())
            expect($mirrorEls.length).toBe(1)
            expect($mirrorEls).toHaveClass('eventDidRender')
            onBeforeReleaseCalled = true
          },
        )
        expect(onBeforeReleaseCalled).toBe(true)
      })

      // https://github.com/fullcalendar/fullcalendar/issues/7099
      it('should handle two consecutive resizes', async () => {
        let calendar = initCalendar()
        await waitTimeout()
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        await timeGridWrapper.resizeEvent(
          timeGridWrapper.getFirstEventEl(),
          '2014-06-11T07:00:00Z',
          '2014-06-11T12:00:00Z',
        )
        let event = calendar.getEvents()[0]
        expect(event.end).toEqualDate('2014-06-11T12:00:00Z')

        await timeGridWrapper.resizeEvent(
          timeGridWrapper.getFirstEventEl(),
          '2014-06-11T12:00:00Z',
          '2014-06-11T09:00:00Z',
        )
        event = calendar.getEvents()[0]
        expect(event.end).toEqualDate('2014-06-11T09:00:00Z')
      })
    })

    describe('when resizing a timed event without an end', () => {
      pushOptions({
        defaultTimedEventDuration: '02:00',
        events: [{
          title: 'timed event event',
          start: '2014-06-11T05:00:00',
          allDay: false,
        }],
      })

      // copied and pasted from other test :(
      it('should display the correct time text while resizing', async () => {
        let calendar = initCalendar()
        await waitTimeout()
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let onBeforeReleaseCalled = false // don't trust ourselves :(

        await timeGridWrapper.resizeEvent(
          timeGridWrapper.getFirstEventEl(),
          '2014-06-11T07:00:00Z',
          '2014-06-11T09:30:00Z',
          () => { // onBeforeRelease
            let $mirrorEls = $(timeGridWrapper.getMirrorEls())
            expect($mirrorEls.length).toBe(1)
            expect($mirrorEls.find('.' + CalendarWrapper.EVENT_TIME_CLASSNAME)).toHaveText(`5:00${enUsSep}9:30`)
            onBeforeReleaseCalled = true
          },
        )
        expect(onBeforeReleaseCalled).toBe(true)
      })
    })
  })

  function checkCalendarTriggers(calendar) {
    calendar.on('eventResizeStart', (info) => {
      expect(info.el instanceof Element).toBe(true)
      expect(typeof info.event).toBe('object')
      expect(typeof info.jsEvent).toBe('object')
      expect(typeof info.view).toBe('object')
    })

    calendar.on('eventResizeStop', (info) => {
      expect(info.el instanceof Element).toBe(true)
      expect(typeof info.event).toBe('object')
      expect(typeof info.jsEvent).toBe('object')
      expect(typeof info.view).toBe('object')
    })

    calendar.on('eventResize', (info) => {
      expect(info.el instanceof Element).toBe(true)
      expect(typeof info.event).toBe('object')
      expect(typeof info.startDelta).toBe('object')
      expect(typeof info.endDelta).toBe('object')
      expect(typeof info.revert).toBe('function')
      expect(typeof info.jsEvent).toBe('object')
      expect(typeof info.view).toBe('object')
    })
  }
})
