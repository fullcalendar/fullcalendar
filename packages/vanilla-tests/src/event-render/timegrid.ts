import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import {
  findObscuredEls,
  findOverlappingEls,
  getContainingDate,
  getEventTexts,
  getEventTimeTexts,
  getSlotSpan,
  getVisibleEventEls,
} from '../lib/models/event-content'
import { enUsSep } from '../lib/intl'
import { waitForSettle } from '../lib/settle'

/*
Expects the event element to be in the date's column (horizontally within its day lane), from the top
of one slot to the bottom of another (slot indexes count from slotMinTime). The segment must be the only
one in its lane, so it fills most of the lane's width.
*/
function expectSegInSlots(root: HTMLElement, eventEl: HTMLElement, date: string, startSlot: number, endSlot: number) {
  const span = getSlotSpan(root, startSlot, endSlot)
  const rect = eventEl.getBoundingClientRect()
  const laneRect = eventEl.closest('.test-part-dayLane')!.getBoundingClientRect()

  expect(getContainingDate(eventEl)).toBe(date)
  expect(rect.width).toBeGreaterThan(laneRect.width / 2)
  expect(rect.left).toBeGreaterThanOrEqual(laneRect.left - 0.5)
  expect(rect.right).toBeLessThanOrEqual(laneRect.right + 0.5)
  expect(Math.abs(rect.top - span.top)).toBeLessThan(2)
  expect(Math.abs(rect.bottom - span.bottom)).toBeLessThan(3) // events have a small bottom gap
}

describe('timeGrid event rendering', () => {
  describe('segments across days', () => {
    const options = {
      initialView: 'timeGridWeek',
      initialDate: '2014-08-23',
      scrollTime: '00:00:00',
    }

    it('places a single-day event between its times', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ title: 'event1', start: '2014-08-18T02:00:00', end: '2014-08-18T22:00:00' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(1)
      expectSegInSlots(calendar.el, eventEls[0], '2014-08-18', 4, 44)
      expect(getEventTexts(eventEls[0])).toEqual({ time: `2:00${enUsSep}10:00`, title: 'event1' })
    })

    it('splits an event at midnight, with times to and from midnight', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ start: '2014-08-18T02:00:00', end: '2014-08-19T22:00:00' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(2)
      expectSegInSlots(calendar.el, eventEls[0], '2014-08-18', 4, 48)
      expectSegInSlots(calendar.el, eventEls[1], '2014-08-19', 0, 44)
      expect(getEventTimeTexts(eventEls)).toEqual([`2:00${enUsSep}12:00`, `12:00${enUsSep}10:00`])
    })

    it('renders no time on a segment that spans a whole day', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ start: '2014-08-18T02:00:00', end: '2014-08-20T22:00:00' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(3)
      expectSegInSlots(calendar.el, eventEls[1], '2014-08-19', 0, 48)
      expect(getEventTimeTexts(eventEls)).toEqual([`2:00${enUsSep}12:00`, '', `12:00${enUsSep}10:00`])
    })
  })

  describe('with slotMinTime and slotMaxTime', () => {
    const options = {
      initialView: 'timeGridWeek',
      initialDate: '2017-03-22',
      scrollTime: '00:00',
    }

    it('renders an event in the extended hours after midnight (slotMaxTime past 24h)', async () => {
      const calendar = initCalendar({
        ...options,
        slotMaxTime: '26:00',
        events: [{ start: '2017-03-22T00:00:00', end: '2017-03-22T02:00:00' }],
      })
      await waitForSettle()

      // once as the previous day's 24:00-26:00, once in its own day
      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(2)
      expectSegInSlots(calendar.el, eventEls[0], '2017-03-21', 48, 52)
      expectSegInSlots(calendar.el, eventEls[1], '2017-03-22', 0, 4)
    })

    it('renders an event in the extended hours before midnight (negative slotMinTime)', async () => {
      const calendar = initCalendar({
        ...options,
        slotMinTime: { hours: -2 },
        events: [{ start: '2017-03-22T22:00:00', end: '2017-03-23T00:00:00' }],
      })
      await waitForSettle()

      // once in its own day, once as the next day's -2:00-0:00
      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(2)
      expectSegInSlots(calendar.el, eventEls[0], '2017-03-22', 48, 52)
      expectSegInSlots(calendar.el, eventEls[1], '2017-03-23', 0, 4)
    })

    it('shows the original start time of an event cut off by slotMinTime', async () => {
      const calendar = initCalendar({
        ...options,
        slotMinTime: { hours: 12 },
        events: [{ start: '2017-03-22T10:00:00', end: '2017-03-22T14:00:00' }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(1)
      expectSegInSlots(calendar.el, eventEls[0], '2017-03-22', 0, 4)
      expect(getEventTimeTexts(eventEls)).toEqual([`10:00${enUsSep}2:00`])
    })

    it('repositions events when slotMinTime changes', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ start: '2017-03-22T10:00:00', end: '2017-03-22T11:00:00' }],
      })
      await waitForSettle()
      expectSegInSlots(calendar.el, getVisibleEventEls(calendar.el)[0], '2017-03-22', 20, 22)

      calendar.setOption('slotMinTime', '09:00')
      await waitForSettle()

      expect(queryParts(calendar.el, 'slotHeader')[0].textContent).toBe('9am')
      expectSegInSlots(calendar.el, getVisibleEventEls(calendar.el)[0], '2017-03-22', 2, 4)
    })
  })

  describe('overlapping events', () => {
    // https://github.com/fullcalendar/fullcalendar/issues/6019
    it('doesn\'t hide any event behind another when sorted by title', async () => {
      const calendar = initCalendar({
        initialView: 'timeGridWeek',
        initialDate: '2020-12-15',
        scrollTime: '05:00',
        eventOrder: 'title,-allDay,start,-duration',
        slotEventOverlap: false,
        events: [
          { title: 'a', start: '2020-12-15T15:00:00', end: '2020-12-15T18:00:00' },
          { title: 'b', start: '2020-12-15T05:00:00', end: '2020-12-15T08:00:00' },
          { title: 'c', start: '2020-12-15T09:00:00', end: '2020-12-15T12:00:00' },
          { title: 'd', start: '2020-12-15T05:00:00', end: '2020-12-15T09:00:00' },
          { title: 'e', start: '2020-12-15T05:00:00', end: '2020-12-15T08:00:00' },
          { title: 'f', start: '2020-12-15T08:00:00', end: '2020-12-15T12:00:00', color: 'red' },
          { title: 'g', start: '2020-12-15T08:00:00', end: '2020-12-15T17:30:00' },
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(7)
      expect(findObscuredEls(eventEls)).toBeNull()
      expect(findOverlappingEls(eventEls)).toBeNull() // slotEventOverlap:false: not even partly covered
    })

    // https://github.com/fullcalendar/fullcalendar/issues/2758
    it('doesn\'t hide any event behind another in a dense arrangement', async () => {
      const calendar = initCalendar({
        initialView: 'timeGridDay',
        initialDate: '2015-04-22',
        scrollTime: '09:00',
        slotEventOverlap: false,
        editable: true,
        events: [
          { title: 'A', start: '2015-04-22T10:00:00', end: '2015-04-22T13:00:00' },
          { title: 'B', start: '2015-04-22T13:00:00', end: '2015-04-22T13:30:00' },
          { title: 'C', start: '2015-04-22T10:00:00', end: '2015-04-22T11:00:00' },
          { title: 'D', start: '2015-04-22T22:00:00', end: '2015-04-22T23:00:00' },
          { title: 'E', start: '2015-04-22T10:00:00', end: '2015-04-22T14:00:00' },
          { title: 'F', start: '2015-04-22T14:00:00', end: '2015-04-22T15:30:00' },
          { title: 'G', start: '2015-04-22T22:00:00', end: '2015-04-22T23:00:00' },
          { title: 'H', start: '2015-04-22T22:00:00', end: '2015-04-22T23:00:00' },
          { title: 'I', start: '2015-04-22T15:00:00', end: '2015-04-22T23:30:00' },
          { title: 'J', start: '2015-04-22T10:00:00', end: '2015-04-22T15:30:00' },
          { title: 'K', start: '2015-04-22T22:00:00', end: '2015-04-22T23:00:00' },
          { title: 'L', start: '2015-04-22T12:00:00', end: '2015-04-22T15:00:00' },
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(12)
      expect(findObscuredEls(eventEls)).toBeNull()
      expect(findOverlappingEls(eventEls)).toBeNull() // slotEventOverlap:false: not even partly covered
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5004
    it('gives side-by-side events roughly equal widths', async () => {
      const calendar = initCalendar({
        initialView: 'timeGridDay',
        initialDate: '2019-08-01',
        slotDuration: '00:15:00',
        slotEventOverlap: false,
        events: [
          { start: '2019-08-01T08:00', end: '2019-08-01T09:00' },
          { start: '2019-08-01T08:00', end: '2019-08-01T09:00' },
          { start: '2019-08-01T08:30', end: '2019-08-01T09:30' },
          { start: '2019-08-01T09:00', end: '2019-08-01T10:00' },
          { start: '2019-08-01T09:00', end: '2019-08-01T10:00' },
          { start: '2019-08-01T09:30', end: '2019-08-01T10:30' },
          { start: '2019-08-01T09:30', end: '2019-08-01T10:30' },
          { start: '2019-08-01T10:00', end: '2019-08-01T11:00' },
          { start: '2019-08-01T10:00', end: '2019-08-01T11:00' },
          { start: '2019-08-01T10:00', end: '2019-08-01T11:00' },
          { start: '2019-08-01T10:00', end: '2019-08-01T11:00' },
          { start: '2019-08-01T10:00', end: '2019-08-01T11:00' },
          { start: '2019-08-01T10:00', end: '2019-08-01T11:00' },
          { start: '2019-08-01T10:00', end: '2019-08-01T11:00' },
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(14)

      const widths = eventEls.map((el) => el.getBoundingClientRect().width).sort((a, b) => b - a)
      widths.shift() // one event is exceptionally wide
      expect(widths[0] - widths[widths.length - 1]).toBeLessThan(1)
    })
  })

  describe('short events', () => {
    const options = {
      initialView: 'timeGridWeek',
      initialDate: '2017-08-10',
      scrollTime: '10:00',
    }

    it('has a non-zero default eventMinHeight', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ start: '2017-08-10T10:30:00', end: '2017-08-10T10:31:00' }],
      })
      await waitForSettle()

      expect(getVisibleEventEls(calendar.el)[0].getBoundingClientRect().height).toBeGreaterThan(5)
    })

    it('renders at least eventMinHeight tall', async () => {
      const calendar = initCalendar({
        ...options,
        eventMinHeight: 40,
        events: [{ start: '2017-08-10T10:30:00', end: '2017-08-10T10:31:00' }],
      })
      await waitForSettle()

      expect(getVisibleEventEls(calendar.el)[0].getBoundingClientRect().height).toBeGreaterThanOrEqual(39)
    })

    it('puts events side by side when their eventMinHeight makes them collide', async () => {
      const calendar = initCalendar({
        ...options,
        eventMinHeight: 40,
        events: [
          { title: 'event a', start: '2017-08-10T10:30:00', end: '2017-08-10T10:31:00' },
          { title: 'event b', start: '2017-08-10T10:31:20', end: '2017-08-10T10:31:40' },
        ],
      })
      await waitForSettle()

      const [rectA, rectB] = getVisibleEventEls(calendar.el).map((el) => el.getBoundingClientRect())
      expect(rectA.left).toBeLessThan(rectB.left)
    })

    it.each([
      { desc: 'a very short event, by default', end: '2017-08-10T10:31:00', extraOptions: {}, isShort: true },
      { desc: 'a two-hour event, by default', end: '2017-08-10T12:30:00', extraOptions: {}, isShort: false },
      { desc: 'a two-hour event, with a large eventShortHeight', end: '2017-08-10T12:30:00', extraOptions: { eventShortHeight: 200 }, isShort: true },
    ])('flags $desc as short: $isShort', async ({ end, extraOptions, isShort }) => {
      const calendar = initCalendar({
        ...options,
        ...extraOptions,
        columnEventClass: (data) => (data.isShort ? 'test-short' : ''),
        events: [{ start: '2017-08-10T10:30:00', end }],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(1)
      expect(eventEls[0].classList.contains('test-short')).toBe(isShort)
    })
  })
})
