import { describe, expect, it, vi } from 'vitest'
import { OverlapFunc } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { dragEventStartTo, resizeEventEndTo } from '../lib/event-moves'
import { DayGridModel } from '../lib/models/day-grid'
import { TimeGridModel } from '../lib/models/time-grid'
import { waitForSettle } from '../lib/settle'

/*
eventOverlap, an event's (or its source's) overlap, and selectOverlap. Tested in timeGridWeek, plus
dayGridMonth where all-day vs timed matters. Each table mixes allowed and disallowed rows that move
the same way, so a disallowed row can't pass just because the gesture failed.
*/
describe('event overlap', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-11-04',
    scrollTime: '00:00',
    editable: true,
    dragScroll: false,
  }
  const a = { id: 'a', title: 'Event A', start: '2014-11-04T01:00:00', end: '2014-11-04T03:00:00' } // the dragged event
  const b = { id: 'b', title: 'Event B', start: '2014-11-04T05:00:00', end: '2014-11-04T09:00:00' }

  interface DragCase {
    desc: string
    calendarOptions: object
    eventId?: string // the dragged event. default 'a'
    to: string // where the dragged event's start goes
    isAllowed: boolean
  }

  async function testDrag({ calendarOptions, eventId = 'a', to, isAllowed }: DragCase) {
    const eventDragStart = vi.fn()
    const eventDrop = vi.fn()
    const calendar = initCalendar({ ...options, ...calendarOptions, eventDragStart, eventDrop })
    await waitForSettle()
    const origStartStr = calendar.getEventById(eventId)!.startStr

    await dragEventStartTo(calendar, eventId, to)

    expect(eventDragStart).toHaveBeenCalledOnce() // so a disallowed row can't pass by never starting
    expect(eventDrop).toHaveBeenCalledTimes(isAllowed ? 1 : 0)
    const startStr = calendar.getEventById(eventId)!.startStr
    expect(startStr.slice(0, isAllowed ? to.length : undefined)).toBe(isAllowed ? to : origStartStr)
  }

  describe('when the other event\'s overlap is false', () => {
    const events = [a, { ...b, overlap: false }]

    it.each<DragCase>([
      { desc: 'allows a drag ending where it starts', calendarOptions: { events }, to: '2014-11-04T03:00', isAllowed: true },
      {
        desc: 'allows a drag ending where it starts, with an implied end',
        calendarOptions: { defaultTimedEventDuration: '01:30', events: [{ ...a, end: undefined }, events[1]] },
        to: '2014-11-04T03:30',
        isAllowed: true,
      },
      { desc: 'allows a drag starting where it ends', calendarOptions: { events }, to: '2014-11-04T09:00', isAllowed: true },
      { desc: 'disallows a drag across its start', calendarOptions: { events }, to: '2014-11-04T04:00', isAllowed: false },
      {
        desc: 'disallows a drag across its start, with an implied end',
        calendarOptions: { defaultTimedEventDuration: '03:00', events: [{ ...a, end: undefined }, events[1]] },
        to: '2014-11-04T03:00',
        isAllowed: false,
      },
      { desc: 'disallows a drag across its end', calendarOptions: { events }, to: '2014-11-04T08:00', isAllowed: false },
      { desc: 'disallows a drag into its middle', calendarOptions: { events }, to: '2014-11-04T06:00', isAllowed: false },
      {
        desc: 'allows a drag into it when both share a groupId (so they move together)',
        calendarOptions: { events: [{ ...a, groupId: 'g' }, { ...events[1], groupId: 'g' }] },
        to: '2014-11-04T06:00',
        isAllowed: true,
      },
    ])('$desc', testDrag)

    describe('in dayGridMonth', () => {
      it.each<DragCase>([
        {
          desc: 'disallows an all-day event\'s drag onto an all-day event',
          calendarOptions: { events: [{ id: 'a', start: '2014-11-04', end: '2014-11-05' }, { id: 'b', start: '2014-11-07', end: '2014-11-09', overlap: false }] },
          to: '2014-11-08',
          isAllowed: false,
        },
        {
          desc: 'disallows an all-day event\'s drag onto a timed event',
          calendarOptions: { events: [{ id: 'a', start: '2014-11-04', end: '2014-11-05' }, { id: 'b', start: '2014-11-07T05:00:00', end: '2014-11-09T12:00:00', overlap: false }] },
          to: '2014-11-08',
          isAllowed: false,
        },
        {
          desc: 'disallows a timed event\'s drag onto an all-day event',
          calendarOptions: { events: [{ id: 'a', start: '2014-11-04' }, { id: 'b', start: '2014-11-07T05:00:00', overlap: false }] },
          eventId: 'b',
          to: '2014-11-04',
          isAllowed: false,
        },
        {
          desc: 'allows a drag to a free day',
          calendarOptions: { events: [{ id: 'a', start: '2014-11-04', end: '2014-11-05' }, { id: 'b', start: '2014-11-07', end: '2014-11-09', overlap: false }] },
          to: '2014-11-10',
          isAllowed: true,
        },
      ])('$desc', (testCase) => testDrag({ ...testCase, calendarOptions: { initialView: 'dayGridMonth', ...testCase.calendarOptions } }))
    })

    it.each([
      ['allows a resize ending where it starts', '2014-11-04T05:00', true],
      ['disallows a resize across its start', '2014-11-04T06:00', false],
    ])('%s', async (_desc, to, isAllowed) => {
      const eventResizeStart = vi.fn()
      const eventResize = vi.fn()
      const calendar = initCalendar({ ...options, events, eventResizeStart, eventResize })
      await waitForSettle()

      await resizeEventEndTo(calendar, 'a', to)

      expect(eventResizeStart).toHaveBeenCalledOnce()
      expect(eventResize).toHaveBeenCalledTimes(isAllowed ? 1 : 0)
      expect(calendar.getEventById('a')!.endStr).toBe(isAllowed ? to + ':00Z' : a.end + 'Z')
    })
  })

  it.each<DragCase>([
    { desc: 'allows a drag into another event when both have overlap:true', calendarOptions: { events: [{ ...a, overlap: true }, { ...b, overlap: true }] }, to: '2014-11-04T04:00', isAllowed: true },
    {
      desc: 'disallows a drag into an event whose source has overlap:false',
      calendarOptions: { eventSources: [{ events: [a] }, { overlap: false, events: [b] }] },
      to: '2014-11-04T06:00',
      isAllowed: false,
    },
    { desc: 'allows a drag of an overlap:false event next to another', calendarOptions: { events: [{ ...a, overlap: false }, b] }, to: '2014-11-04T09:00', isAllowed: true },
    { desc: 'disallows a drag of an overlap:false event into another', calendarOptions: { events: [{ ...a, overlap: false }, b] }, to: '2014-11-04T04:00', isAllowed: false },
    {
      desc: 'allows a drag of an event whose source has overlap:false next to another',
      calendarOptions: { eventSources: [{ overlap: false, events: [a] }, { events: [b] }] },
      to: '2014-11-04T09:00',
      isAllowed: true,
    },
    {
      desc: 'disallows a drag of an event whose source has overlap:false into another',
      calendarOptions: { eventSources: [{ overlap: false, events: [a] }, { events: [b] }] },
      to: '2014-11-04T06:00',
      isAllowed: false,
    },
    { desc: 'allows a drag next to another event with eventOverlap:false', calendarOptions: { eventOverlap: false, events: [a, b] }, to: '2014-11-04T09:00', isAllowed: true },
    { desc: 'disallows a drag into another event with eventOverlap:false', calendarOptions: { eventOverlap: false, events: [a, b] }, to: '2014-11-04T06:00', isAllowed: false },
  ])('$desc', testDrag)

  describe('with an eventOverlap function', () => {
    it('isn\'t called without an intersection', async () => {
      const eventOverlap = vi.fn()
      await testDrag({
        desc: '',
        calendarOptions: { eventOverlap, events: [a, { ...b, start: '2014-11-04T03:00:00', end: '2014-11-04T07:00:00' }] },
        eventId: 'b',
        to: '2014-11-04T06:00',
        isAllowed: true,
      })

      expect(eventOverlap).not.toHaveBeenCalled()
    })

    it.each([true, false])('decides an intersecting drag (returning %s), given the still and moving events', async (returnValue) => {
      const eventOverlap = vi.fn<OverlapFunc>(() => returnValue)
      await testDrag({ desc: '', calendarOptions: { eventOverlap, events: [a, b] }, to: '2014-11-04T06:00', isAllowed: returnValue })

      expect(eventOverlap).toHaveBeenCalled()
      const [stillEvent, movingEvent] = eventOverlap.mock.calls[0]
      expect(stillEvent.title).toBe('Event B')
      expect(movingEvent.title).toBe('Event A')
    })
  })
})

describe('selectOverlap', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-11-12',
    scrollTime: '00:00',
    selectable: true,
    dragScroll: false,
  }
  const event = { title: 'Event A', start: '2014-11-12T04:00:00', end: '2014-11-12T06:00:00' }

  /*
  Selections can't start on an event, so `fromEnd` drags backwards for ranges that start on one.
  */
  async function testSelect(calendarOptions: object, start: string, end: string, isAllowed: boolean, fromEnd = false) {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, ...calendarOptions, select })
    await waitForSettle()

    if (start.includes('T')) {
      await new TimeGridModel(calendar.el).selectRange(start, end, { fromEnd })
    } else {
      await new DayGridModel(calendar.el).selectDates(start, end) // inclusive days
    }

    if (isAllowed) {
      expect(select).toHaveBeenCalledOnce()
      const info = select.mock.calls[0][0]
      if (start.includes('T')) {
        expect([info.startStr, info.endStr, info.allDay]).toEqual([start + ':00Z', end + ':00Z', false])
      } else {
        const endStr = new Date(new Date(end + 'T00:00:00Z').valueOf() + 86400000).toISOString().slice(0, 10) // end is inclusive
        expect([info.startStr, info.endStr, info.allDay]).toEqual([start, endStr, true])
      }
    } else {
      expect(select).not.toHaveBeenCalled()
    }
  }

  describe('as false', () => {
    it.each([
      ['allows a selection ending where an event starts', '2014-11-12T01:00', '2014-11-12T04:00', true],
      ['allows a selection starting where an event ends', '2014-11-12T06:00', '2014-11-12T12:00', true],
      ['disallows a selection across an event\'s start', '2014-11-12T01:00', '2014-11-12T05:00', false],
      ['disallows a selection across an event\'s end (dragged backwards)', '2014-11-12T05:00', '2014-11-12T08:00', false],
    ])('%s', (_desc, start, end, isAllowed) => testSelect({ selectOverlap: false, events: [event] }, start, end, isAllowed, start === '2014-11-12T05:00'))

    // (A selection entirely inside an event can't be made with a pointer: it can't start on an event.)

    describe('in dayGridMonth', () => {
      it.each([
        ['disallows selecting a day with an all-day event', { start: '2014-11-12', end: '2014-11-14' }, false],
        ['disallows selecting a day with a timed event', { start: '2014-11-12T05:00:00', end: '2014-11-14T20:00:00' }, false],
        ['allows selecting a free day', { start: '2014-11-20', end: '2014-11-21' }, true],
      ])('%s', (_desc, monthEvent, isAllowed) => testSelect(
        { initialView: 'dayGridMonth', selectOverlap: false, events: [monthEvent] },
        '2014-11-12',
        '2014-11-12',
        isAllowed,
      ))
    })
  })

  describe('as a function', () => {
    it('isn\'t called without an intersection', async () => {
      const selectOverlap = vi.fn()
      await testSelect({ selectOverlap, events: [event] }, '2014-11-12T08:00', '2014-11-12T10:00', true)

      expect(selectOverlap).not.toHaveBeenCalled()
    })

    it.each([true, false])('decides an intersecting selection (returning %s), given the event', async (returnValue) => {
      const selectOverlap = vi.fn<OverlapFunc>(() => returnValue)
      await testSelect({ selectOverlap, events: [event] }, '2014-11-12T05:00', '2014-11-12T07:00', returnValue, true)

      expect(selectOverlap).toHaveBeenCalled()
      const [overlappedEvent, secondArg] = selectOverlap.mock.calls[0]
      expect(overlappedEvent.title).toBe('Event A')
      expect(secondArg).toBeFalsy()
    })
  })

  it('isn\'t affected by an event\'s overlap:false when true', () => testSelect(
    { selectOverlap: true, events: [{ ...event, overlap: false }] },
    '2014-11-12T05:00',
    '2014-11-12T07:00',
    true,
    true,
  ))
})
