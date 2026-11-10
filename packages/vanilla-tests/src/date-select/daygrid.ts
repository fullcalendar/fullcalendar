import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { queryParts } from '../lib/models/events'
import { pointer, touchPointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

describe('selecting dates in dayGrid', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-05-25',
    selectable: true,
    dragScroll: false,
  }

  it('selects the dragged-over days, across rows', async () => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, select })
    await waitForSettle()

    await new DayGridModel(calendar.el).selectDates('2014-04-28', '2014-05-06')

    expect(select).toHaveBeenCalledOnce()
    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe('2014-04-28')
    expect(info.endStr).toBe('2014-05-07')
    expect(info.allDay).toBe(true)
    expect(info.jsEvent).toBeInstanceOf(MouseEvent)
    expect(info.view.type).toBe('dayGridMonth')
    expect(queryParts(calendar.el, 'highlight').length).toBeGreaterThan(0)
  })

  it('selects a single day', async () => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, select })
    await waitForSettle()

    await new DayGridModel(calendar.el).selectDates('2014-04-28', '2014-04-28')

    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe('2014-04-28')
    expect(info.endStr).toBe('2014-04-29')
  })

  it('selects the dragged-over days in RTL', async () => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, direction: 'rtl', select })
    await waitForSettle()

    await new DayGridModel(calendar.el).selectDates('2014-05-05', '2014-05-07')

    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe('2014-05-05')
    expect(info.endStr).toBe('2014-05-08')
  })

  it('selects after a long touch press', async () => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, longPressDelay: 50, select })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    await touchPointer.press(dayGrid.pointForDate('2014-04-28'), 150, async () => {
      await touchPointer.move(dayGrid.pointForDate('2014-05-06'))
      await waitForSettle()
    })
    await waitForSettle()

    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe('2014-04-28')
    expect(info.endStr).toBe('2014-05-07')
  })

  describe('with selectMinDistance', () => {
    it.each([
      ['selects when dragged beyond it', 12, true],
      ['doesn\'t select when dragged less', 8, false],
    ])('%s', async (_desc, distance, isSelected) => {
      const select = vi.fn()
      const calendar = initCalendar({ ...options, selectMinDistance: 10, select })
      await waitForSettle()

      const start = new DayGridModel(calendar.el).pointForDate('2014-04-28')
      await pointer.press(start, async () => {
        await pointer.move({ x: start.x + distance, y: start.y })
        await waitForSettle()
      })
      await waitForSettle()

      expect(select).toHaveBeenCalledTimes(isSelected ? 1 : 0)
    })
  })
})
