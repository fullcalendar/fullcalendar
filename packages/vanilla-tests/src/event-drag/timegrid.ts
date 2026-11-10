import { describe, expect, it, vi } from 'vitest'
import { createDuration } from 'fullcalendar/protected-api'
import { initCalendar } from '../lib/calendar'
import { TimeGridModel } from '../lib/models/time-grid'
import { queryPart } from '../lib/models/events'
import { pointer, getRectCenter } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

describe('event dragging in timeGrid', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-06-11',
    editable: true,
    dragScroll: false,
  }

  it('moves a timed event by days and time', async () => {
    const eventDrop = vi.fn()
    const calendar = initCalendar({
      ...options,
      events: [{ id: '1', start: '2014-06-11T06:00:00' }],
      eventDrop,
    })
    await waitForSettle()

    await new TimeGridModel(calendar.el).dragEvent('1', '2014-06-11T06:00', '2014-06-12T07:30')

    const info = eventDrop.mock.calls[0][0]
    expect(info.delta).toEqual(createDuration({ day: 1, hour: 1, minute: 30 }))
    expect(info.event.startStr).toBe('2014-06-12T07:30:00Z')
    expect(info.event.end).toBeNull()
  })

  /*
  On press, FullCalendar treats the pointer as if it were at the center of the grabbed slot,
  so the event moves by the pointer's travel rounded to the nearest slot.
  */
  it.each([
    ['rounds down', '2014-06-11T10:20', '2014-06-11T13:30:00Z'], // travel 3h40 -> 3h30
    ['rounds up', '2014-06-11T10:05', '2014-06-11T14:00:00Z'], // travel 3h55 -> 4h
  ])('moves a timed event by the pointer\'s travel, rounded to the nearest slot (%s)', async (_desc, grab, expectedStart) => {
    const calendar = initCalendar({
      ...options,
      events: [{ id: '1', start: '2014-06-11T10:00:00', end: '2014-06-11T12:00:00' }],
    })
    await waitForSettle()

    await new TimeGridModel(calendar.el).dragEvent('1', grab, '2014-06-11T14:00')

    expect(calendar.getEventById('1')!.startStr).toBe(expectedStart)
  })

  it('snaps to snapDuration rather than slotDuration', async () => {
    const calendar = initCalendar({
      ...options,
      slotDuration: '00:30',
      snapDuration: '00:15',
      events: [{ id: '1', start: '2014-06-11T10:00:00' }],
    })
    await waitForSettle()

    await new TimeGridModel(calendar.el).dragEvent('1', '2014-06-11T10:00', '2014-06-11T14:15')

    expect(calendar.getEventById('1')!.startStr).toBe('2014-06-11T14:15:00Z')
  })

  it('moves by the dropped day and time in RTL', async () => {
    const calendar = initCalendar({
      ...options,
      direction: 'rtl',
      events: [{ id: '1', start: '2014-06-11T06:00:00' }],
    })
    await waitForSettle()

    const timeGrid = new TimeGridModel(calendar.el)
    // in RTL, a later day in the week is further left
    expect(timeGrid.getDayLane('2014-06-13').getBoundingClientRect().left)
      .toBeLessThan(timeGrid.getDayLane('2014-06-11').getBoundingClientRect().left)

    await timeGrid.dragEvent('1', '2014-06-11T06:00', '2014-06-13T07:00')

    expect(calendar.getEventById('1')!.startStr).toBe('2014-06-13T07:00:00Z')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4503
  it('drops on one of the last slots', async () => {
    const calendar = initCalendar({
      ...options,
      scrollTime: '23:00:00',
      height: 400, // short enough to scroll
      events: [{ id: '1', start: '2014-06-11T18:00:00' }],
    })
    await waitForSettle()

    await new TimeGridModel(calendar.el).dragEvent('1', '2014-06-11T18:00', '2014-06-11T23:30')

    const event = calendar.getEventById('1')!
    expect(event.startStr).toBe('2014-06-11T23:30:00Z')
    expect(event.end).toBeNull()
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4616
  it('drags an all-day event added during batchRendering', async () => {
    const calendar = initCalendar({ ...options, initialDate: '2019-04-23' })
    calendar.batchRendering(() => {
      calendar.addEvent({ id: '1', start: '2019-04-23' })
      calendar.addEvent({ id: '2', start: '2019-04-23' })
      calendar.addEvent({ id: '3', start: '2019-04-23' })
    })
    await waitForSettle()

    await new TimeGridModel(calendar.el).allDay.dragEvent('3', '2019-04-23', '2019-04-24')

    expect(calendar.getEventById('3')!.startStr).toBe('2019-04-24')
  })

  describe('mirror', () => {
    it.each([
      ['with no end, shows only the new start time', null, /^\s*2:30\s*$/],
      ['with an end, shows the new start and end times', '2014-06-11T02:00:00', /2:30\s*–\s*3:30/],
    ])('for an event %s', async (_desc, end, expectedTimeText) => {
      const calendar = initCalendar({
        ...options,
        scrollTime: '01:00:00',
        events: [{ id: '1', start: '2014-06-11T01:00:00', end }],
      })
      await waitForSettle()

      const timeGrid = new TimeGridModel(calendar.el)
      const { point } = timeGrid.pointForEventAt('1', '2014-06-11T01:00')
      await pointer.press(point, async () => {
        await pointer.move(timeGrid.pointForDateTime('2014-06-11T02:30'))
        await waitForSettle()

        const mirrorEls = timeGrid.getMirrorEls()
        expect(mirrorEls).toHaveLength(1)
        expect(mirrorEls[0].textContent).toMatch(expectedTimeText)
      })
      await waitForSettle()
    })
  })

  describe('from all-day to timed', () => {
    const allDayOptions = {
      ...options,
      initialDate: '2018-09-03',
      scrollTime: 0,
      events: [{ id: '1', start: '2018-09-03', end: '2018-09-05' }],
    }

    it('starts the event at the dropped time, whichever of its days was grabbed', async () => {
      const eventDrop = vi.fn()
      const calendar = initCalendar({ ...allDayOptions, eventDrop })
      await waitForSettle()

      // grab the event's second day and drop on the following day
      const timeGrid = new TimeGridModel(calendar.el)
      await timeGrid.allDay.dragEvent('1', '2018-09-04', () => timeGrid.pointForDateTime('2018-09-05T02:00'))

      // the delta is measured from the event's start, not the grabbed day
      const info = eventDrop.mock.calls[0][0]
      expect(info.delta).toEqual(createDuration({ day: 2, hour: 2 }))
      expect(info.event.startStr).toBe('2018-09-05T02:00:00Z')
      expect(info.event.end).toBeNull()
      expect(info.event.allDay).toBe(false)

      info.revert()
      const event = calendar.getEventById('1')!
      expect(event.allDay).toBe(true)
      expect(event.startStr).toBe('2018-09-03')
      expect(event.endStr).toBe('2018-09-05')
    })

    it.each([
      ['discards the duration when allDayMaintainDuration:false', { allDayMaintainDuration: false }, null],
      ['keeps the duration when allDayMaintainDuration:true', { allDayMaintainDuration: true }, '2018-09-05T02:00:00Z'],
      [
        'applies defaultTimedEventDuration when forceEventDuration:true',
        { forceEventDuration: true, defaultTimedEventDuration: '04:00' },
        '2018-09-03T06:00:00Z',
      ],
    ])('%s', async (_desc, moreOptions, expectedEnd) => {
      const calendar = initCalendar({ ...allDayOptions, ...moreOptions })
      await waitForSettle()

      const timeGrid = new TimeGridModel(calendar.el)
      await timeGrid.allDay.dragEvent('1', '2018-09-03', () => timeGrid.pointForDateTime('2018-09-03T02:00'))

      const event = calendar.getEventById('1')!
      expect(event.startStr).toBe('2018-09-03T02:00:00Z')
      expect(event.endStr || null).toBe(expectedEnd)
    })
  })

  describe('from timed to all-day', () => {
    it('reports a whole-day delta and drops the time, and revert() restores the time', async () => {
      const eventDrop = vi.fn()
      const calendar = initCalendar({
        ...options,
        scrollTime: '01:00:00',
        events: [{ id: '1', start: '2014-06-11T01:00:00' }],
        eventDrop,
      })
      await waitForSettle()

      const timeGrid = new TimeGridModel(calendar.el)
      await timeGrid.dragEvent('1', '2014-06-11T01:00', () => timeGrid.allDay.pointForDate('2014-06-10'))

      const info = eventDrop.mock.calls[0][0]
      expect(info.delta).toEqual(createDuration({ day: -1 }))
      expect(info.event.startStr).toBe('2014-06-10')
      expect(info.event.allDay).toBe(true)
      expect(info.event.end).toBeNull()

      info.revert()
      const event = calendar.getEventById('1')!
      expect(event.startStr).toBe('2014-06-11T01:00:00Z')
      expect(event.allDay).toBe(false)
    })

    it('starts the event on the dropped day, whichever of its days was grabbed', async () => {
      const eventDrop = vi.fn()
      const calendar = initCalendar({
        ...options,
        scrollTime: 0,
        events: [{ id: '1', start: '2014-06-10T22:00:00', end: '2014-06-11T03:00:00' }],
        eventDrop,
      })
      await waitForSettle()

      // grab the overnight event's segment on its second day and drop on a later all-day cell
      const timeGrid = new TimeGridModel(calendar.el)
      await timeGrid.dragEvent('1', '2014-06-11T01:00', () => timeGrid.allDay.pointForDate('2014-06-13'))

      // the delta is measured from the event's start day, not the grabbed day
      const info = eventDrop.mock.calls[0][0]
      expect(info.delta).toEqual(createDuration({ day: 3 }))
      expect(info.event.startStr).toBe('2014-06-13')
      expect(info.event.end).toBeNull()
      expect(info.event.allDay).toBe(true)

      info.revert()
      const event = calendar.getEventById('1')!
      expect(event.allDay).toBe(false)
      expect(event.startStr).toBe('2014-06-10T22:00:00Z')
      expect(event.endStr).toBe('2014-06-11T03:00:00Z')
    })

    it('applies defaultAllDayEventDuration when forceEventDuration:true', async () => {
      const calendar = initCalendar({
        ...options,
        initialDate: '2018-09-03',
        scrollTime: 0,
        forceEventDuration: true,
        defaultAllDayEventDuration: { days: 2 },
        events: [{ id: '1', start: '2018-09-03T01:00:00', end: '2018-09-03T02:00:00' }],
      })
      await waitForSettle()

      const timeGrid = new TimeGridModel(calendar.el)
      await timeGrid.dragEvent('1', '2018-09-03T01:00', () => timeGrid.allDay.pointForDate('2018-09-03'))

      const event = calendar.getEventById('1')!
      expect(event.startStr).toBe('2018-09-03')
      expect(event.endStr).toBe('2018-09-05')
    })

    // https://github.com/fullcalendar/fullcalendar/issues/7222
    it('works for an event dragged out of the more-link popover', async () => {
      const calendar = initCalendar({
        ...options,
        initialDate: '2018-09-03',
        scrollTime: 0,
        eventMaxStack: 1,
        events: [
          { id: '1', start: '2018-09-03T01:00:00', end: '2018-09-03T02:00:00' },
          { id: '2', start: '2018-09-03T01:00:00', end: '2018-09-03T02:00:00' }, // in the popover
        ],
      })
      await waitForSettle()

      const timeGrid = new TimeGridModel(calendar.el)
      await pointer.click(getRectCenter(queryPart(calendar.el, 'moreLink')!.getBoundingClientRect()))
      await waitForSettle()

      const popoverEventEl = queryPart(queryPart(document, 'popover')!, 'event')!
      await pointer.press(getRectCenter(popoverEventEl.getBoundingClientRect()), async () => {
        await pointer.move(timeGrid.allDay.pointForDate('2018-09-03'))
        await waitForSettle()
      })
      await waitForSettle()

      const event = calendar.getEventById('2')!
      expect(event.startStr).toBe('2018-09-03')
      expect(event.end).toBeNull()
      expect(event.allDay).toBe(true)
    })
  })
})
