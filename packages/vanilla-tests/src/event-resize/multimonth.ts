import { describe, expect, it, vi } from 'vitest'
import { createDuration } from 'fullcalendar/protected-api'
import { initCalendar } from '../lib/calendar'
import { MultiMonthModel } from '../lib/models/multi-month'
import { waitForSettle } from '../lib/settle'

describe('event resizing in multiMonth', () => {
  const options = {
    initialView: 'multiMonthYear',
    initialDate: '2023-01-01',
    editable: true,
    dragScroll: false,
  }

  it('extends an all-day event\'s end by whole days within a month', async () => {
    const eventResize = vi.fn()
    const calendar = initCalendar({ ...options, events: [{ id: '1', start: '2023-01-11' }], eventResize })
    await waitForSettle()

    await new MultiMonthModel(calendar.el).resizeEvent('1', 'end', '2023-01-11', '2023-01-13')

    const info = eventResize.mock.calls[0][0]
    expect(info.endDelta).toEqual(createDuration({ day: 2 }))
    expect(info.event.startStr).toBe('2023-01-11')
    expect(info.event.endStr).toBe('2023-01-14')
    expect(info.view.type).toBe('multiMonthYear')
  })

  /*
  https://github.com/fullcalendar/fullcalendar/issues/7183 (about selection; resizing has the same cause)
  KNOWN BUG (it.fails until fixed): a resize can't cross from one month's grid into another's.
  Each month is its own component, and EventResizing only hit-tests its own component, so the edge
  can't land on the other month's days: the resize is cancelled and `eventResize` doesn't fire.
  (Event dragging hit-tests all components, so dragging an event between months works.)
  */
  it.fails.each([
    ['side by side', {}],
    ['stacked, with multiMonthMaxColumns:1', { multiMonthMaxColumns: 1 }],
  ])('extends the end into the next month\'s grid (months %s)', async (_desc, moreOptions) => {
    const eventResize = vi.fn()
    const calendar = initCalendar({
      ...options,
      ...moreOptions,
      events: [{ id: '1', start: '2023-01-30' }],
      eventResize,
    })
    await waitForSettle()

    const multiMonth = new MultiMonthModel(calendar.el)
    await multiMonth.resizeEvent('1', 'end', '2023-01-30', '2023-02-02')

    const info = eventResize.mock.calls[0][0]
    expect(info.endDelta).toEqual(createDuration({ day: 3 }))
    expect(info.event.startStr).toBe('2023-01-30')
    expect(info.event.endStr).toBe('2023-02-03')
    // one segment per month
    expect(multiMonth.gridForDate('2023-01-30').getEventEls('1')).toHaveLength(1)
    expect(multiMonth.gridForDate('2023-02-02').getEventEls('1')).toHaveLength(1)
  })

  // KNOWN BUG (it.fails until fixed): see above
  it.fails('moves the start back into the previous month\'s grid with eventResizableFromStart', async () => {
    const calendar = initCalendar({
      ...options,
      eventResizableFromStart: true,
      events: [{ id: '1', start: '2023-02-02', end: '2023-02-04' }],
    })
    await waitForSettle()

    await new MultiMonthModel(calendar.el).resizeEvent('1', 'start', '2023-02-02', '2023-01-30')

    const event = calendar.getEventById('1')!
    expect(event.startStr).toBe('2023-01-30')
    expect(event.endStr).toBe('2023-02-04')
  })
})
