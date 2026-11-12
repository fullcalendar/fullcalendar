import { describe, expect, it, vi } from 'vitest'
import { createDuration } from 'fullcalendar/protected-api'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { MultiMonthModel } from '../lib/models/multi-month'
import { waitForSettle } from '../lib/settle'

describe('event dragging in multiMonth', () => {
  const options = {
    initialView: 'multiMonthYear',
    initialDate: '2023-01-01',
    editable: true,
    dragScroll: false,
  }

  it('moves an all-day event by whole days within a month', async () => {
    const eventDrop = vi.fn()
    const calendar = initCalendar({ ...options, events: [{ id: '1', start: '2023-01-11' }], eventDrop })
    await waitForSettle()

    await new MultiMonthModel(calendar.el).dragEvent('1', '2023-01-11', '2023-01-18')

    const info = eventDrop.mock.calls[0][0]
    expect(info.delta).toEqual(createDuration({ day: 7 }))
    expect(info.event.startStr).toBe('2023-01-18')
    expect(info.event.end).toBeNull()
    expect(info.view.type).toBe('multiMonthYear')
  })

  it.each([
    ['side by side', {}],
    ['stacked, with multiMonthMaxColumns:1', { multiMonthMaxColumns: 1 }],
  ])('moves an event into another month\'s grid (months %s)', async (_desc, moreOptions) => {
    const eventDrop = vi.fn()
    const calendar = initCalendar({
      ...options,
      ...moreOptions,
      events: [{ id: '1', start: '2023-01-11', end: '2023-01-13' }],
      eventDrop,
    })
    await waitForSettle()

    const multiMonth = new MultiMonthModel(calendar.el)
    const janRect = multiMonth.getMonthEl('2023-01').getBoundingClientRect()
    const febRect = multiMonth.getMonthEl('2023-02').getBoundingClientRect()
    if ('multiMonthMaxColumns' in moreOptions) {
      expect(febRect.top).toBeGreaterThanOrEqual(janRect.bottom)
    } else {
      expect(febRect.left).toBeGreaterThanOrEqual(janRect.right)
    }

    await multiMonth.dragEvent('1', '2023-01-11', '2023-02-15')

    const info = eventDrop.mock.calls[0][0]
    expect(info.delta).toEqual(createDuration({ day: 35 }))
    expect(info.event.startStr).toBe('2023-02-15')
    expect(info.event.endStr).toBe('2023-02-17')
    expect(multiMonth.gridForDate('2023-02-15').getEventEls('1')).toHaveLength(1)
    expect(multiMonth.gridForDate('2023-01-11').getEventEls('1')).toEqual([])
  })

  it('moves an event spanning two months by the distance from the day grabbed in the later month', async () => {
    const calendar = initCalendar({
      ...options,
      events: [{ id: '1', start: '2023-01-30', end: '2023-02-03' }],
    })
    await waitForSettle()

    const multiMonth = new MultiMonthModel(calendar.el)
    expect(multiMonth.gridForDate('2023-01-30').getEventEls('1')).toHaveLength(1)
    expect(multiMonth.gridForDate('2023-02-01').getEventEls('1')).toHaveLength(1)

    // grab the February segment and drop it a week later
    await multiMonth.dragEvent('1', '2023-02-01', '2023-02-08')

    const event = calendar.getEventById('1')!
    expect(event.startStr).toBe('2023-02-06')
    expect(event.endStr).toBe('2023-02-10')
  })

  it('moves a timed event to another month, keeping its time', async () => {
    const calendar = initCalendar({
      ...options,
      events: [{ id: '1', start: '2023-03-08T10:30:00', end: '2023-03-08T12:00:00' }],
    })
    await waitForSettle()

    await new MultiMonthModel(calendar.el).dragEvent('1', '2023-03-08', '2023-04-12')

    const event = calendar.getEventById('1')!
    expect(event.startStr).toBe('2023-04-12T10:30:00Z')
    expect(event.endStr).toBe('2023-04-12T12:00:00Z')
    expect(event.allDay).toBe(false)
  })

  /*
  multiMonthYear hides other months' days (showNonCurrentDates:false), leaving disabled cells.
  January's grid ends with the disabled cells of Feb 1-11.
  */
  it.each([
    ['a dated cell', '2023-01-31', '2023-01-31'],
    ['a disabled other-month cell', '2023-02-01', '2023-01-11'],
  ])('when dropped on %s of January\'s grid, ends up on %s', async (_desc, dropDate, expectedStart) => {
    const eventDrop = vi.fn()
    const calendar = initCalendar({ ...options, events: [{ id: '1', start: '2023-01-11' }], eventDrop })
    await waitForSettle()

    const multiMonth = new MultiMonthModel(calendar.el)
    const janGrid = new DayGridModel(multiMonth.getMonthEl('2023-01'))
    expect(janGrid.getDayCell(dropDate).hasAttribute('data-date')).toBe(dropDate === expectedStart)

    await janGrid.dragEvent('1', '2023-01-11', dropDate)

    expect(eventDrop).toHaveBeenCalledTimes(dropDate === expectedStart ? 1 : 0)
    expect(calendar.getEventById('1')!.startStr).toBe(expectedStart)
  })
})
