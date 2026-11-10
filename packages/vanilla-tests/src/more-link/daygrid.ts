import { describe, expect, it, vi } from 'vitest'
import { appendTestElement, createCalendarElement, initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { getEventIdOfEl, queryPart, queryParts } from '../lib/models/events'
import {
  findOverlappingEls,
  getCoveredDates,
  getEventTitles,
  getMoreLinkEls,
  getVisibleEventEls,
} from '../lib/models/event-content'
import { waitForSettle } from '../lib/settle'

function getMoreLinkTexts(root: HTMLElement): string[] {
  return getMoreLinkEls(root).map((el) => el.textContent!)
}

/*
Expects each more-link to sit fully inside (horizontally and vertically) the day cell of its date.
*/
function expectMoreLinksInCells(root: HTMLElement, moreLinkEls: HTMLElement[], dates: string[]) {
  const dayGrid = new DayGridModel(root)
  expect(moreLinkEls.length).toBe(dates.length)

  moreLinkEls.forEach((moreLinkEl, i) => {
    const rect = moreLinkEl.getBoundingClientRect()
    const cellRect = dayGrid.getDayCell(dates[i]).getBoundingClientRect()
    expect(rect.height).toBeGreaterThan(0)
    expect(rect.left).toBeGreaterThanOrEqual(cellRect.left - 0.5)
    expect(rect.right).toBeLessThanOrEqual(cellRect.right + 0.5)
    expect(rect.top).toBeGreaterThanOrEqual(cellRect.top - 0.5)
    expect(rect.bottom).toBeLessThanOrEqual(cellRect.bottom + 0.5)
  })
}

function getSortedEventIds(eventEls: HTMLElement[]): string[] {
  return eventEls.map(getEventIdOfEl).sort()
}

describe('more-links in dayGrid', () => {
  describe('dayMaxEventRows as a number', () => {
    const options = {
      initialView: 'dayGridMonth',
      initialDate: '2014-08-01',
      dayMaxEventRows: 3,
    }

    it.each([
      { count: 2, moreLinks: [] },
      { count: 3, moreLinks: [] },
      { count: 4, moreLinks: ['+2 more'] },
    ])('with $count single-day events, renders more-links: $moreLinks', async ({ count, moreLinks }) => {
      const events = Array.from({ length: count }, (_, i) => ({ title: `event${i + 1}`, start: '2014-07-29' }))
      const calendar = initCalendar({ ...options, events })
      await waitForSettle()

      expect(getMoreLinkTexts(calendar.el)).toEqual(moreLinks)
      expect(getVisibleEventEls(calendar.el).length).toBe(moreLinks.length ? 2 : count) // the link takes a row
    })

    it('renders the more-link in dayGridWeek too', async () => {
      const calendar = initCalendar({
        ...options,
        initialView: 'dayGridWeek',
        events: Array.from({ length: 4 }, () => ({ start: '2014-07-29' })),
      })
      await waitForSettle()

      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.map((el) => el.textContent)).toEqual(['+2 more'])
      expect(getCoveredDates(moreLinkEls[0])).toEqual(['2014-07-29'])
      expectMoreLinksInCells(calendar.el, moreLinkEls, ['2014-07-29'])
    })

    it('renders a more-link on each day under hidden multi-day events', async () => {
      const calendar = initCalendar({
        ...options,
        events: Array.from({ length: 4 }, () => ({ start: '2014-07-29', end: '2014-07-31' })),
      })
      await waitForSettle()

      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.map((el) => el.textContent)).toEqual(['+2 more', '+2 more'])
      expect(moreLinkEls.map(getCoveredDates)).toEqual([['2014-07-29'], ['2014-07-30']])
      expectMoreLinksInCells(calendar.el, moreLinkEls, ['2014-07-29', '2014-07-30'])
    })

    it('renders a single-day event that fits beside the more-link of other days', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { title: 'event1', start: '2014-07-29', end: '2014-07-31' },
          { title: 'event2', start: '2014-07-29', end: '2014-07-31' },
          { title: 'event3', start: '2014-07-29', end: '2014-07-31' },
          { title: 'event4', start: '2014-07-29' },
        ],
      })
      await waitForSettle()

      expect(getVisibleEventEls(calendar.el).length).toBe(3)
      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.map((el) => el.textContent)).toEqual(['+2 more'])
      expect(getCoveredDates(moreLinkEls[0])).toEqual(['2014-07-29'])
      expectMoreLinksInCells(calendar.el, moreLinkEls, ['2014-07-29'])
    })

    // https://github.com/fullcalendar/fullcalendar/issues/6187
    it('renders the visible part of a partially hidden multi-day event', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
          { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
          { title: 'event3', start: '2014-07-28', end: '2014-07-30' },
          { title: 'event4', start: '2014-07-29', end: '2014-07-31' },
        ],
      })
      await waitForSettle()

      expect(getVisibleEventEls(calendar.el).length).toBe(4)
      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.map((el) => el.textContent)).toEqual(['+2 more'])
      expect(getCoveredDates(moreLinkEls[0])).toEqual(['2014-07-29'])
      expectMoreLinksInCells(calendar.el, moreLinkEls, ['2014-07-29'])
    })

    it.each([
      { desc: 'its first', date: '2014-07-28' },
      { desc: 'its second', date: '2014-07-29' },
    ])('renders a more-link for single-day events under a multi-day event, in $desc day', async ({ date }) => {
      const calendar = initCalendar({
        ...options,
        events: [
          { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
          { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
          { title: 'event3', start: date },
          { title: 'event4', start: date },
        ],
      })
      await waitForSettle()

      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.map((el) => el.textContent)).toEqual(['+2 more'])
      expect(getCoveredDates(moreLinkEls[0])).toEqual([date])
      expectMoreLinksInCells(calendar.el, moreLinkEls, [date])
    })

    it('limits to one row per week with dayMaxEventRows:1', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2021-10-31',
        dayMaxEventRows: 1,
        events: [
          { title: 'A', start: '2021-10-31', end: '2021-11-02' },
          { title: 'B', start: '2021-10-29', end: '2021-11-02' },
          { title: 'C', start: '2021-10-28T12:00:00', end: '2021-10-31T12:00:00' },
        ],
      })
      await waitForSettle()

      const els = [...getVisibleEventEls(calendar.el), ...getMoreLinkEls(calendar.el)]
      const tops = new Set(els.map((el) => Math.round(el.getBoundingClientRect().top)))
      expect(getMoreLinkEls(calendar.el).length).toBeGreaterThan(0)
      expect(tops.size).toBe(2) // two weeks, one line of events each
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5771
    it('places the more-link correctly when the first hidden event is longer than the one before it', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2020-08-01',
        dayMaxEventRows: 3,
        events: [
          { title: 'big1', start: '2020-07-23', end: '2020-07-28' },
          { title: 'small1', start: '2020-07-24', end: '2020-07-27' },
          { title: 'small2', start: '2020-07-24', end: '2020-07-27' },
          { title: 'big2', start: '2020-07-25', end: '2020-07-28' },
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(eventEls.length).toBe(3)
      expect(moreLinkEls.length).toBe(1)
      expect(findOverlappingEls([...eventEls, ...moreLinkEls])).toBeNull()
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5790
    it('places the more-link correctly in columns with empty space', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2020-09-01',
        dayMaxEventRows: 4,
        events: [
          { title: 'a', start: '2020-08-30', end: '2020-09-04' },
          { title: 'b', start: '2020-08-31', end: '2020-09-03' },
          { title: 'c', start: '2020-09-01', end: '2020-09-04' },
          { title: 'd', start: '2020-09-02', end: '2020-09-04' },
          { title: 'e', start: '2020-09-02', end: '2020-09-04' },
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(new Set(getEventTitles(eventEls))).toEqual(new Set(['a', 'b', 'c', 'd', 'e']))
      expect(moreLinkEls.map(getCoveredDates)).toEqual([['2020-09-02']])
      expect(findOverlappingEls([...eventEls, ...moreLinkEls])).toBeNull()
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5883
    it('leaves no gaps when ordered by title', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2020-10-01',
        eventOrder: 'title',
        dayMaxEventRows: 3,
        events: [
          { title: 'b1', start: '2020-10-20', end: '2020-10-22' },
          { title: 'b2', start: '2020-10-21', end: '2020-10-22' },
          { title: 'b3', start: '2020-10-20', end: '2020-10-23' },
          { title: 'b4', start: '2020-10-20', end: '2020-10-23' },
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(new Set(getEventTitles(eventEls))).toEqual(new Set(['b1', 'b2', 'b3', 'b4']))
      expect(moreLinkEls.map(getCoveredDates)).toEqual([['2020-10-21']])
      expect(findOverlappingEls([...eventEls, ...moreLinkEls])).toBeNull()
    })

    // https://github.com/fullcalendar/fullcalendar/issues/7462
    it('doesn\'t recurse infinitely with many hidden rows', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2023-09-01',
        dayMaxEventRows: 6,
        events: [
          { start: '2023-09-28T00:00:00', end: '2023-10-01T00:00:00' },
          { start: '2023-09-26T00:00:00', end: '2023-09-27T00:00:00' },
          { start: '2023-09-20T17:00:00', end: '2023-09-27T17:00:00' },
          { start: '2023-09-21T16:00:00', end: '2023-09-25T14:00:00' },
          { start: '2023-09-21T16:00:00', end: '2023-09-25T11:00:00' },
          { start: '2023-09-28T10:00:00', end: '2023-09-28T15:00:00' },
          { start: '2023-09-27T08:00:00', end: '2023-10-04T18:00:00' },
          { start: '2023-09-20T13:00:00', end: '2023-09-29T12:00:00' },
          { start: '2023-09-20T12:00:00', end: '2023-09-29T12:00:00' },
          { start: '2023-09-27T11:00:00', end: '2023-09-28T18:00:00' },
          { start: '2023-03-29T23:00:00', end: '2024-03-29T22:00:00' },
          { start: '2023-09-25T02:00:00', end: '2023-09-29T12:00:00' },
          { start: '2023-09-22T14:00:00', end: '2023-09-29T12:00:00' },
          { start: '2023-09-22T14:00:00', end: '2023-09-28T12:00:00' },
          { start: '2023-09-19T13:00:00', end: '2023-09-30T13:00:00' },
        ],
      })
      await waitForSettle()

      expect(getMoreLinkEls(calendar.el).length).toBeGreaterThan(0)
      expect(findOverlappingEls([...getVisibleEventEls(calendar.el), ...getMoreLinkEls(calendar.el)])).toBeNull()
    })

    it.each([
      { desc: 'one event', count: 1, renders: false },
      { desc: 'too many events', count: 5, renders: true },
    ])('calls moreLinkDidMount only for real more-links ($desc)', async ({ count, renders }) => {
      const moreLinkDidMount = vi.fn()
      const calendar = initCalendar({
        ...options,
        moreLinkDidMount,
        events: Array.from({ length: count }, () => ({ start: '2014-07-29' })),
      })
      await waitForSettle()

      expect(getVisibleEventEls(calendar.el).length).toBe(renders ? 2 : 1)
      expect(moreLinkDidMount.mock.calls.length > 0).toBe(renders)
    })
  })

  describe('dayMaxEvents:true', () => {
    const options = {
      initialView: 'dayGridMonth',
      initialDate: '2014-08-01',
      dayMaxEvents: true,
    }
    const manyEvents = [
      { start: '2014-07-28', end: '2014-07-30' },
      { start: '2014-07-28', end: '2014-07-30' },
      ...Array.from({ length: 11 }, () => ({ start: '2014-07-29' })),
    ]

    it('keeps rows the same height, regardless of their events', async () => {
      const calendar = initCalendar({ ...options, events: manyEvents })
      await waitForSettle()

      const rowHeights = queryParts(calendar.el, 'dayRow').map((el) => el.getBoundingClientRect().height)
      expect(rowHeights.length).toBe(6)
      expect(Math.max(...rowHeights) - Math.min(...rowHeights)).toBeLessThan(2)
      expect(getMoreLinkEls(calendar.el).length).toBeGreaterThan(0)
    })

    it('renders a more-link when there are obviously too many events', async () => {
      const el = createCalendarElement()
      el.style.width = '800px'
      const calendar = initCalendar({ ...options, events: manyEvents }, el)
      await waitForSettle()

      expect(getMoreLinkEls(calendar.el).length).toBe(1)
    })

    it.each([
      { view: 'dayGridMonth' },
      { view: 'dayGridWeek' },
    ])('renders no more-link where there obviously is room, in $view', async ({ view }) => {
      const calendar = initCalendar({
        ...options,
        initialView: view,
        events: [{ start: '2014-07-28', end: '2014-07-30' }],
      })
      await waitForSettle()

      expect(getVisibleEventEls(calendar.el).length).toBe(1)
      expect(getMoreLinkEls(calendar.el).length).toBe(0)
    })

    it('adjusts more-links when a liquid-height calendar grows and shrinks', async () => {
      const containerEl = appendTestElement(document.createElement('div'))
      containerEl.style.height = '800px'
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2020-05-01',
        height: '100%',
        dayMaxEvents: true,
        events: Array.from({ length: 6 }, (_, i) => ({ start: '2020-05-02', title: `event ${i}` })),
      }, containerEl.appendChild(document.createElement('div')))
      await waitForSettle()
      const largeCount = getVisibleEventEls(calendar.el).length

      containerEl.style.height = '500px'
      await waitForSettle()
      const smallCount = getVisibleEventEls(calendar.el).length
      expect(smallCount).toBeLessThan(largeCount)

      containerEl.style.height = '800px'
      await waitForSettle()
      expect(getVisibleEventEls(calendar.el).length).toBe(largeCount)
    })
  })

  describe('with wrapping event content', () => {
    // https://github.com/fullcalendar/fullcalendar/issues/7447
    const options = {
      initialView: 'dayGridWeek',
      initialDate: '2023-04-09',
      eventContent: () => ({
        html: '<div style="white-space: normal"><strong>AAAAAAAAAA</strong> <strong>BBBBBBBBB</strong></div>',
      }),
      events: [
        { id: 'a', start: '2023-04-14', end: '2023-04-21' },
        { id: 'b', start: '2023-04-13', end: '2023-04-22' },
        { id: 'c', start: '2023-04-06', end: '2023-04-15' },
        { id: 'd', start: '2023-04-11', end: '2023-04-14' },
        { id: 'e', start: '2023-04-14', end: '2023-04-19' },
        { id: 'f', start: '2023-04-13', end: '2023-04-19' },
        { id: 'g', start: '2023-04-05', end: '2023-04-14' },
        { id: 'h', start: '2023-04-06', end: '2023-04-15' },
        { id: 'i', start: '2023-04-13', end: '2023-04-15' },
        { id: 'j', start: '2023-04-12', end: '2023-04-15' },
      ],
    }

    it('doesn\'t overlap events with dayMaxEvents:4', async () => {
      const calendar = initCalendar({ ...options, dayMaxEvents: 4 })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(getSortedEventIds(eventEls)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) // i and j are hidden
      expect(findOverlappingEls(eventEls)).toBeNull()
    })

    it('keeps events within a short row with dayMaxEvents:true', async () => {
      const calendar = initCalendar({ ...options, height: 250, dayMaxEvents: true })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      const rowBottom = queryPart(calendar.el, 'dayRow')!.getBoundingClientRect().bottom

      expect(getMoreLinkEls(calendar.el).length).toBeGreaterThan(0) // the limit actually binds
      expect(getSortedEventIds(eventEls)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j']) // i is hidden
      expect(findOverlappingEls(eventEls)).toBeNull()
      for (const eventEl of eventEls) {
        expect(eventEl.getBoundingClientRect().bottom).toBeLessThanOrEqual(rowBottom + 1)
      }
    })
  })

  describe('with almost no room', () => {
    // https://github.com/fullcalendar/fullcalendar/issues/5850
    it('renders without errors at almost no height', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2020-05-01',
        height: '100%',
        eventDisplay: 'block',
        dayMaxEventRows: true,
        events: [{ start: '2020-05-02T02:00:00' }],
      })
      await waitForSettle()

      expect(queryParts(calendar.el, 'dayRow').length).toBe(6)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5863
    it('renders without errors at almost no width', async () => {
      const el = createCalendarElement()
      el.style.width = '100px'
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2020-05-01',
        height: '100%',
        eventDisplay: 'block',
        dayMaxEventRows: true,
        events: [{ start: '2020-05-02T02:00:00' }],
      }, el)
      await waitForSettle()

      expect(queryParts(calendar.el, 'dayRow').length).toBe(6)
    })
  })
})
