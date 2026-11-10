import { describe, expect, it, vi } from 'vitest'
import { DayLaneInfo } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

describe('timeGrid day lanes', () => {
  it('call dayLaneDidMount for each lane, with its date and element', async () => {
    const dayLaneDidMount = vi.fn((_info: DayLaneInfo) => undefined)
    const calendar = initCalendar({ initialView: 'timeGridWeek', initialDate: '2014-05-01', dayLaneDidMount })
    await waitForSettle()

    const laneEls = queryParts(calendar.el, 'dayLane')
    expect(laneEls.length).toBe(7)
    expect(dayLaneDidMount).toHaveBeenCalledTimes(7)

    for (const [info] of dayLaneDidMount.mock.calls) {
      expect(laneEls).toContain(info.el)
      expect(info.date.toISOString().slice(0, 10)).toBe(info.el.getAttribute('data-date'))
      expect(info.view.type).toBe('timeGridWeek')
    }
  })
})
