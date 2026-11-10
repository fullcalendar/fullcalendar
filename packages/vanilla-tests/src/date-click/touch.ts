import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { touchPointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

describe('dateClick with touch', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-05-27',
  }

  it('fires once for a tap on a day', async () => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, dateClick })
    await waitForSettle()

    await touchPointer.press(new DayGridModel(calendar.el).pointForDate('2014-05-07'), 0, async () => {})
    await waitForSettle()

    expect(dateClick).toHaveBeenCalledOnce()
    const info = dateClick.mock.calls[0][0]
    expect(info.dateStr).toBe('2014-05-07')
    expect(info.allDay).toBe(true)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/3332
  it('doesn\'t fire when the touch moves onto another day', async () => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, dateClick })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    await touchPointer.press(dayGrid.pointForDate('2014-05-07'), 0, async () => {
      await touchPointer.move(dayGrid.pointForDate('2014-05-08'))
    })
    await waitForSettle()

    expect(dateClick).not.toHaveBeenCalled()
  })
})
