import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { dragEventStartTo, resizeEventEndTo } from '../lib/event-moves'
import { waitForSettle } from '../lib/settle'

/*
eventConstraint and the event's own constraint, tested by dragging (and resizing) in timeGridWeek,
plus dayGridMonth where all-day vs timed matters. The calendar's week is Nov 9-15, 2014.
*/
describe('event constraint', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-11-10',
    scrollTime: '00:00',
    editable: true,
    dragScroll: false,
  }
  const range = { start: '2014-11-10T03:00:00', end: '2014-11-10T06:00:00' }
  const event = { id: '1', start: '2014-11-10T01:00:00', end: '2014-11-10T02:00:00', constraint: range }

  interface DragCase {
    desc: string
    calendarOptions: object
    to: string // where the event's start is dragged
    isAllowed: boolean
  }

  async function dragAndCheck({ calendarOptions, to, isAllowed }: DragCase) {
    const eventDragStart = vi.fn()
    const eventDrop = vi.fn()
    const calendar = initCalendar({ ...options, ...calendarOptions, eventDragStart, eventDrop })
    await waitForSettle()
    const origStartStr = calendar.getEventById('1')!.startStr

    await dragEventStartTo(calendar, '1', to)

    expect(eventDragStart).toHaveBeenCalledOnce()
    expect(eventDrop).toHaveBeenCalledTimes(isAllowed ? 1 : 0)
    const startStr = calendar.getEventById('1')!.startStr
    if (isAllowed) {
      expect(startStr.slice(0, to.length)).toBe(to)
    } else {
      expect(startStr).toBe(origStartStr)
    }
    return calendar
  }

  async function testDrag(testCase: DragCase): Promise<void> {
    await dragAndCheck(testCase)
  }

  describe('with a date range', () => {
    it.each<DragCase>([
      { desc: 'allows a drag to its middle', calendarOptions: { events: [event] }, to: '2014-11-10T04:00', isAllowed: true },
      { desc: 'allows a drag to its start', calendarOptions: { events: [event] }, to: '2014-11-10T03:00', isAllowed: true },
      { desc: 'allows a drag to its end, with an explicit end', calendarOptions: { events: [event] }, to: '2014-11-10T05:00', isAllowed: true },
      {
        desc: 'allows a drag to its end, with an implied end',
        calendarOptions: { defaultTimedEventDuration: '01:30', events: [{ id: '1', start: '2014-11-10T01:00:00', constraint: range }] },
        to: '2014-11-10T04:30',
        isAllowed: true,
      },
      { desc: 'disallows a drag before it', calendarOptions: { events: [event] }, to: '2014-11-10T02:00', isAllowed: false },
      { desc: 'disallows a drag after it', calendarOptions: { events: [event] }, to: '2014-11-10T06:00', isAllowed: false },
      {
        desc: 'disallows a drag after it, with the constraint on the event source',
        calendarOptions: { eventSources: [{ constraint: range, events: [{ id: '1', start: '2014-11-10T01:00:00', end: '2014-11-10T02:00:00' }] }] },
        to: '2014-11-10T06:00',
        isAllowed: false,
      },
      {
        desc: 'disallows a drag intersecting its start',
        calendarOptions: { events: [{ ...event, start: '2014-11-10T03:00:00', end: '2014-11-10T05:00:00' }] },
        to: '2014-11-10T02:00',
        isAllowed: false,
      },
      {
        desc: 'disallows a drag intersecting its end, with an explicit end',
        calendarOptions: { events: [{ ...event, start: '2014-11-10T03:00:00', end: '2014-11-10T05:00:00' }] },
        to: '2014-11-10T05:00',
        isAllowed: false,
      },
      {
        desc: 'disallows a drag intersecting its end, with an implied end',
        calendarOptions: {
          defaultTimedEventDuration: '02:30',
          events: [{ id: '1', start: '2014-11-10T03:00:00', constraint: { start: '2014-11-10T03:00:00', end: '2014-11-10T12:00:00' } }],
        },
        to: '2014-11-10T10:00',
        isAllowed: false,
      },
      {
        desc: 'disallows a drag that would encompass it',
        calendarOptions: {
          events: [{ id: '1', start: '2014-11-10T01:00:00', end: '2014-11-10T05:00:00', constraint: { start: '2014-11-10T12:00:00', end: '2014-11-10T14:00:00' } }],
        },
        to: '2014-11-10T10:00',
        isAllowed: false,
      },
    ])('$desc', testDrag)

    it('applies eventConstraint without re-running eventDataTransform', async () => {
      const eventDataTransform = vi.fn((data) => data)
      await testDrag({
        desc: '',
        calendarOptions: {
          events: [{ id: '1', start: '2014-11-10T01:00:00', end: '2014-11-10T02:00:00' }],
          eventConstraint: range,
          eventDataTransform,
        },
        to: '2014-11-10T06:00',
        isAllowed: false,
      })

      expect(eventDataTransform).toHaveBeenCalledOnce() // only the initial parse
    })

    describe('in dayGridMonth', () => {
      it('allows a timed event\'s drag to another day within it, keeping the time', async () => {
        const calendar = await dragAndCheck({
          desc: '',
          calendarOptions: {
            initialView: 'dayGridMonth',
            events: [{ id: '1', start: '2014-11-10T05:00:00', end: '2014-11-10T07:00:00', constraint: { start: '04:00', end: '20:00' } }],
          },
          to: '2014-11-14',
          isAllowed: true,
        })

        const moved = calendar.getEventById('1')!
        expect(moved.startStr).toBe('2014-11-14T05:00:00Z')
        expect(moved.endStr).toBe('2014-11-14T07:00:00Z')
      })

      it.each<DragCase>([
        {
          desc: 'disallows a timed event\'s drag outside an all-day constraint',
          calendarOptions: { events: [{ ...event, constraint: { start: '2014-11-10', end: '2014-11-11' } }] },
          to: '2014-11-12',
          isAllowed: false,
        },
        {
          desc: 'disallows a timed event\'s drag outside a timed constraint',
          calendarOptions: { events: [{ ...event, constraint: { start: '2014-11-10T00:00:00', end: '2014-11-11T12:00:00' } }] },
          to: '2014-11-12',
          isAllowed: false,
        },
        {
          desc: 'disallows an all-day event\'s drag partly outside an all-day constraint',
          calendarOptions: { events: [{ id: '1', start: '2014-11-10', end: '2014-11-12', constraint: { start: '2014-11-09', end: '2014-11-13' } }] },
          to: '2014-11-13',
          isAllowed: false,
        },
        {
          desc: 'disallows an all-day event\'s drag partly outside a timed constraint',
          calendarOptions: { events: [{ id: '1', start: '2014-11-10', end: '2014-11-12', constraint: { start: '2014-11-09T01:00:00', end: '2014-11-12T23:00:00' } }] },
          to: '2014-11-13',
          isAllowed: false,
        },
      ])('$desc', (testCase) => testDrag({
        ...testCase,
        calendarOptions: { initialView: 'dayGridMonth', ...testCase.calendarOptions },
      }))
    })

    describe('when resizing', () => {
      it.each([
        ['allows a resize well within it', '2014-11-12T02:00:00', '2014-11-12T04:00:00', { start: '2014-11-12T01:00:00', end: '2014-11-12T22:00:00' }, '2014-11-12T10:00', true],
        ['allows a resize to its end', '2014-11-12T02:00:00', '2014-11-12T04:00:00', { start: '2014-11-12T01:00:00', end: '2014-11-12T06:00:00' }, '2014-11-12T06:00', true],
        ['disallows a resize past its end', '2014-11-12T02:00:00', '2014-11-12T04:00:00', { start: '2014-11-12T01:00:00', end: '2014-11-12T06:00:00' }, '2014-11-12T07:00', false],
        ['disallows a resize when the start is already outside it', '2014-11-12T01:00:00', '2014-11-12T03:00:00', { start: '2014-11-12T02:00:00', end: '2014-11-12T22:00:00' }, '2014-11-12T10:00', false],
      ])('%s', async (_desc, start, end, constraint, to, isAllowed) => {
        const eventResizeStart = vi.fn()
        const eventResize = vi.fn()
        const calendar = initCalendar({ ...options, events: [{ id: '1', start, end, constraint }], eventResizeStart, eventResize })
        await waitForSettle()

        await resizeEventEndTo(calendar, '1', to)

        expect(eventResizeStart).toHaveBeenCalledOnce()
        expect(eventResize).toHaveBeenCalledTimes(isAllowed ? 1 : 0)
        expect(calendar.getEventById('1')!.endStr).toBe(isAllowed ? to + ':00Z' : end + 'Z')
      })
    })
  })

  describe('with a recurring time range', () => {
    const recurringEvent = { id: '1', start: '2014-11-12T01:00:00', end: '2014-11-12T03:00:00' }

    it.each<DragCase>([
      { desc: 'allows a drag within it', calendarOptions: { events: [{ ...recurringEvent, constraint: { startTime: '04:00', endTime: '08:00' } }] }, to: '2014-11-12T05:00', isAllowed: true },
      { desc: 'disallows a drag partly outside it', calendarOptions: { events: [{ ...recurringEvent, constraint: { startTime: '04:00', endTime: '08:00' } }] }, to: '2014-11-12T07:00', isAllowed: false },
      {
        desc: 'disallows a drag onto an excluded day',
        calendarOptions: { events: [{ ...recurringEvent, constraint: { startTime: '04:00', endTime: '08:00', daysOfWeek: [0, 1, 2, 3, 5, 6] } }] },
        to: '2014-11-13T05:00', // a Thursday
        isAllowed: false,
      },
    ])('$desc', testDrag)
  })

  describe('with constraint:businessHours', () => {
    const businessHours = { startTime: '02:00', endTime: '06:00' }

    it.each<DragCase>([
      {
        desc: 'allows a drag within business hours',
        calendarOptions: { businessHours, events: [{ id: '1', start: '2014-11-12T01:00:00', end: '2014-11-12T02:00:00', constraint: 'businessHours' }] },
        to: '2014-11-12T03:00',
        isAllowed: true,
      },
      {
        desc: 'disallows a drag partly outside business hours',
        calendarOptions: { businessHours, events: [{ id: '1', start: '2014-11-12T01:00:00', end: '2014-11-12T02:30:00', constraint: 'businessHours' }] },
        to: '2014-11-12T05:00',
        isAllowed: false,
      },
      {
        desc: 'disallows a drag onto a day without business hours',
        calendarOptions: {
          businessHours: { ...businessHours, daysOfWeek: [1, 2, 3, 4] },
          events: [{ id: '1', start: '2014-11-12T01:00:00', end: '2014-11-12T02:30:00', constraint: 'businessHours' }],
        },
        to: '2014-11-14T03:00', // a Friday
        isAllowed: false,
      },
    ])('$desc', testDrag)
  })

  describe('with a groupId', () => {
    const draggedEvent = { id: '1', start: '2014-11-12T01:00:00', end: '2014-11-12T03:00:00', constraint: 'yo' }

    it.each<DragCase>([
      {
        desc: 'allows a drag within an event of the group',
        calendarOptions: { events: [draggedEvent, { groupId: 'yo', start: '2014-11-13T01:00:00', end: '2014-11-13T05:00:00' }] },
        to: '2014-11-13T02:00',
        isAllowed: true,
      },
      {
        desc: 'disallows a drag partly outside an event of the group',
        calendarOptions: { events: [draggedEvent, { groupId: 'yo', start: '2014-11-13T01:00:00', end: '2014-11-13T04:00:00' }] },
        to: '2014-11-13T03:00',
        isAllowed: false,
      },
      {
        desc: 'disallows a drag partly outside a group event with an implied end',
        calendarOptions: { defaultTimedEventDuration: '01:00', events: [draggedEvent, { groupId: 'yo', start: '2014-11-13T01:00:00' }] },
        to: '2014-11-13T01:00',
        isAllowed: false,
      },
      {
        desc: 'disallows a drag partly outside a background event of the group',
        calendarOptions: { events: [draggedEvent, { groupId: 'yo', start: '2014-11-13T01:00:00', end: '2014-11-13T04:00:00', display: 'background' }] },
        to: '2014-11-13T03:00',
        isAllowed: false,
      },
      {
        desc: 'disallows any drag when no event is in the group',
        calendarOptions: { events: [draggedEvent] },
        to: '2014-11-13T04:00',
        isAllowed: false,
      },
      {
        desc: 'disallows any drag when no event is in the group, in dayGridMonth',
        calendarOptions: { initialView: 'dayGridMonth', events: [{ id: '1', start: '2014-11-12', constraint: 'yo' }] },
        to: '2014-11-13',
        isAllowed: false,
      },
    ])('$desc', testDrag)
  })
})
