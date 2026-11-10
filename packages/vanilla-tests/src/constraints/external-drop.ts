import { describe, expect, it, onTestFinished, vi } from 'vitest'
import { Draggable } from 'fullcalendar/interaction'
import { initCalendar } from '../lib/calendar'
import { createExternalEl, dragExternalEl } from '../lib/external'
import { TimeGridModel } from '../lib/models/time-grid'
import { waitForSettle } from '../lib/settle'

/*
Dropping external elements into timeGrid slots. An element without event data (or with create:false)
is a plain drop, validated like a selection. An element with event data creates an event, validated
like an event.
*/
describe('constraints on external drops', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-11-13',
    scrollTime: '00:00:00',
    dragScroll: false,
    droppable: true,
  }

  /*
  Drags in an external element and returns what happened: 'event' (dropped and received an event),
  'drop' (dropped, no event), or 'none'. Asserts nothing happened twice.
  */
  async function dropAt(calendarOptions: object, eventData: object | null, dateTime: string): Promise<string> {
    const drop = vi.fn()
    const eventReceive = vi.fn()
    const calendar = initCalendar({ ...options, ...calendarOptions, drop, eventReceive })
    await waitForSettle()
    const eventCnt = calendar.getEvents().length

    const externalEl = createExternalEl()
    const draggable = new Draggable(externalEl, eventData ? { eventData } : {})
    onTestFinished(() => draggable.destroy())
    await dragExternalEl(externalEl, () => new TimeGridModel(calendar.el).pointForDateTime(dateTime))

    expect(drop.mock.calls.length).toBeLessThanOrEqual(1)
    expect(eventReceive.mock.calls.length).toBeLessThanOrEqual(drop.mock.calls.length)
    expect(calendar.getEvents().length - eventCnt).toBe(eventReceive.mock.calls.length)

    return eventReceive.mock.calls.length ? 'event' : drop.mock.calls.length ? 'drop' : 'none'
  }

  const otherEvent = { start: '2014-11-13T01:00:00', end: '2014-11-13T05:00:00' }

  /*
  Plain drops, and drops of event data with create:false, are validated like selections.
  */
  describe.each([
    ['without event data', null],
    ['with create:false event data that has a duration', { create: false, duration: '02:30' }],
  ])('%s', (_desc, eventData) => {
    const plainOptions = eventData ? {} : { defaultTimedEventDuration: '02:30' }

    it.each([
      ['eventOverlap:false', { eventOverlap: false, events: [otherEvent] }],
      ['another event\'s overlap:false', { events: [{ ...otherEvent, overlap: false }] }],
      ['eventConstraint', { eventConstraint: { startTime: '03:00', endTime: '10:00' } }],
    ])('ignores %s', async (_desc, moreOptions) => {
      expect(await dropAt({ ...plainOptions, ...moreOptions }, eventData, '2014-11-13T02:00')).toBe('drop')
    })

    it('obeys selectOverlap:false', async () => {
      const calendarOptions = { ...plainOptions, selectOverlap: false, events: [{ start: '2014-11-13T04:00:00', end: '2014-11-13T08:00:00' }] }
      expect(await dropAt(calendarOptions, eventData, '2014-11-13T02:00')).toBe('none') // 2:00-4:30 overlaps
    })

    it.each([
      ['allows a drop within', '2014-11-13T05:30', 'drop'], // 5:30-8:00
      ['disallows a drop not fully within', '2014-11-13T06:00', 'none'], // 6:00-8:30
    ])('obeys selectConstraint: %s', async (_desc, dateTime, expected) => {
      const calendarOptions = { ...plainOptions, selectConstraint: { startTime: '04:00', endTime: '08:00' } }
      expect(await dropAt(calendarOptions, eventData, dateTime)).toBe(expected)
    })
  })

  describe('with event data', () => {
    const blockingEvent = { start: '2014-11-13T05:00:00', end: '2014-11-13T08:00:00' }

    describe.each([
      ['eventOverlap:false', { eventOverlap: false, events: [blockingEvent] }, {}],
      ['the dropped event\'s overlap:false', { events: [blockingEvent] }, { overlap: false }],
      ['the other event\'s overlap:false', { events: [{ ...blockingEvent, overlap: false }] }, {}],
    ])('with %s', (_desc, calendarOptions, eventData) => {
      it('allows a drop that doesn\'t collide', async () => {
        expect(await dropAt(calendarOptions, eventData, '2014-11-13T08:00')).toBe('event')
      })

      it('prevents a drop that collides', async () => {
        expect(await dropAt(calendarOptions, eventData, '2014-11-13T06:00')).toBe('none')
      })
    })

    describe.each([
      ['eventConstraint', { eventConstraint: { startTime: '04:00', endTime: '08:00' } }, { duration: '02:00' }],
      ['the event\'s constraint', {}, { duration: '02:00', constraint: { startTime: '04:00', endTime: '08:00' } }],
    ])('with %s', (_desc, calendarOptions, eventData) => {
      it('allows a drop inside the constraint', async () => {
        expect(await dropAt(calendarOptions, eventData, '2014-11-13T05:00')).toBe('event')
      })

      it('prevents a drop partially outside the constraint', async () => {
        expect(await dropAt(calendarOptions, eventData, '2014-11-13T07:00')).toBe('none')
      })
    })
  })
})
