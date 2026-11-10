import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { TimeGridModel } from '../lib/models/time-grid'
import { waitForSettle } from '../lib/settle'

describe('dateClick in timeGrid', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-05-27',
    contentHeight: 500,
    scrollTime: '07:00:00',
  }

  it('reports an all-day click in the all-day row', async () => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, dateClick })
    await waitForSettle()

    await new TimeGridModel(calendar.el).allDay.clickDate('2014-05-28')

    const info = dateClick.mock.calls[0][0]
    expect(info.dateStr).toBe('2014-05-28')
    expect(info.allDay).toBe(true)
  })

  it.each([
    ['in a slot', {}, '2014-05-28T09:00'],
    // https://github.com/fullcalendar/fullcalendar/issues/2217
    ['in a slot with slotMinTime', { slotMinTime: '02:00:00' }, '2014-05-28T11:00'],
    // https://github.com/fullcalendar/fullcalendar/issues/4539
    ['in one of the last slots', { scrollTime: '23:00:00' }, '2014-05-28T23:30'],
  ])('reports a timed click %s', async (_desc, moreOptions, dateTime) => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, ...moreOptions, dateClick })
    await waitForSettle()

    await new TimeGridModel(calendar.el).clickDateTime(dateTime)

    const info = dateClick.mock.calls[0][0]
    expect(info.dateStr).toBe(dateTime + ':00Z')
    expect(info.allDay).toBe(false)
  })

  it('reports a timed click in RTL', async () => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, direction: 'rtl', dateClick })
    await waitForSettle()

    await new TimeGridModel(calendar.el).clickDateTime('2014-05-28T09:00')

    expect(dateClick.mock.calls[0][0].dateStr).toBe('2014-05-28T09:00:00Z')
  })
})
