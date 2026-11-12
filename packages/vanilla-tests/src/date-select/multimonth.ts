import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { MultiMonthModel } from '../lib/models/multi-month'
import { waitForSettle } from '../lib/settle'

describe('selecting dates in multiMonth', () => {
  const options = {
    initialView: 'multiMonthYear',
    initialDate: '2023-01-01',
    selectable: true,
    dragScroll: false,
  }

  it('selects the dragged-over days within a month', async () => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, select })
    await waitForSettle()

    const multiMonth = new MultiMonthModel(calendar.el)
    await multiMonth.selectDates('2023-01-10', '2023-01-17')

    expect(select).toHaveBeenCalledOnce()
    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe('2023-01-10')
    expect(info.endStr).toBe('2023-01-18')
    expect(info.allDay).toBe(true)
    expect(info.view.type).toBe('multiMonthYear')
    expect(queryParts(multiMonth.getMonthEl('2023-01'), 'highlight').length).toBeGreaterThan(0)
  })

  /*
  https://github.com/fullcalendar/fullcalendar/issues/7183
  KNOWN BUG (it.fails until fixed): a selection can't cross from one month's grid into another's.
  Each month is its own component, and DateSelecting only hit-tests its own component, so once the
  pointer enters the next month's grid there's no hit: nothing is selected, and `select` doesn't fire.
  (Event dragging hit-tests all components, so dragging an event between months works.)
  */
  it.fails.each([
    ['forward, months side by side', '2023-01-30', '2023-02-02', {}],
    ['backward, months side by side', '2023-02-02', '2023-01-30', {}],
    ['forward, months stacked with multiMonthMaxColumns:1', '2023-01-30', '2023-02-02', { multiMonthMaxColumns: 1 }],
  ])('selects across two months\' grids (%s)', async (_desc, first, last, moreOptions) => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, ...moreOptions, select })
    await waitForSettle()

    const multiMonth = new MultiMonthModel(calendar.el)
    await multiMonth.selectDates(first, last)

    expect(select).toHaveBeenCalledOnce()
    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe('2023-01-30')
    expect(info.endStr).toBe('2023-02-03')
    // highlighted in both grids
    expect(queryParts(multiMonth.getMonthEl('2023-01'), 'highlight').length).toBeGreaterThan(0)
    expect(queryParts(multiMonth.getMonthEl('2023-02'), 'highlight').length).toBeGreaterThan(0)
    expect(queryParts(multiMonth.getMonthEl('2023-03'), 'highlight')).toEqual([])
  })
})
