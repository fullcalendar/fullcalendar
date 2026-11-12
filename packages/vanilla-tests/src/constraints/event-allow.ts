import { describe, expect, it, vi } from 'vitest'
import { AllowFunc } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { dragEventStartTo } from '../lib/event-moves'
import { waitForSettle } from '../lib/settle'

describe('eventAllow', () => {
  it.each([true, false])('decides a drag (returning %s), given the drop location and event', async (returnValue) => {
    const eventAllow = vi.fn<AllowFunc>(() => returnValue)
    const eventDrop = vi.fn()
    const calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2016-09-04',
      scrollTime: '00:00',
      editable: true,
      events: [{ id: '1', title: 'event 1', start: '2016-09-04T01:00' }],
      eventAllow,
      eventDrop,
    })
    await waitForSettle()

    await dragEventStartTo(calendar, '1', '2016-09-04T03:00')

    expect(eventAllow).toHaveBeenCalled()
    const [dropInfo, event] = eventAllow.mock.calls.at(-1)!
    expect(dropInfo.startStr).toBe('2016-09-04T03:00:00Z')
    expect(dropInfo.end).toBeInstanceOf(Date)
    expect(dropInfo.allDay).toBe(false)
    expect(event.title).toBe('event 1')
    expect(eventDrop).toHaveBeenCalledTimes(returnValue ? 1 : 0)
    expect(calendar.getEventById('1')!.startStr).toBe(returnValue ? '2016-09-04T03:00:00Z' : '2016-09-04T01:00:00Z')
  })
})
