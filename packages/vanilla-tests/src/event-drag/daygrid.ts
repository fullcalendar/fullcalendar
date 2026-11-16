import { describe, expect, it, vi } from 'vitest'
import { createDuration } from 'fullcalendar/protected-api'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

describe('event dragging in dayGrid', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-06-11',
    editable: true,
    dragScroll: false,
  }

  it('moves an all-day event by whole days', async () => {
    const eventDrop = vi.fn()
    const calendar = initCalendar({
      ...options,
      events: [{ id: '1', start: '2014-06-11' }],
      eventDrop,
    })
    await waitForSettle()

    await new DayGridModel(calendar.el).dragEvent('1', '2014-06-11', '2014-06-20')

    const info = eventDrop.mock.calls[0][0]
    expect(info.delta).toEqual(createDuration({ day: 9 }))
    expect(info.event.startStr).toBe('2014-06-20')
    expect(info.event.end).toBeNull()
  })

  it('moves a multi-day event by the distance from the grabbed day', async () => {
    const calendar = initCalendar({
      ...options,
      events: [{ id: '1', start: '2014-06-10', end: '2014-06-13' }],
    })
    await waitForSettle()

    // grab the event's middle day and drop it 2 days later
    await new DayGridModel(calendar.el).dragEvent('1', '2014-06-11', '2014-06-13')

    const event = calendar.getEventById('1')!
    expect(event.startStr).toBe('2014-06-12')
    expect(event.endStr).toBe('2014-06-15')
  })

  it('moves a multi-week event by the distance from the grabbed day on a later row', async () => {
    const calendar = initCalendar({
      ...options,
      events: [{ id: '1', start: '2014-06-12', end: '2014-06-18' }], // rows of Jun 8 and Jun 15
    })
    await waitForSettle()

    // grab the second row's segment and drop it 2 days later
    await new DayGridModel(calendar.el).dragEvent('1', '2014-06-16', '2014-06-18')

    const event = calendar.getEventById('1')!
    expect(event.startStr).toBe('2014-06-14')
    expect(event.endStr).toBe('2014-06-20')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4458
  it('moves a timed event back in time, keeping its time, when its duration isn\'t editable', async () => {
    const eventDrop = vi.fn()
    const calendar = initCalendar({
      ...options,
      initialDate: '2019-01-16',
      eventDurationEditable: false,
      events: [{ id: '1', start: '2019-01-16T10:30:00', end: '2019-01-16T12:30:00' }],
      eventDrop,
    })
    await waitForSettle()

    await new DayGridModel(calendar.el).dragEvent('1', '2019-01-16', '2019-01-14')

    const info = eventDrop.mock.calls[0][0]
    expect(info.delta).toEqual(createDuration({ day: -2 }))
    expect(info.event.startStr).toBe('2019-01-14T10:30:00Z')
    expect(info.event.endStr).toBe('2019-01-14T12:30:00Z')
  })

  it('moves by the dropped day in RTL', async () => {
    const calendar = initCalendar({
      ...options,
      direction: 'rtl',
      events: [{ id: '1', start: '2014-06-11' }],
    })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    // in RTL, a later day in the week is further left
    expect(dayGrid.getDayCell('2014-06-13').getBoundingClientRect().left)
      .toBeLessThan(dayGrid.getDayCell('2014-06-11').getBoundingClientRect().left)

    await dayGrid.dragEvent('1', '2014-06-11', '2014-06-13')

    expect(calendar.getEventById('1')!.startStr).toBe('2014-06-13')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/1297
  it('fires no eventMouseEnter/eventMouseLeave while dragging over other events', async () => {
    const eventMouseEnter = vi.fn()
    const eventMouseLeave = vi.fn()
    const calendar = initCalendar({
      ...options,
      events: [
        { id: '1', start: '2014-06-11' },
        { id: '2', start: '2014-06-12' },
      ],
      eventMouseEnter,
      eventMouseLeave,
    })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const { point: grabPoint } = dayGrid.pointForEventOnDate('1', '2014-06-11')
    const { point: otherPoint } = dayGrid.pointForEventOnDate('2', '2014-06-12')

    await pointer.press(grabPoint, async () => {
      eventMouseEnter.mockClear() // hovering the grabbed event itself is fine
      await pointer.move(otherPoint)
      await pointer.move(dayGrid.pointForDate('2014-06-20'))
    })
    await waitForSettle()

    expect(eventMouseEnter).not.toHaveBeenCalled()
    expect(eventMouseLeave).not.toHaveBeenCalled()
    expect(calendar.getEventById('1')!.startStr).toBe('2014-06-20')
  })

  /*
  validRange applies to the moved event's whole range, not just the day under the pointer.
  These drops all land the pointer on a valid day. (Pointers over disabled days are covered below.)
  */
  describe('with validRange', () => {
    const validRangeOptions = {
      ...options,
      initialDate: '2017-06-01',
      validRange: { start: '2017-06-06', end: '2017-06-09' }, // Jun 6, 7, 8
      events: [{ id: '1', start: '2017-06-06', end: '2017-06-08' }], // Jun 6, 7
    }

    it.each([
      ['its start before the range', '2017-06-07', '2017-06-06'], // would be Jun 5, 6
      ['its end after the range', '2017-06-06', '2017-06-08'], // would be Jun 8, 9
    ])('won\'t drop the event with %s', async (_desc, grab, drop) => {
      const eventDragStart = vi.fn()
      const eventDragStop = vi.fn()
      const eventDrop = vi.fn()
      const calendar = initCalendar({ ...validRangeOptions, eventDragStart, eventDragStop, eventDrop })
      await waitForSettle()

      await new DayGridModel(calendar.el).dragEvent('1', grab, drop)

      expect(eventDragStart).toHaveBeenCalledOnce()
      expect(eventDragStop).toHaveBeenCalledOnce()
      expect(eventDrop).not.toHaveBeenCalled()
      expect(calendar.getEventById('1')!.startStr).toBe('2017-06-06')
    })

    it('drops the event when it ends exactly at the range\'s end', async () => {
      const calendar = initCalendar(validRangeOptions)
      await waitForSettle()

      await new DayGridModel(calendar.el).dragEvent('1', '2017-06-06', '2017-06-07')

      const event = calendar.getEventById('1')!
      expect(event.startStr).toBe('2017-06-07')
      expect(event.endStr).toBe('2017-06-09')
    })
  })

  describe('with showNonCurrentDates:false', () => {
    const nonCurrentOptions = {
      ...options,
      initialDate: '2017-06-01',
      showNonCurrentDates: false,
      events: [{ id: '1', start: '2017-06-07', end: '2017-06-10' }],
    }

    it('won\'t drop when the pointer is over a disabled day', async () => {
      const eventDragStart = vi.fn()
      const eventDragStop = vi.fn()
      const eventDrop = vi.fn()
      const calendar = initCalendar({ ...nonCurrentOptions, eventDragStart, eventDragStop, eventDrop })
      await waitForSettle()

      await new DayGridModel(calendar.el).dragEvent('1', '2017-06-08', '2017-05-31')

      expect(eventDragStart).toHaveBeenCalledOnce()
      expect(eventDragStop).toHaveBeenCalledOnce()
      expect(eventDrop).not.toHaveBeenCalled()
    })

    it('drops when the event\'s start lands on a disabled day but the pointer doesn\'t', async () => {
      const eventDrop = vi.fn()
      const calendar = initCalendar({ ...nonCurrentOptions, eventDrop })
      await waitForSettle()

      await new DayGridModel(calendar.el).dragEvent('1', '2017-06-08', '2017-06-01')

      expect(eventDrop).toHaveBeenCalledOnce()
      expect(calendar.getEventById('1')!.startStr).toBe('2017-05-31')
    })
  })
})
