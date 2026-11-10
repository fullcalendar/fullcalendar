import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { queryPart } from '../lib/models/events'
import { getRectCenter, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

describe('dateClick in dayGrid', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-05-27',
  }

  it.each([
    ['not selectable', false],
    ['selectable', true],
  ])('reports the clicked day when %s', async (_desc, selectable) => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, selectable, dateClick })
    await waitForSettle()

    await new DayGridModel(calendar.el).clickDate('2014-05-07')

    expect(dateClick).toHaveBeenCalledOnce()
    const info = dateClick.mock.calls[0][0]
    expect(info.dateStr).toBe('2014-05-07')
    expect(info.date).toEqual(new Date('2014-05-07T00:00:00Z'))
    expect(info.allDay).toBe(true)
    expect(info.dayEl).toBe(new DayGridModel(calendar.el).getDayCell('2014-05-07'))
    expect(info.jsEvent).toBeInstanceOf(MouseEvent)
    expect(info.view.type).toBe('dayGridMonth')
  })

  it('reports the clicked day in RTL', async () => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, direction: 'rtl', dateClick })
    await waitForSettle()

    await new DayGridModel(calendar.el).clickDate('2014-05-07')

    expect(dateClick.mock.calls[0][0].dateStr).toBe('2014-05-07')
  })

  it('fires when the click is on a background event', async () => {
    const dateClick = vi.fn()
    const calendar = initCalendar({
      ...options,
      events: [{ start: '2014-05-06', display: 'background' }],
      dateClick,
    })
    await waitForSettle()

    const bgEventEl = queryPart(calendar.el, 'backgroundEvent')!
    await pointer.click(getRectCenter(bgEventEl.getBoundingClientRect()))
    await waitForSettle()

    expect(dateClick).toHaveBeenCalledOnce()
    expect(dateClick.mock.calls[0][0].dateStr).toBe('2014-05-06')
  })
})
