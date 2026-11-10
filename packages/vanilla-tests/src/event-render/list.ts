import { describe, expect, it, vi } from 'vitest'
import frLocale from 'fullcalendar/locales/fr'
import { strictModeFactor } from 'fullcalendar/protected-api'
import { createCalendarElement, initCalendar } from '../lib/calendar'
import { queryPart, queryParts } from '../lib/models/events'
import { getEventTexts, getVisibleEventEls } from '../lib/models/event-content'
import { enUsSep } from '../lib/intl'
import { waitForSettle } from '../lib/settle'

function getDayHeaders(root: HTMLElement): { date: string, texts: string[] }[] {
  return queryParts(root, 'listDayHeader').map((el) => ({
    date: el.getAttribute('data-date')!,
    texts: queryParts(el, 'listDayHeaderInner').map((innerEl) => innerEl.textContent!),
  }))
}

function getEventRows(root: HTMLElement): { time: string, title: string }[] {
  return getVisibleEventEls(root).map(getEventTexts)
}

/*
The nearest ancestor that scrolls vertically.
*/
function getScrollerEl(el: HTMLElement): HTMLElement {
  for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(ancestor).overflowY)) {
      return ancestor
    }
  }
  throw new Error('No vertical scroller')
}

describe('list view event rendering', () => {
  const options = {
    initialView: 'listWeek',
    now: '2016-08-20',
  }

  describe('all-day events', () => {
    it('renders only the days that have events', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { title: 'event 1', start: '2016-08-15' },
          { title: 'event 2', start: '2016-08-17' },
        ],
      })
      await waitForSettle()

      expect(getDayHeaders(calendar.el)).toEqual([
        { date: '2016-08-15', texts: ['Monday', 'August 15, 2016'] },
        { date: '2016-08-17', texts: ['Wednesday', 'August 17, 2016'] },
      ])
      expect(getEventRows(calendar.el)).toEqual([
        { time: 'All-day', title: 'event 1' },
        { time: 'All-day', title: 'event 2' },
      ])
    })

    it('renders a multi-day event on every day', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ title: 'event 1', start: '2016-08-15', end: '2016-08-18' }],
      })
      await waitForSettle()

      expect(getDayHeaders(calendar.el).map((day) => day.date)).toEqual(['2016-08-15', '2016-08-16', '2016-08-17'])
      expect(getEventRows(calendar.el)).toEqual([
        { time: 'All-day', title: 'event 1' },
        { time: 'All-day', title: 'event 1' },
        { time: 'All-day', title: 'event 1' },
      ])
    })

    it('renders an empty title for an untitled event', async () => {
      const calendar = initCalendar({ ...options, events: [{ start: '2016-08-15' }] })
      await waitForSettle()

      expect(getEventRows(calendar.el)).toEqual([{ time: 'All-day', title: '' }])
    })

    it('calls eventDidMount and eventWillUnmount for every event', async () => {
      const eventDidMount = vi.fn()
      const eventWillUnmount = vi.fn()
      const calendar = initCalendar({
        ...options,
        eventDidMount,
        eventWillUnmount,
        events: [
          { title: 'event 1', start: '2016-08-15' },
          { title: 'event 2', start: '2016-08-17' },
        ],
      })
      await waitForSettle()

      expect(eventDidMount).toHaveBeenCalledTimes(2 * strictModeFactor)
      expect(eventDidMount.mock.calls.map((args) => args[0].event.title).slice(-2)).toEqual(['event 1', 'event 2'])

      calendar.destroy()
      expect(eventWillUnmount).toHaveBeenCalledTimes(2 * strictModeFactor)
    })
  })

  describe('timed events', () => {
    const events = [
      { title: 'event 1', start: '2016-08-15T07:00' },
      { title: 'event 2', start: '2016-08-17T09:00', end: '2016-08-17T11:00' },
    ]

    it.each([
      {
        desc: 'start and end times',
        extraOptions: {},
        times: ['7:00am', `9:00${enUsSep}11:00am`],
      },
      {
        desc: 'no times with displayEventTime:false',
        extraOptions: { displayEventTime: false },
        times: ['', ''],
      },
      {
        desc: 'only start times with displayEventEnd:false',
        extraOptions: { displayEventEnd: false },
        times: ['7:00am', '9:00am'],
      },
    ])('renders $desc', async ({ extraOptions, times }) => {
      const calendar = initCalendar({ ...options, ...extraOptions, events })
      await waitForSettle()

      expect(getEventRows(calendar.el)).toEqual([
        { time: times[0], title: 'event 1' },
        { time: times[1], title: 'event 2' },
      ])
    })

    // regression: localized event dates leaking into view rendering unlocalized
    it('renders days and times in the locale', async () => {
      const calendar = initCalendar({ ...options, locale: frLocale, events })
      await waitForSettle()

      expect(getDayHeaders(calendar.el)).toEqual([
        { date: '2016-08-15', texts: ['lundi', '15 août 2016'] },
        { date: '2016-08-17', texts: ['mercredi', '17 août 2016'] },
      ])
      // leading zeros vary across ICU versions
      const rows = getEventRows(calendar.el)
      expect(rows.map((row) => row.title)).toEqual(['event 1', 'event 2'])
      expect(rows[0].time).toMatch(/^0?7:00$/)
      expect(rows[1].time).toMatch(new RegExp(`^0?9:00${enUsSep}11:00$`))
    })
  })

  describe('multi-day timed events', () => {
    it.each([
      {
        desc: 'partial first and last days, and full days between',
        event: { start: '2016-08-15T07:00', end: '2016-08-17T11:00' },
        dates: ['2016-08-15', '2016-08-16', '2016-08-17'],
        times: [`7:00am${enUsSep}12:00am`, 'All-day', `12:00${enUsSep}11:00am`],
      },
      {
        desc: 'a start before the view as full days',
        event: { start: '2016-08-13T07:00', end: '2016-08-16T11:00' },
        dates: ['2016-08-14', '2016-08-15', '2016-08-16'],
        times: ['All-day', 'All-day', `12:00${enUsSep}11:00am`],
      },
      {
        desc: 'an end after the view as full days',
        event: { start: '2016-08-18T07:00', end: '2016-08-21T11:00' },
        dates: ['2016-08-18', '2016-08-19', '2016-08-20'],
        times: [`7:00am${enUsSep}12:00am`, 'All-day', 'All-day'],
      },
    ])('renders $desc', async ({ event, dates, times }) => {
      const calendar = initCalendar({
        ...options,
        nextDayThreshold: '00:00',
        events: [{ title: 'event 1', ...event }],
      })
      await waitForSettle()

      expect(getDayHeaders(calendar.el).map((day) => day.date)).toEqual(dates)
      expect(getEventRows(calendar.el).map((row) => row.time)).toEqual(times)
    })

    it.each([
      {
        desc: 'includes the last day when the end equals nextDayThreshold',
        end: '2016-08-17T09:00',
        times: [`7:00am${enUsSep}12:00am`, 'All-day', `12:00${enUsSep}9:00am`],
      },
      {
        desc: 'excludes the last day when the end is before nextDayThreshold',
        end: '2016-08-17T08:00',
        times: [`7:00am${enUsSep}12:00am`, `12:00am${enUsSep}8:00am`],
      },
    ])('$desc', async ({ end, times }) => {
      const calendar = initCalendar({
        ...options,
        nextDayThreshold: '09:00',
        events: [{ title: 'event 1', start: '2016-08-15T07:00', end }],
      })
      await waitForSettle()

      expect(getEventRows(calendar.el).map((row) => row.time)).toEqual(times)
    })
  })

  it('renders a message when there are no events', async () => {
    const calendar = initCalendar({
      ...options,
      events: [{ start: '2016-08-22' }], // next week
    })
    await waitForSettle()

    expect(queryPart(calendar.el, 'noEvents')).not.toBeNull()
    expect(queryParts(calendar.el, 'listDay').length).toBe(0)

    calendar.next()
    await waitForSettle()

    expect(queryPart(calendar.el, 'noEvents')).toBeNull()
    expect(queryParts(calendar.el, 'listDay').length).toBe(1)
  })

  describe('with many events', () => {
    const manyOptions = {
      ...options,
      now: '2016-08-29',
      events: [
        { title: 'All Day Event', start: '2016-08-29' },
        { title: 'Long Event', start: '2016-08-28', end: '2016-09-04' },
        { title: 'Meeting', start: '2016-08-29T10:30:00' },
        { title: 'Lunch', start: '2016-08-30T12:00:00' },
        { title: 'Meeting', start: '2016-08-30T14:30:00' },
        { title: 'Happy Hour', start: '2014-11-12T17:30:00' },
        { title: 'Dinner', start: '2014-11-12T20:00:00' },
        { title: 'Birthday Party', start: '2016-08-29T07:00:00' },
        { title: 'Click for Google', url: 'http://google.com/', start: '2016-08-31' },
      ],
    }

    it('sorts events by day, all-day first, then by time', async () => {
      const calendar = initCalendar(manyOptions)
      await waitForSettle()

      expect(getDayHeaders(calendar.el).map((day) => day.date)).toEqual([
        '2016-08-28', '2016-08-29', '2016-08-30', '2016-08-31', '2016-09-01', '2016-09-02', '2016-09-03',
      ])
      expect(getEventRows(calendar.el)).toEqual([
        { time: 'All-day', title: 'Long Event' },
        { time: 'All-day', title: 'Long Event' },
        { time: 'All-day', title: 'All Day Event' },
        { time: '7:00am', title: 'Birthday Party' },
        { time: '10:30am', title: 'Meeting' },
        { time: 'All-day', title: 'Long Event' },
        { time: '12:00pm', title: 'Lunch' },
        { time: '2:30pm', title: 'Meeting' },
        { time: 'All-day', title: 'Long Event' },
        { time: 'All-day', title: 'Click for Google' },
        { time: 'All-day', title: 'Long Event' },
        { time: 'All-day', title: 'Long Event' },
        { time: 'All-day', title: 'Long Event' },
      ])
    })

    it('sorts by eventOrder within a day, before times', async () => {
      const calendar = initCalendar({
        ...options,
        now: '2016-08-29',
        eventOrder: 'title',
        events: [
          { title: 'Sup', start: '2016-08-29T00:00:00' },
          { title: 'Dude', start: '2016-08-29T10:30:00' },
          { title: 'Hello', start: '2016-08-30' },
        ],
      })
      await waitForSettle()

      expect(getDayHeaders(calendar.el).map((day) => day.date)).toEqual(['2016-08-29', '2016-08-30'])
      expect(getEventRows(calendar.el).map((row) => row.title)).toEqual(['Dude', 'Sup', 'Hello'])
    })

    it('scrolls when the events don\'t fit', async () => {
      const el = createCalendarElement()
      el.style.width = '300px'
      const calendar = initCalendar({ ...manyOptions, headerToolbar: false }, el)
      await waitForSettle()

      const scrollerEl = getScrollerEl(queryPart(calendar.el, 'listDays')!)
      const lastEventEl = getVisibleEventEls(calendar.el).pop()!
      expect(scrollerEl.scrollHeight).toBeGreaterThan(scrollerEl.clientHeight + 100)
      expect(lastEventEl.getBoundingClientRect().top).toBeGreaterThan(scrollerEl.getBoundingClientRect().bottom)
    })

    it('grows to fit the events with height:auto', async () => {
      const el = createCalendarElement()
      el.style.width = '300px'
      const calendar = initCalendar({ ...manyOptions, headerToolbar: false, height: 'auto' }, el)
      await waitForSettle()

      const viewEl = queryPart(calendar.el, 'view')!
      const lastEventEl = getVisibleEventEls(calendar.el).pop()!
      expect(lastEventEl.getBoundingClientRect().bottom).toBeLessThanOrEqual(viewEl.getBoundingClientRect().bottom)
    })
  })

  it('updates rendered events when navigating within the already-fetched range', async () => {
    const calendar = initCalendar({
      now: '2016-09-12',
      initialView: 'dayGridMonth',
      events: [{ title: 'event1', start: '2016-09-12' }],
    })
    await waitForSettle()

    calendar.changeView('listWeek')
    await waitForSettle()
    expect(getEventRows(calendar.el)).toEqual([{ time: 'All-day', title: 'event1' }])

    calendar.prev()
    await waitForSettle()
    expect(getVisibleEventEls(calendar.el).length).toBe(0)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6486
  it('treats an all-day event that ended at today\'s midnight as past', async () => {
    const calendar = initCalendar({
      initialView: 'listMonth',
      initialDate: '2023-04-09',
      now: '2023-04-09',
      eventClass: (data) => (data.isPast ? 'test-past' : ''),
      events: [
        { title: 'yesterday', start: '2023-04-08' },
        { title: 'today', start: '2023-04-09' },
      ],
    })
    await waitForSettle()

    const eventEls = getVisibleEventEls(calendar.el)
    expect(eventEls.map((el) => getEventTexts(el).title)).toEqual(['yesterday', 'today'])
    expect(eventEls.map((el) => el.classList.contains('test-past'))).toEqual([true, false])
  })

  describe('view ranges', () => {
    const events = [
      { title: 'before', start: '2016-08-19T09:00' },
      { title: 'on the day', start: '2016-08-20T09:00' },
      { title: 'later in the year', start: '2016-12-31T09:00' },
      { title: 'next year', start: '2017-01-01T09:00' },
    ]

    it('listDay shows only the current day', async () => {
      const calendar = initCalendar({ initialView: 'listDay', initialDate: '2016-08-20', events })
      await waitForSettle()

      expect(getDayHeaders(calendar.el).map((day) => day.date)).toEqual(['2016-08-20'])
      expect(getEventRows(calendar.el).map((row) => row.title)).toEqual(['on the day'])
    })

    it('listYear shows the whole year', async () => {
      const calendar = initCalendar({ initialView: 'listYear', initialDate: '2016-08-20', events })
      await waitForSettle()

      expect(getDayHeaders(calendar.el).map((day) => day.date)).toEqual(['2016-08-19', '2016-08-20', '2016-12-31'])
      expect(getEventRows(calendar.el).map((row) => row.title)).toEqual(['before', 'on the day', 'later in the year'])
    })
  })
})
