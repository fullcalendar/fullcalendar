import { EventInput } from '@fullcalendar/core'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'
import { DayGridWrapper } from '../lib/wrappers/DayGridWrapper.js'

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
    handleWindowResize: false, // because showing the popover causes scrollbars and fires resize
  })

  describeOptions('initialView', {
    'when in month view': 'dayGridMonth',
    'when in dayGridWeek view': 'dayGridWeek',
    'when in week view': 'timeGridWeek',
  }, (viewName) => {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    it('aligns horizontally with left edge of cell if LTR', (done) => {
      let calendar = initCalendar({
        direction: 'ltr',
      })
      setTimeout(() => {
        let dayGridWrapper = new ViewWrapper(calendar).dayGrid

        dayGridWrapper.openMorePopover()
        setTimeout(() => {
          let cellLeft = dayGridWrapper.getDayEl('2014-07-29').getBoundingClientRect().left
          let popoverLeft = dayGridWrapper.getMorePopoverEl().getBoundingClientRect().left
          let diff = Math.abs(cellLeft - popoverLeft)
          expect(diff).toBeLessThan(2)
          done()
        })
      })
    })

    it('aligns horizontally with left edge of cell if RTL', (done) => {
      let calendar = initCalendar({
        direction: 'rtl',
      })
      setTimeout(() => {
        let dayGridWrapper = new ViewWrapper(calendar).dayGrid

        dayGridWrapper.openMorePopover()
        setTimeout(() => {
          let cellRight = dayGridWrapper.getDayEl('2014-07-29').getBoundingClientRect().right
          let popoverRight = dayGridWrapper.getMorePopoverEl().getBoundingClientRect().right
          let diff = Math.abs(cellRight - popoverRight)
          expect(diff).toBeLessThan(2)
          done()
        })
      })
    })
  })

  describe('when in month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
    })

    it('aligns with top of cell', (done) => {
      let calendar = initCalendar()
      setTimeout(() => {
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.openMorePopover()
        setTimeout(() => {
          let cellTop = dayGridWrapper.getDayEl('2014-07-29').getBoundingClientRect().top
          let popoverTop = dayGridWrapper.getMorePopoverEl().getBoundingClientRect().top
          let diff = Math.abs(cellTop - popoverTop)
          expect(diff).toBeLessThan(2)
          done()
        })
      })
    })

    it('works with background events', (done) => {
      let calendar = initCalendar({
        events: testEvents.concat([
          {
            start: '2014-07-29',
            display: 'background',
          },
        ]),
      })
      setTimeout(() => {
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.openMorePopover()
        setTimeout(() => {
          expect(dayGridWrapper.getMorePopoverEventCnt()).toBeGreaterThan(1)
          expect(dayGridWrapper.getMorePopoverBgEventCnt()).toBe(0)
          done()
        })
      })
    })

    it('works with events that have invalid end times', (done) => {
      let calendar = initCalendar({
        events: [
          { title: 'event1', start: '2014-07-29', end: '2014-07-29' },
          { title: 'event2', start: '2014-07-29', end: '2014-07-28' },
          { title: 'event3', start: '2014-07-29T00:00:00', end: '2014-07-29T00:00:00' },
          { title: 'event4', start: '2014-07-29T00:00:00', end: '2014-07-28T23:00:00' },
        ],
      })
      setTimeout(() => {
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.openMorePopover()
        setTimeout(() => {
          expect(dayGridWrapper.getMorePopoverEventCnt()).toBe(4)
          done()
        })
      })
    })

    // issue 2385
    it('orders events correctly regardless of ID', (done) => {
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
      setTimeout(() => {
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.openMorePopover()
        setTimeout(() => {
          let titles = dayGridWrapper.getMorePopoverEventTitles()
          expect(titles).toEqual([
            'event01', 'event05', 'event07', 'event03', 'event02', 'event08', 'event04',
          ])
          done()
        })
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/3856
    it('displays multi-day events only once', (done) => {
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
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      setTimeout(() => {
        let popoverEl = dayGridWrapper.getMorePopoverEl()
        let eventEls = dayGridWrapper.getMorePopoverEventEls()

        expect(eventEls.length).toBe(4)

        let $longEventEl = $('.long-event', popoverEl)
        let $meetingEventEl = $('.meeting-event', popoverEl)
        let $lunch1EventEl = $('.lunch1-event', popoverEl)
        let $lunch2EventEl = $('.lunch2-event', popoverEl)

        expect($longEventEl).not.toHaveClass(CalendarWrapper.EVENT_IS_START_CLASSNAME)
        expect($longEventEl).not.toHaveClass(CalendarWrapper.EVENT_IS_END_CLASSNAME);

        [$meetingEventEl, $lunch1EventEl, $lunch2EventEl].forEach(($el) => {
          expect($el).toHaveClass(CalendarWrapper.EVENT_IS_START_CLASSNAME)
          expect($el).toHaveClass(CalendarWrapper.EVENT_IS_END_CLASSNAME)
        })

        done()
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4331
    it('displays events that were collapsed in previous days', (done) => {
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
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      dayGridWrapper.openMorePopover(1) // click the second +more link
      setTimeout(done)
    })
  })

  describeOptions('initialView', {
    'when in dayGridWeek view': 'dayGridWeek',
    'when in week view': 'timeGridWeek',
  }, (viewName) => {
    let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

    it('aligns with top of header', (done) => {
      let calendar = initCalendar()
      let viewWrapper = new ViewWrapper(calendar)
      let dayGridWrapper = viewWrapper.dayGrid

      dayGridWrapper.openMorePopover()
      setTimeout(() => {
        let popoverTop = dayGridWrapper.getMorePopoverEl().getBoundingClientRect().top
        let headTop = viewWrapper.header.el.getBoundingClientRect().top
        let diff = Math.abs(popoverTop - headTop)
        expect(diff).toBeLessThan(2)
        done()
      })
    })
  })

  // TODO: somehow test how the popover does to the edge of any scroll container

  it('closes when user clicks the X', (done) => {
    let calendar = initCalendar()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    setTimeout(() => {
      expect(dayGridWrapper.getMorePopoverEl()).toBeVisible()

      dayGridWrapper.closeMorePopover()
      setTimeout(() => {
        expect(dayGridWrapper.getMorePopoverEl()).not.toBeVisible()
        done()
      })
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4584
  it('doesn\'t fire a dateClick', (done) => {
    let dateClickCalled = false

    spyOnCalendarCallback('dateClick', () => {
      dateClickCalled = true
    })

    let calendar = initCalendar()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    setTimeout(() => {
      $.simulateMouseClick(dayGridWrapper.getMorePopoverHeaderEl())
      setTimeout(() => { // because click would take some time to register
        expect(dateClickCalled).toBe(false)
        done()
      }, 500)
    })
  })

  it('doesn\'t close when user clicks somewhere inside of the popover', (done) => {
    let calendar = initCalendar()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    setTimeout(() => {
      let popoverEl = dayGridWrapper.getMorePopoverEl()
      let popoverHeaderEl = dayGridWrapper.getMorePopoverHeaderEl()

      expect(popoverEl).toBeVisible()
      expect(popoverHeaderEl).toBeInDOM()

      $(popoverHeaderEl).simulate('mousedown').simulate('click')
      setTimeout(() => {
        expect(popoverEl).toBeVisible()
        done()
      })
    })
  })

  it('closes when user clicks outside of the popover', (done) => {
    let calendar = initCalendar()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    setTimeout(() => {
      let popoverEl = dayGridWrapper.getMorePopoverEl()
      expect(popoverEl).toBeVisible()

      $('body').simulate('mousedown').simulate('click')
      setTimeout(() => {
        expect(popoverEl).not.toBeVisible()
        done()
      })
    })
  })

  describe('when dragging events out', () => {
    pushOptions({
      editable: true,
    })

    describe('when dragging an all-day event to a different day', () => {
      it('should have the new day and remain all-day', (done) => {
        let calendar = initCalendar({
          eventDrop(arg) {
            expect(arg.event.start).toEqualDate('2014-07-28')
            expect(arg.event.allDay).toBe(true)
            done()
          },
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.openMorePopover()
        setTimeout(() => { // simulate was getting confused about which thing was being clicked :(
          $('.event4', dayGridWrapper.getMorePopoverEl()).simulate('drag', {
            end: dayGridWrapper.getDayEl('2014-07-28'),
          })
        }, 0)
      })
    })

    describe('when dragging a timed event to a whole day', () => {
      it('should move to new day but maintain its time', (done) => {
        let calendar = initCalendar({
          events: testEvents.concat([
            {
              title: 'event5',
              start: '2014-07-29T13:00:00',
              className: 'event5',
            },
          ]),
          eventDrop(arg) {
            expect(arg.event.start).toEqualDate('2014-07-28T13:00:00Z')
            expect(arg.event.allDay).toBe(false)
            done()
          },
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.openMorePopover()
        setTimeout(() => { // simulate was getting confused about which thing was being clicked :(
          $('.event5', dayGridWrapper.getMorePopoverEl()).simulate('drag', {
            end: dayGridWrapper.getDayEl('2014-07-28T13:00:00'),
          })
        }, 0)
      })
    })

    describe('when dragging a whole day event to a timed slot', () => {
      it('should assume the new time, with a cleared end', (done) => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
          scrollTime: '00:00:00',
          eventDrop(arg) {
            expect(arg.event.start).toEqualDate('2014-07-30T03:00:00Z')
            expect(arg.event.allDay).toBe(false)
            done()
          },
        })
        let viewWrapper = new TimeGridViewWrapper(calendar)
        let dayGridWrapper = viewWrapper.dayGrid

        dayGridWrapper.openMorePopover()
        setTimeout(() => { // simulate was getting confused about which thing was being clicked :(
          $('.event4', dayGridWrapper.getMorePopoverEl()).simulate('drag', {
            localPoint: { left: '0%', top: '50%' }, // leftmost is guaranteed to be over the 30th
            end: viewWrapper.timeGrid.getPoint('2014-07-30T03:00:00'),
          })
        }, 0)
      })
    })

    describe('when a single-day event isn\'t dragged out all the way', () => {
      it('shouldn\'t do anything', (done) => {
        let dayGridWrapper
        let calendar = initCalendar({
          eventDragStop() {
            setTimeout(() => { // try to wait until drag is over. eventMutation won't fire BTW
              expect(dayGridWrapper.getMorePopoverEl()).toBeInDOM()
              done()
            }, 0)
          },
        })
        let viewWrapper = new DayGridViewWrapper(calendar)
        dayGridWrapper = viewWrapper.dayGrid
        dayGridWrapper.openMorePopover()

        setTimeout(() => { // simulate was getting confused about which thing was being clicked :(
          $('.event1', dayGridWrapper.getMorePopoverEl()).simulate('drag', {
            localPoint: { left: '0%', top: '50%' }, // leftmost is guaranteed to be over the 30th
            dx: 20,
          })
        }, 0)
      })
    })
  })

  it('calls event render handlers', (done) => {
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
    dayGridWrapper.openMorePopover()
    setTimeout(() => {
      expect(options.eventDidMount.calls.count()).toBe(4)
      expect(options.eventContent.calls.count()).toBe(4)
      expect(options.eventWillUnmount.calls.count()).toBe(0)

      resetCounts()
      dayGridWrapper.closeMorePopover()
      setTimeout(() => {
        expect(options.eventDidMount.calls.count()).toBe(0)
        expect(options.eventContent.calls.count()).toBe(0)
        expect(options.eventWillUnmount.calls.count()).toBe(4)

        done()
      })
    })
  })

  it('displays latest events after refetch', (done) => {
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
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    setTimeout(() => {
      calendar.refetchEvents()
      let eventEls = dayGridWrapper.getMorePopoverEventEls()
      let eventInfo = DayGridWrapper.getEventElInfo(eventEls[2])
      expect(eventInfo.title).toBe(newTitle)
      done()
    })
  })
})
