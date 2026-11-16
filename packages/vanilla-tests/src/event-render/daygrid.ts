import { describe, expect, it } from 'vitest'
import { EventInput, EventSourceFuncInfo } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import {
  findOverlappingEls,
  getCoveredDates,
  getEventTexts,
  getVisibleEventEls,
} from '../lib/models/event-content'
import { waitForSettle } from '../lib/settle'

// tags each segment with whether it holds the event's start/end
const edgeClasses = {
  eventClass: (data: { isStart: boolean, isEnd: boolean }) => [
    data.isStart && 'test-start',
    data.isEnd && 'test-end',
  ].filter(Boolean).join(' '),
}

function getSegEdges(el: HTMLElement): { isStart: boolean, isEnd: boolean } {
  return {
    isStart: el.classList.contains('test-start'),
    isEnd: el.classList.contains('test-end'),
  }
}

describe('dayGrid event rendering', () => {
  describe('segment placement', () => {
    const options = {
      ...edgeClasses,
      initialView: 'dayGridMonth',
      initialDate: '2014-08-01', // shows 2014-07-27 - 2014-09-07
    }

    it.each([
      {
        desc: 'starting before the view',
        event: { start: '2014-07-26', end: '2014-07-30' },
        dates: ['2014-07-27', '2014-07-28', '2014-07-29'],
        isStart: false,
        isEnd: true,
      },
      {
        desc: 'starting at the view start',
        event: { start: '2014-07-27', end: '2014-07-29' },
        dates: ['2014-07-27', '2014-07-28'],
        isStart: true,
        isEnd: true,
      },
      {
        desc: 'within a week',
        event: { start: '2014-08-01', end: '2014-08-02' },
        dates: ['2014-08-01'],
        isStart: true,
        isEnd: true,
      },
      {
        desc: 'starting on a hidden day at week start',
        extraOptions: { weekends: false },
        event: { start: '2014-07-27', end: '2014-07-30' },
        dates: ['2014-07-28', '2014-07-29'],
        isStart: false,
        isEnd: true,
      },
      {
        desc: 'starting on a hidden day mid-week',
        extraOptions: { hiddenDays: [2] }, // Tuesdays
        event: { start: '2014-07-29', end: '2014-08-01' },
        dates: ['2014-07-30', '2014-07-31'],
        isStart: false,
        isEnd: true,
      },
      {
        desc: 'ending before the view end',
        event: { start: '2014-09-02', end: '2014-09-05' },
        dates: ['2014-09-02', '2014-09-03', '2014-09-04'],
        isStart: true,
        isEnd: true,
      },
      {
        desc: 'ending at the view end',
        event: { start: '2014-09-04', end: '2014-09-07' },
        dates: ['2014-09-04', '2014-09-05', '2014-09-06'],
        isStart: true,
        isEnd: true,
      },
      {
        desc: 'ending after the view end',
        event: { start: '2014-09-04', end: '2014-09-08' },
        dates: ['2014-09-04', '2014-09-05', '2014-09-06'],
        isStart: true,
        isEnd: false,
      },
      {
        desc: 'ending at a week end',
        event: { start: '2014-08-28', end: '2014-08-31' },
        dates: ['2014-08-28', '2014-08-29', '2014-08-30'],
        isStart: true,
        isEnd: true,
      },
      {
        desc: 'ending on a hidden day at week end',
        extraOptions: { weekends: false },
        event: { start: '2014-07-30', end: '2014-08-03' },
        dates: ['2014-07-30', '2014-07-31', '2014-08-01'],
        isStart: true,
        isEnd: false,
      },
      {
        desc: 'ending on a hidden day mid-week',
        extraOptions: { hiddenDays: [4] }, // Thursdays
        event: { start: '2014-07-28', end: '2014-08-01' },
        dates: ['2014-07-28', '2014-07-29', '2014-07-30'],
        isStart: true,
        isEnd: false,
      },
    ])('renders an event $desc over the right days', async ({ extraOptions, event, dates, isStart, isEnd }) => {
      const calendar = initCalendar({ ...options, ...extraOptions, events: [event] })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(1)
      expect(getCoveredDates(eventEls[0])).toEqual(dates)
      expect(getSegEdges(eventEls[0])).toEqual({ isStart, isEnd })
    })

    it('mirrors segments in RTL', async () => {
      const calendar = initCalendar({
        ...options,
        direction: 'rtl',
        events: [{ start: '2014-07-27', end: '2014-07-29' }],
      })
      await waitForSettle()

      const eventEl = getVisibleEventEls(calendar.el)[0]
      const dayGrid = new DayGridModel(calendar.el)
      const sundayRect = dayGrid.getDayCell('2014-07-27').getBoundingClientRect()
      const mondayRect = dayGrid.getDayCell('2014-07-28').getBoundingClientRect()
      const eventRect = eventEl.getBoundingClientRect()

      expect(sundayRect.left).toBeGreaterThan(mondayRect.left) // the week starts on the right
      expect(getCoveredDates(eventEl)).toEqual(['2014-07-27', '2014-07-28'])
      expect(eventRect.right).toBeLessThanOrEqual(sundayRect.right + 1)
      expect(eventRect.left).toBeGreaterThanOrEqual(mondayRect.left - 1)
      expect(getSegEdges(eventEl)).toEqual({ isStart: true, isEnd: true })
    })

    it('splits an event at week boundaries', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ start: '2014-08-01', end: '2014-08-05' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.map(getCoveredDates)).toEqual([
        ['2014-08-01', '2014-08-02'],
        ['2014-08-03', '2014-08-04'],
      ])
      expect(eventEls.map(getSegEdges)).toEqual([
        { isStart: true, isEnd: false },
        { isStart: false, isEnd: true },
      ])
    })

    it('keeps the same vertical order of events in every week', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { id: '1', start: '2014-08-01', end: '2014-08-04' },
          { id: '2', start: '2014-08-02', end: '2014-08-05' },
        ],
      })
      await waitForSettle()

      const dayGrid = new DayGridModel(calendar.el)
      const [event1Week1, event1Week2] = dayGrid.getEventEls('1')
      const [event2Week1, event2Week2] = dayGrid.getEventEls('2')

      expect(getCoveredDates(event1Week2)).toEqual(['2014-08-03'])
      expect(getCoveredDates(event2Week2)).toEqual(['2014-08-03', '2014-08-04'])
      expect(event1Week1.getBoundingClientRect().top).toBeLessThan(event2Week1.getBoundingClientRect().top)
      expect(event1Week2.getBoundingClientRect().top).toBeLessThan(event2Week2.getBoundingClientRect().top)
    })

    // validRange disables the days outside it
    it.each([
      {
        desc: 'start',
        validRange: { start: '2017-06-07' },
        dates: ['2017-06-07', '2017-06-08'],
        isStart: false,
        isEnd: true,
      },
      {
        desc: 'end',
        validRange: { end: '2017-06-07' },
        dates: ['2017-06-05', '2017-06-06'],
        isStart: true,
        isEnd: false,
      },
    ])('truncates an event at the validRange $desc', async ({ validRange, dates, isStart, isEnd }) => {
      const calendar = initCalendar({
        ...options,
        initialDate: '2017-06-01',
        validRange,
        events: [{ start: '2017-06-05', end: '2017-06-09' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(1)
      expect(getCoveredDates(eventEls[0])).toEqual(dates)
      expect(getSegEdges(eventEls[0])).toEqual({ isStart, isEnd })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4483
    it('renders events on the last day when slotMaxTime is before midnight', async () => {
      const calendar = initCalendar({
        ...options,
        initialView: 'dayGridWeek',
        initialDate: '2017-03-22',
        slotMaxTime: '20:00',
        events: [{ start: '2017-03-19', end: '2017-03-26' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(1)
      expect(getCoveredDates(eventEls[0])).toEqual([
        '2017-03-19', '2017-03-20', '2017-03-21', '2017-03-22', '2017-03-23', '2017-03-24', '2017-03-25',
      ])
      expect(getSegEdges(eventEls[0])).toEqual({ isStart: true, isEnd: true })
    })
  })

  describe('display', () => {
    const options = {
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
    }

    function isListItem(el: HTMLElement): boolean {
      return el.matches('.test-part-listItemEvent')
    }

    function isBlock(el: HTMLElement): boolean {
      return el.matches('.test-part-blockEvent')
    }

    it('renders a single-day timed event as a list item, by default', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ title: 'event 1', start: '2020-05-11T22:00:00' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(1)
      expect(isListItem(eventEls[0])).toBe(true)
      expect(isBlock(eventEls[0])).toBe(false)
      expect(getEventTexts(eventEls[0])).toEqual({ time: '10p', title: 'event 1' })
    })

    it('renders a multi-day timed event as a block', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ start: '2020-05-11T22:00:00', end: '2020-05-12T06:00:00' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(1)
      expect(isBlock(eventEls[0])).toBe(true)
      expect(isListItem(eventEls[0])).toBe(false)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5634
    it('renders a multi-day timed event split across weeks as blocks', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ start: '2020-05-09T12:00:00', end: '2020-05-10T12:00:00' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.map(getCoveredDates)).toEqual([['2020-05-09'], ['2020-05-10']])
      expect(eventEls.map(isBlock)).toEqual([true, true])
    })

    it('renders a single-day timed event as a block with eventDisplay:block', async () => {
      const calendar = initCalendar({
        ...options,
        eventDisplay: 'block',
        events: [{ start: '2020-05-02T02:00:00' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(1)
      expect(isBlock(eventEls[0])).toBe(true)
      expect(isListItem(eventEls[0])).toBe(false)
    })
  })

  describe('stacking', () => {
    // https://github.com/fullcalendar/fullcalendar/issues/5408
    it('stacks overlapping events without intersecting', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2020-05-01',
        events: [
          { start: '2020-05-02', end: '2020-05-04', title: 'event a' },
          { start: '2020-05-02', end: '2020-05-04', title: 'event b' },
          { start: '2020-05-03', end: '2020-05-05', title: 'event c' },
          { start: '2020-05-04', title: 'event d' },
          { start: '2020-05-04', title: 'event e' },
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(7) // a and b are split across two weeks
      expect(findOverlappingEls(eventEls)).toBeNull()
    })

    it('stacks events of varying custom heights without intersecting', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2020-06-01',
        events: [
          { start: '2020-06-04', end: '2020-06-08', title: 'event a' },
          { start: '2020-06-05', end: '2020-06-09', title: 'event b' },
          { start: '2020-06-08T12:00:00', title: 'event c' },
        ],
        eventContent(info) { // varying-height events revealed the bug
          return {
            html: `
              <b>${info.timeText}</b>
              <i>${info.event.title}</i>
            `,
          }
        },
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(5)
      expect(findOverlappingEls(eventEls)).toBeNull()
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6486
  it('treats an all-day event that ended at today\'s midnight as past', async () => {
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2023-04-09',
      now: '2023-04-09',
      eventClass: (data) => (data.isPast ? 'test-past' : ''),
      events: [
        { id: 'yesterday', start: '2023-04-08' },
        { id: 'today', start: '2023-04-09' },
      ],
    })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    expect(dayGrid.getEventEls('yesterday')[0].classList.contains('test-past')).toBe(true)
    expect(dayGrid.getEventEls('today')[0].classList.contains('test-past')).toBe(false)
  })

  // An event on a day that's disabled in the next month (showNonCurrentDates:false) disappeared after
  // navigating there and back with an async event source. https://jsfiddle.net/cv02ywmk/1
  it('keeps rendering async events after navigating away and back, with showNonCurrentDates:false', async () => {
    const pendingFetches: (() => void)[] = []
    const events: EventInput[] = [{ title: 'event', start: '2026-06-28' }]
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2026-06-17',
      showNonCurrentDates: false,
      events(_info: EventSourceFuncInfo, success: (events: EventInput[]) => void) {
        pendingFetches.push(() => success(events))
      },
    })

    // the view renders (empty) while its fetch is pending, then gets the events
    async function resolveFetches(): Promise<void> {
      await waitForSettle()
      expect(pendingFetches.length).toBe(1)
      while (pendingFetches.length) {
        pendingFetches.shift()!()
      }
      await waitForSettle()
    }

    await resolveFetches()
    expect(getVisibleEventEls(calendar.el).length).toBe(1)

    calendar.next()
    await resolveFetches()
    expect(getVisibleEventEls(calendar.el).length).toBe(0) // Jun 28 is disabled in July

    calendar.prev()
    await resolveFetches()
    const eventEls = getVisibleEventEls(calendar.el)
    expect(eventEls.length).toBe(1)
    expect(getCoveredDates(eventEls[0])).toEqual(['2026-06-28'])
  })

})
