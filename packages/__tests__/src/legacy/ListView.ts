import frLocale from '@fullcalendar/core/locales/fr'
import { ListViewWrapper } from '../lib/wrappers/ListViewWrapper'

describe('ListView rendering', () => {
  pushOptions({
    initialView: 'listWeek',
    now: '2016-08-20',
  })

  describe('with all-day events', () => {
    describe('when single-day', () => {
      pushOptions({
        events: [
          {
            title: 'event 1',
            start: '2016-08-15',
          },
          {
            title: 'event 2',
            start: '2016-08-17',
          },
        ],
      })

      it('renders only days with events', () => {
        let calendar = initCalendar()

        let viewWrapper = new ListViewWrapper(calendar)
        let days = viewWrapper.getDayInfo()
        let events = viewWrapper.getEventInfo()

        expect(days.length).toBe(2)
        expect(days[0].date).toEqualDate('2016-08-15')
        expect(days[1].date).toEqualDate('2016-08-17')

        expect(events.length).toBe(2)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('all-day')
        expect(events[1].title).toBe('event 2')
        expect(events[1].timeText).toBe('all-day')
      })

      it('filters events through event hook', () => {
        let eventMountCnt = 0

        initCalendar({
          eventDidMount() {
            eventMountCnt += 1
          },
        })

        expect(eventMountCnt).toBe(2)
      })

      it('filters events through eventWillUnmount', () => {
        let callCnt = 0

        initCalendar({
          eventWillUnmount() {
            callCnt += 1
          },
        })

        currentCalendar.destroy()
        expect(callCnt).toBe(2)
      })
    })

    describe('when multi-day', () => {
      pushOptions({
        events: [
          {
            title: 'event 1',
            start: '2016-08-15',
            end: '2016-08-18', // 3 days
          },
        ],
      })

      it('renders all-day for every day', () => {
        let calendar = initCalendar()
        let viewWrapper = new ListViewWrapper(calendar)
        let events = viewWrapper.getEventInfo()

        expect(events.length).toBe(3)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('all-day')
        expect(events[1].title).toBe('event 1')
        expect(events[1].timeText).toBe('all-day')
        expect(events[2].title).toBe('event 1')
        expect(events[2].timeText).toBe('all-day')
      })
    })
  })

  describe('with timed events', () => {
    describe('when single-day', () => {
      pushOptions({
        events: [
          {
            title: 'event 1',
            start: '2016-08-15T07:00',
          },
          {
            title: 'event 2',
            start: '2016-08-17T09:00',
            end: '2016-08-17T11:00',
          },
        ],
      })

      it('renders times', () => {
        let calendar = initCalendar()
        let viewWrapper = new ListViewWrapper(calendar)
        let events = viewWrapper.getEventInfo()

        expect(events.length).toBe(2)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('7:00am')
        expect(events[1].title).toBe('event 2')
        expect(events[1].timeText).toBe('9:00am - 11:00am')
      })

      it('doesn\'t render times when displayEventTime is false', () => {
        let calendar = initCalendar({
          displayEventTime: false,
        })
        let viewWrapper = new ListViewWrapper(calendar)
        let events = viewWrapper.getEventInfo()

        expect(events.length).toBe(2)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('')
        expect(events[1].title).toBe('event 2')
        expect(events[1].timeText).toBe('')
      })

      it('doesn\'t render end times when displayEventEnd is false', () => {
        let calendar = initCalendar({
          displayEventEnd: false,
        })
        let viewWrapper = new ListViewWrapper(calendar)
        let events = viewWrapper.getEventInfo()

        expect(events.length).toBe(2)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('7:00am')
        expect(events[1].title).toBe('event 2')
        expect(events[1].timeText).toBe('9:00am')
      })

      // regression test for when localized event dates get unlocalized and leak into view rendering
      it('renders dates and times in locale', () => {
        let calendar = initCalendar({
          locale: frLocale,
        })
        let viewWrapper = new ListViewWrapper(calendar)
        let days = viewWrapper.getDayInfo()
        let events = viewWrapper.getEventInfo()

        expect(days.length).toBe(2)
        expect(days[0].date).toEqualDate('2016-08-15')
        expect(days[0].mainText).toEqual('lundi')
        expect(days[0].altText).toEqual('15 août 2016')
        expect(days[1].date).toEqualDate('2016-08-17')
        expect(days[1].mainText).toEqual('mercredi')
        expect(days[1].altText).toEqual('17 août 2016')

        expect(events.length).toBe(2)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toMatch(/^0?7:00$/)
        expect(events[1].title).toBe('event 2')
        expect(events[1].timeText).toMatch(/^0?9:00 - 11:00$/)
      })
    })

    describe('when multi-day', () => {
      pushOptions({
        nextDayThreshold: '00:00',
      })

      it('renders partial and full days', () => {
        let calendar = initCalendar({
          events: [
            {
              title: 'event 1',
              start: '2016-08-15T07:00',
              end: '2016-08-17T11:00',
            },
          ],
        })
        let viewWrapper = new ListViewWrapper(calendar)
        let events = viewWrapper.getEventInfo()

        expect(events.length).toBe(3)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('7:00am - 12:00am')
        expect(events[1].title).toBe('event 1')
        expect(events[1].timeText).toBe('all-day')
        expect(events[2].title).toBe('event 1')
        expect(events[2].timeText).toBe('12:00am - 11:00am')
      })

      it('truncates an out-of-range start', () => {
        let calendar = initCalendar({
          events: [
            {
              title: 'event 1',
              start: '2016-08-13T07:00',
              end: '2016-08-16T11:00',
            },
          ],
        })
        let viewWrapper = new ListViewWrapper(calendar)
        let events = viewWrapper.getEventInfo()

        expect(events.length).toBe(3)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('all-day')
        expect(events[1].title).toBe('event 1')
        expect(events[1].timeText).toBe('all-day')
        expect(events[2].title).toBe('event 1')
        expect(events[2].timeText).toBe('12:00am - 11:00am')
      })

      it('truncates an out-of-range start', () => {
        let calendar = initCalendar({
          events: [
            {
              title: 'event 1',
              start: '2016-08-18T07:00',
              end: '2016-08-21T11:00',
            },
          ],
        })
        let viewWrapper = new ListViewWrapper(calendar)
        let events = viewWrapper.getEventInfo()

        expect(events.length).toBe(3)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('7:00am - 12:00am')
        expect(events[1].title).toBe('event 1')
        expect(events[1].timeText).toBe('all-day')
        expect(events[2].title).toBe('event 1')
        expect(events[2].timeText).toBe('all-day')
      })
    })

    it('renders same days when equal to nextDayThreshold', () => {
      let calendar = initCalendar({
        nextDayThreshold: '09:00',
        events: [
          {
            title: 'event 1',
            start: '2016-08-15T07:00',
            end: '2016-08-17T09:00',
          },
        ],
      })
      let viewWrapper = new ListViewWrapper(calendar)
      let events = viewWrapper.getEventInfo()

      expect(events.length).toBe(3)
      expect(events[0].title).toBe('event 1')
      expect(events[0].timeText).toBe('7:00am - 12:00am')
      expect(events[1].title).toBe('event 1')
      expect(events[1].timeText).toBe('all-day')
      expect(events[2].title).toBe('event 1')
      expect(events[2].timeText).toBe('12:00am - 9:00am')
    })

    it('renders fewer days when before nextDayThreshold', () => {
      let calendar = initCalendar({
        nextDayThreshold: '09:00',
        events: [
          {
            title: 'event 1',
            start: '2016-08-15T07:00',
            end: '2016-08-17T08:00',
          },
        ],
      })
      let viewWrapper = new ListViewWrapper(calendar)
      let events = viewWrapper.getEventInfo()

      expect(events.length).toBe(2)
      expect(events[0].title).toBe('event 1')
      expect(events[0].timeText).toBe('7:00am - 12:00am')
      expect(events[1].title).toBe('event 1')
      expect(events[1].timeText).toBe('12:00am - 8:00am')
    })
  })

  describe('when an event has no title', () => {
    it('renders no text for its title', () => {
      let calendar = initCalendar({
        events: [
          {
            start: '2016-08-15',
          },
        ],
      })
      let viewWrapper = new ListViewWrapper(calendar)
      let events = viewWrapper.getEventInfo()

      expect(events.length).toBe(1)
      expect(events[0].title).toBe('')
      expect(events[0].timeText).toBe('all-day')
    })
  })

  describe('when no events', () => {
    it('renders an empty message', () => {
      let calendar = initCalendar()
      let viewWrapper = new ListViewWrapper(calendar)
      expect(viewWrapper.hasEmptyMessage()).toBe(true)
    })
  })

  describe('with lots of events', () => {
    pushOptions({
      now: '2016-08-29',
      events: [
        {
          title: 'All Day Event',
          start: '2016-08-29',
        },
        {
          title: 'Long Event',
          start: '2016-08-28',
          end: '2016-09-04',
        },
        {
          title: 'Meeting',
          start: '2016-08-29T10:30:00',
        },
        {
          title: 'Lunch',
          start: '2016-08-30T12:00:00',
        },
        {
          title: 'Meeting',
          start: '2016-08-30T14:30:00',
        },
        {
          title: 'Happy Hour',
          start: '2014-11-12T17:30:00',
        },
        {
          title: 'Dinner',
          start: '2014-11-12T20:00:00',
        },
        {
          title: 'Birthday Party',
          start: '2016-08-29T07:00:00',
        },
        {
          title: 'Click for Google',
          url: 'http://google.com/',
          start: '2016-08-31',
        },
      ],
    })

    it('sorts events correctly', () => {
      let calendar = initCalendar()
      let viewWrapper = new ListViewWrapper(calendar)
      let days = viewWrapper.getDayInfo()
      let events = viewWrapper.getEventInfo()

      expect(days.length).toBe(7)
      expect(days[0].date).toEqualDate('2016-08-28')
      expect(days[1].date).toEqualDate('2016-08-29')
      expect(days[2].date).toEqualDate('2016-08-30')
      expect(days[3].date).toEqualDate('2016-08-31')
      expect(days[4].date).toEqualDate('2016-09-01')
      expect(days[5].date).toEqualDate('2016-09-02')
      expect(days[6].date).toEqualDate('2016-09-03')

      expect(events.length).toBe(13)
      expect(events[0].title).toBe('Long Event')
      expect(events[0].timeText).toBe('all-day')
      expect(events[1].title).toBe('Long Event')
      expect(events[1].timeText).toBe('all-day')
      expect(events[2].title).toBe('All Day Event')
      expect(events[2].timeText).toBe('all-day')
      expect(events[3].title).toBe('Birthday Party')
      expect(events[3].timeText).toBe('7:00am')
      expect(events[4].title).toBe('Meeting')
      expect(events[4].timeText).toBe('10:30am')
      expect(events[5].title).toBe('Long Event')
      expect(events[5].timeText).toBe('all-day')
      expect(events[6].title).toBe('Lunch')
      expect(events[6].timeText).toBe('12:00pm')
      expect(events[7].title).toBe('Meeting')
      expect(events[7].timeText).toBe('2:30pm')
      expect(events[8].title).toBe('Long Event')
      expect(events[8].timeText).toBe('all-day')
      expect(events[9].title).toBe('Click for Google')
      expect(events[9].timeText).toBe('all-day')
      expect(events[10].title).toBe('Long Event')
      expect(events[10].timeText).toBe('all-day')
      expect(events[11].title).toBe('Long Event')
      expect(events[11].timeText).toBe('all-day')
      expect(events[12].title).toBe('Long Event')
      expect(events[12].timeText).toBe('all-day')
    })

    it('can sort events with non-date property first', () => {
      let calendar = initCalendar({
        now: '2016-08-29',
        eventOrder: 'title',
        events: [
          {
            title: 'Sup',
            start: '2016-08-29T00:00:00',
          },
          {
            title: 'Dude',
            start: '2016-08-29T10:30:00',
          },
          {
            title: 'Hello',
            start: '2016-08-30',
          },
        ],
      })
      let viewWrapper = new ListViewWrapper(calendar)
      let days = viewWrapper.getDayInfo()
      let events = viewWrapper.getEventInfo()

      expect(days.length).toBe(2)
      expect(days[0].date).toEqualDate('2016-08-29')
      expect(days[1].date).toEqualDate('2016-08-30')

      expect(events.length).toBe(3)
      expect(events[0].title).toBe('Dude')
      expect(events[1].title).toBe('Sup')
      expect(events[2].title).toBe('Hello')
    })

    it('makes scrollbars', () => {
      let $el = $('<div style="width:300px" />').appendTo('body')
      let calendar = initCalendar({ headerToolbar: false }, $el)
      let viewWrapper = new ListViewWrapper(calendar)
      let scrollEl = viewWrapper.getScrollerEl()

      expect(
        scrollEl.scrollHeight,
      ).toBeGreaterThan(
        scrollEl.clientHeight + 100,
      )

      $el.remove()
    })

    it('doesn\'t have scrollbars when height is \'auto\'', () => {
      let $el = $('<div style="width:300px" />').appendTo('body')
      let calendar = initCalendar({
        headerToolbar: false,
        height: 'auto',
      }, $el)
      let viewWrapper = new ListViewWrapper(calendar)
      let scrollEl = viewWrapper.getScrollerEl()

      expect(
        Math.abs(scrollEl.scrollHeight - scrollEl.clientHeight),
      ).toBeLessThan(2)
      $el.remove()
    })
  })

  it('updates rendered events despite fetch range being lazy', () => {
    let calendar = initCalendar({
      now: '2016-09-12',
      initialView: 'dayGridMonth',
      events: [
        { title: 'event1', start: '2016-09-12' },
      ],
    })

    calendar.changeView('listWeek')

    let viewWrapper = new ListViewWrapper(calendar)
    expect(viewWrapper.getEventEls().length).toBe(1)
    calendar.prev()
    expect(viewWrapper.getEventEls().length).toBe(0)
  })
})
