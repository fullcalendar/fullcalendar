import { EventInput } from 'fullcalendar'
import { waitTimeout } from '../lib/misc'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { DayGridWrapper } from '../lib/wrappers/DayGridWrapper'

describe('more-link popover', () => {
  let testEvents: EventInput[] = [
    { title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
    { title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
    { title: 'event3', start: '2014-07-29', className: 'event3' },
    { title: 'event4', start: '2014-07-29', className: 'event4' },
  ]

  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2014-08-01',
    dayMaxEventRows: 3,
    events: testEvents,
    dragScroll: false, // don't do autoscrolling while dragging. close quarters in PhantomJS
  })

  describeOptions('initialView', {
    'when in month view': 'dayGridMonth',
    'when in dayGridWeek view': 'dayGridWeek',
    'when in week view': 'timeGridWeek',
  }, (viewName) => {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    it('aligns horizontally with left edge of cell if LTR', async () => {
      let calendar = initCalendar({
        direction: 'ltr',
      })
      await waitTimeout()
      let dayGridWrapper = new ViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      let cellLeft = dayGridWrapper.getDayEl('2014-07-29').getBoundingClientRect().left
      let popoverLeft = dayGridWrapper.getMorePopoverEl().getBoundingClientRect().left
      let diff = Math.abs(cellLeft - popoverLeft)
      expect(diff).toBeLessThan(2)
    })

    it('aligns horizontally with left edge of cell if RTL', async () => {
      let calendar = initCalendar({
        direction: 'rtl',
      })
      await waitTimeout()
      let dayGridWrapper = new ViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      let cellRight = dayGridWrapper.getDayEl('2014-07-29').getBoundingClientRect().right
      let popoverRight = dayGridWrapper.getMorePopoverEl().getBoundingClientRect().right
      let diff = Math.abs(cellRight - popoverRight)
      expect(diff).toBeLessThan(2)
    })
  })

  describe('when in month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
    })

    it('aligns with top of cell', async () => {
      let calendar = initCalendar()
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      let cellTop = dayGridWrapper.getDayEl('2014-07-29').getBoundingClientRect().top
      let popoverTop = dayGridWrapper.getMorePopoverEl().getBoundingClientRect().top
      let diff = Math.abs(cellTop - popoverTop)
      expect(diff).toBeLessThan(2)
    })

    it('works with background events', async () => {
      let calendar = initCalendar({
        events: testEvents.concat([
          {
            start: '2014-07-29',
            display: 'background',
          },
        ]),
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      expect(dayGridWrapper.getMorePopoverEventCnt()).toBeGreaterThan(1)
      expect(dayGridWrapper.getMorePopoverBgEventCnt()).toBe(0)
    })

    it('works with events that have invalid end times', async () => {
      let calendar = initCalendar({
        events: [
          { title: 'event1', start: '2014-07-29', end: '2014-07-29' },
          { title: 'event2', start: '2014-07-29', end: '2014-07-28' },
          { title: 'event3', start: '2014-07-29T00:00:00', end: '2014-07-29T00:00:00' },
          { title: 'event4', start: '2014-07-29T00:00:00', end: '2014-07-28T23:00:00' },
        ],
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      expect(dayGridWrapper.getMorePopoverEventCnt()).toBe(4)
    })

    // issue 2385
    it('orders events correctly regardless of ID', async () => {
      let calendar = initCalendar({
        initialDate: '2012-03-22',
        dayMaxEventRows: 3,
        events: [
          {
            id: '39957',
            title: 'event01',
            start: '2012-03-22T11:00:00',
            end: '2012-03-22T11:30:00',
            allDay: false,
          },
          {
            id: '40607',
            title: 'event02',
            start: '2012-03-22T16:15:00',
            end: '2012-03-22T16:30:00',
            allDay: false,
          },
          {
            id: '40760',
            title: 'event03',
            start: '2012-03-22T16:00:00',
            end: '2012-03-22T16:15:00',
            allDay: false,
          },
          {
            id: '41284',
            title: 'event04',
            start: '2012-03-22T19:00:00',
            end: '2012-03-22T19:15:00',
            allDay: false,
          },
          {
            id: '41645',
            title: 'event05',
            start: '2012-03-22T11:30:00',
            end: '2012-03-22T12:00:00',
            allDay: false,
          },
          {
            id: '41679',
            title: 'event07',
            start: '2012-03-22T12:00:00',
            end: '2012-03-22T12:15:00',
            allDay: false,
          },
          {
            id: '42246',
            title: 'event08',
            start: '2012-03-22T16:45:00',
            end: '2012-03-22T17:00:00',
            allDay: false,
          },
        ],
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      let titles = dayGridWrapper.getMorePopoverEventTitles()
      expect(titles).toEqual([
        'event01', 'event05', 'event07', 'event03', 'event02', 'event08', 'event04',
      ])
    })

    // https://github.com/fullcalendar/fullcalendar/issues/3856
    it('displays multi-day events only once', async () => {
      let calendar = initCalendar({
        initialDate: '2017-10-04',
        events: [
          {
            title: 'Long event',
            className: 'long-event',
            start: '2017-10-03',
            end: '2017-10-20',
          },
          {
            title: 'Meeting',
            className: 'meeting-event',
            start: '2017-10-04T10:00:00',
            end: '2017-10-04T12:00:00',
          },
          {
            title: 'Lunch 1',
            className: 'lunch1-event',
            start: '2017-10-04T12:00:00',
          },
          {
            title: 'Lunch 2',
            className: 'lunch2-event',
            start: '2017-10-04T14:00:00',
          },
        ],
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      let popoverEl = dayGridWrapper.getMorePopoverEl()
      let eventEls = dayGridWrapper.getMorePopoverEventEls()

      expect(eventEls.length).toBe(4)

      let $longEventEl = $('.long-event', popoverEl)
      let $meetingEventEl = $('.meeting-event', popoverEl)
      let $lunch1EventEl = $('.lunch1-event', popoverEl)
      let $lunch2EventEl = $('.lunch2-event', popoverEl)

      expect($longEventEl).not.toHaveClass(CalendarWrapper.EVENT_IS_START_CLASSNAME)
      expect($longEventEl).not.toHaveClass(CalendarWrapper.EVENT_IS_END_CLASSNAME)

      let singleDayEventEls = [$meetingEventEl, $lunch1EventEl, $lunch2EventEl]

      singleDayEventEls.forEach(($el) => {
        expect($el).toHaveClass(CalendarWrapper.EVENT_IS_START_CLASSNAME)
        expect($el).toHaveClass(CalendarWrapper.EVENT_IS_END_CLASSNAME)
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4331
    it('displays events that were collapsed in previous days', async () => {
      let calendar = initCalendar({
        initialDate: '2018-10-01',
        events: [
          {
            title: 'e1',
            start: '2018-10-18',
          },
          {
            title: 'e2',
            start: '2018-10-18',
          },
          {
            title: 'e3',
            start: '2018-10-18T11:00:00',
          },
          {
            title: 'e4',
            start: '2018-10-18T12:00:00',
            end: '2018-10-19T12:00:00',
          },
          {
            title: 'e5',
            start: '2018-10-19',
            className: 'event-e5',
          },
        ],
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      dayGridWrapper.openMorePopover(1) // click the second +more link
      await waitTimeout()
    })
  })

  describeOptions('initialView', {
    'when in dayGridWeek view': 'dayGridWeek',
    'when in week view': 'timeGridWeek',
  }, (viewName) => {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    it('aligns with top of header', async () => {
      let calendar = initCalendar()
      await waitTimeout()
      let viewWrapper = new ViewWrapper(calendar)
      let dayGridWrapper = viewWrapper.dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      let popoverTop = dayGridWrapper.getMorePopoverEl().getBoundingClientRect().top
      let headTop = viewWrapper.header.el.getBoundingClientRect().top
      let diff = Math.abs(popoverTop - headTop)
      expect(diff).toBeLessThan(3) // fudge :( -- will be fixed when view border moved outward
    })
  })

  // TODO: somehow test how the popover does to the edge of any scroll container

  it('closes when user clicks the X', async () => {
    let calendar = initCalendar()
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    await waitTimeout()
    expect(dayGridWrapper.getMorePopoverEl()).toBeVisible()

    dayGridWrapper.closeMorePopover()
    await waitTimeout()
    expect(dayGridWrapper.getMorePopoverEl()).not.toBeVisible()
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4584
  it('doesn\'t fire a dateClick', async () => {
    let dateClickCalled = false

    spyOnCalendarCallback('dateClick', () => {
      dateClickCalled = true
    })

    let calendar = initCalendar()
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    await waitTimeout()
    $.simulateMouseClick(dayGridWrapper.getMorePopoverHeaderEl())
    await waitTimeout()
    expect(dateClickCalled).toBe(false)
  })

  it('doesn\'t close when user clicks somewhere inside of the popover', async () => {
    let calendar = initCalendar()
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    await waitTimeout()
    let popoverEl = dayGridWrapper.getMorePopoverEl()
    let popoverHeaderEl = dayGridWrapper.getMorePopoverHeaderEl()

    expect(popoverEl).toBeVisible()
    expect(popoverHeaderEl).toBeInDOM()

    $(popoverHeaderEl).simulate('mousedown').simulate('click')
    await waitTimeout()
    expect(popoverEl).toBeVisible()
  })

  it('closes when user clicks outside of the popover', async () => {
    let calendar = initCalendar()
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    await waitTimeout()
    let popoverEl = dayGridWrapper.getMorePopoverEl()
    expect(popoverEl).toBeVisible()

    $('body').simulate('mousedown').simulate('click')
    await waitTimeout()
    expect(popoverEl).not.toBeVisible()
  })

  describe('when dragging events out', () => {
    pushOptions({
      editable: true,
    })

    describe('when dragging an all-day event to a different day', () => {
      it('should have the new day and remain all-day', async () => {
        let calendar
        let dropReceived = new Promise<void>((resolve) => {
          calendar = initCalendar({
            eventDrop(info) {
              expect(info.event.start).toEqualDate('2014-07-28')
              expect(info.event.allDay).toBe(true)
              resolve()
            },
          })
        })
        await waitTimeout()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.openMorePopover()
        await waitTimeout()
        $('.event4', dayGridWrapper.getMorePopoverEl()).simulate('drag', {
          end: dayGridWrapper.getDayEl('2014-07-28'),
        })
        await dropReceived
      })
    })

    describe('when dragging a timed event to a whole day', () => {
      it('should move to new day but maintain its time', async () => {
        let calendar
        let dropReceived = new Promise<void>((resolve) => {
          calendar = initCalendar({
            events: testEvents.concat([
              {
                title: 'event5',
                start: '2014-07-29T13:00:00',
                className: 'event5',
              },
            ]),
            eventDrop(info) {
              expect(info.event.start).toEqualDate('2014-07-28T13:00:00Z')
              expect(info.event.allDay).toBe(false)
              resolve()
            },
          })
        })
        await waitTimeout()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.openMorePopover()
        await waitTimeout()
        $('.event5', dayGridWrapper.getMorePopoverEl()).simulate('drag', {
          end: dayGridWrapper.getDayEl('2014-07-28T13:00:00'),
        })
        await dropReceived
      })
    })

    describe('when dragging a whole day event to a timed slot', () => {
      it('should assume the new time, with a cleared end', async () => {
        let calendar
        let dropReceived = new Promise<void>((resolve) => {
          calendar = initCalendar({
            initialView: 'timeGridWeek',
            scrollTime: '00:00:00',
            eventDrop(info) {
              expect(info.event.start).toEqualDate('2014-07-30T03:00:00Z')
              expect(info.event.allDay).toBe(false)
              resolve()
            },
          })
        })
        await waitTimeout()
        let viewWrapper = new TimeGridViewWrapper(calendar)
        let dayGridWrapper = viewWrapper.dayGrid

        dayGridWrapper.openMorePopover()
        await waitTimeout()
        $('.event4', dayGridWrapper.getMorePopoverEl()).simulate('drag', {
          localPoint: { left: '0%', top: '50%' }, // leftmost is guaranteed to be over the 30th
          end: viewWrapper.timeGrid.getPoint('2014-07-30T03:00:00'),
        })
        await dropReceived
      })
    })

    describe('when a single-day event isn\'t dragged out all the way', () => {
      it('shouldn\'t do anything', async () => {
        let calendar
        let dayGridWrapper
        let dragStopped = new Promise<void>((resolve) => {
          calendar = initCalendar({
            eventDragStop() {
              waitTimeout().then(() => {
              expect(dayGridWrapper.getMorePopoverEl()).toBeInDOM()
                resolve()
              })
            },
          })
        })
        let viewWrapper = new DayGridViewWrapper(calendar)
        dayGridWrapper = viewWrapper.dayGrid
        await waitTimeout()
        dayGridWrapper.openMorePopover()
        await waitTimeout()

        $('.event1', dayGridWrapper.getMorePopoverEl()).simulate('drag', {
          localPoint: { left: '0%', top: '50%' }, // leftmost is guaranteed to be over the 30th
          dx: 20,
        })
        await dragStopped
      })
    })
  })

  it('calls event render handlers', async () => {
    let options = {
      events: [
        { title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
        { title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
        { title: 'event3', start: '2014-07-29', className: 'event3' },
        { title: 'event4', start: '2014-07-29', className: 'event4' },
      ],
      eventDidMount() {},
      eventContent() {},
      eventWillUnmount() {},
    }

    spyOn(options, 'eventDidMount')
    spyOn(options, 'eventContent')
    spyOn(options, 'eventWillUnmount')

    function resetCounts() {
      options.eventDidMount.calls.reset()
      options.eventContent.calls.reset()
      options.eventWillUnmount.calls.reset()
    }

    let calendar = initCalendar(options)
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    expect(options.eventDidMount.calls.count()).toBe(4)
    expect(options.eventContent.calls.count()).toBe(4)
    expect(options.eventWillUnmount.calls.count()).toBe(0)

    resetCounts()
    await waitTimeout()
    dayGridWrapper.openMorePopover()
    await waitTimeout()
    expect(options.eventDidMount.calls.count()).toBe(4)
    expect(options.eventContent.calls.count()).toBe(4)
    expect(options.eventWillUnmount.calls.count()).toBe(0)

    resetCounts()
    dayGridWrapper.closeMorePopover()
    await waitTimeout()
    expect(options.eventDidMount.calls.count()).toBe(0)
    expect(options.eventContent.calls.count()).toBe(0)
    expect(options.eventWillUnmount.calls.count()).toBe(4)
  })

  it('displays latest events after refetch', async () => {
    let fetchCnt = 0
    let newTitle = 'cool'
    let calendar = initCalendar({
      events(info, callback) {
        fetchCnt += 1
        if (fetchCnt === 1) {
          callback(testEvents)
        } else {
          callback(testEvents.slice(0, -1).concat([
            {
              ...testEvents[testEvents.length - 1],
              title: newTitle,
            },
          ]))
        }
      },
    })
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    await waitTimeout()
    calendar.refetchEvents()
    await waitTimeout()
    let eventEls = dayGridWrapper.getMorePopoverEventEls()
    let eventInfo = DayGridWrapper.getEventElInfo(eventEls[2])
    expect(eventInfo.title).toBe(newTitle)
  })
})
