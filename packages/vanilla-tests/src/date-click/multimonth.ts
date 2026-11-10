import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { MultiMonthModel } from '../lib/models/multi-month'
import { waitForSettle } from '../lib/settle'

describe('dateClick in multiMonth', () => {
  const options = {
    initialView: 'multiMonthYear',
    initialDate: '2023-01-01',
  }

  it.each([
    ['side by side', '2023-05-17', {}],
    ['stacked, with multiMonthMaxColumns:1, in a month scrolled into view', '2023-11-15', { multiMonthMaxColumns: 1 }],
  ])('reports the clicked day (months %s)', async (_desc, date, moreOptions) => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, ...moreOptions, dateClick })
    await waitForSettle()

    const multiMonth = new MultiMonthModel(calendar.el)
    await multiMonth.clickDate(date)

    expect(dateClick).toHaveBeenCalledOnce()
    const info = dateClick.mock.calls[0][0]
    expect(info.dateStr).toBe(date)
    expect(info.date).toEqual(new Date(date + 'T00:00:00Z'))
    expect(info.allDay).toBe(true)
    expect(info.dayEl).toBe(multiMonth.getDayCell(date))
    expect(info.jsEvent).toBeInstanceOf(MouseEvent)
    expect(info.view.type).toBe('multiMonthYear')
  })

  /*
  multiMonthYear hides other months' days (showNonCurrentDates:false), leaving disabled cells.
  January's grid ends with the disabled cells of Feb 1-11.
  */
  it.each([
    ['a dated cell', '2023-01-31', 1],
    ['a disabled other-month cell', '2023-02-01', 0],
  ])('when clicking %s of January\'s grid, fires %i times', async (_desc, date, expectedCalls) => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, dateClick })
    await waitForSettle()

    const janGrid = new DayGridModel(new MultiMonthModel(calendar.el).getMonthEl('2023-01'))
    expect(janGrid.getDayCell(date).hasAttribute('data-date')).toBe(expectedCalls === 1)

    await janGrid.clickDate(date)

    expect(dateClick).toHaveBeenCalledTimes(expectedCalls)
  })

  it('reports an other-month day clicked in a month\'s grid with showNonCurrentDates:true', async () => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, showNonCurrentDates: true, dateClick })
    await waitForSettle()

    // Feb 1 is in both January's grid (as an other-month day) and February's
    const multiMonth = new MultiMonthModel(calendar.el)
    const janGrid = new DayGridModel(multiMonth.getMonthEl('2023-01'))
    const janCell = janGrid.getDayCell('2023-02-01')
    expect(janCell).not.toBe(multiMonth.getDayCell('2023-02-01'))

    await janGrid.clickDate('2023-02-01')

    expect(dateClick).toHaveBeenCalledOnce()
    const info = dateClick.mock.calls[0][0]
    expect(info.dateStr).toBe('2023-02-01')
    expect(info.dayEl).toBe(janCell)
  })
})
