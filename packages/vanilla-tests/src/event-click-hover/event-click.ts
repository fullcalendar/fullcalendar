import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { getEventEls } from '../lib/models/events'
import { getBgEventEls, getVisibleEventEls } from '../lib/models/event-content'
import { getRectCenter, pointer, touchPointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

describe('eventClick', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2018-08-31',
  }

  it('fires with the event, its element, the mouse event and the view', async () => {
    const eventClick = vi.fn()
    const calendar = initCalendar({
      ...options,
      eventClick,
      events: [{ id: '1', start: '2018-08-31' }],
    })
    await waitForSettle()

    const eventEls = getVisibleEventEls(calendar.el)
    expect(eventEls.length).toBe(1)
    await pointer.click(getRectCenter(eventEls[0].getBoundingClientRect()))

    expect(eventClick).toHaveBeenCalledOnce()
    const info = eventClick.mock.calls[0][0]
    expect(info.el).toBe(eventEls[0])
    expect(info.event.id).toBe('1')
    expect(info.event.startStr).toBe('2018-08-31')
    expect(info.jsEvent).toBeInstanceOf(MouseEvent)
    expect(info.jsEvent.type).toBe('click')
    expect(info.view.type).toBe('dayGridMonth')
  })

  it.each([
    { surface: 'a timeGrid event', view: 'timeGridWeek', dayMaxEventRows: false },
    { surface: 'a list row', view: 'listWeek', dayMaxEventRows: false },
    { surface: 'an event in a more-link popover', view: 'dayGridMonth', dayMaxEventRows: 1 },
  ])('fires on $surface', async ({ view, dayMaxEventRows }) => {
    const eventClick = vi.fn()
    const calendar = initCalendar({
      ...options,
      initialView: view,
      scrollTime: '09:00',
      dayMaxEventRows,
      eventClick,
      events: [
        { id: '1', start: '2018-08-31T10:00:00' },
        { id: '2', start: '2018-08-31T11:00:00' },
      ],
    })
    await waitForSettle()

    // the popover shows both events. Otherwise, click event 2 where it renders in the view
    const containerEl = dayMaxEventRows
      ? await new DayGridModel(calendar.el).openMorePopover('2018-08-31')
      : calendar.el
    const eventEls = getEventEls(containerEl, '2')
    expect(eventEls.length).toBe(1)
    await pointer.click(getRectCenter(eventEls[0].getBoundingClientRect()))

    expect(eventClick).toHaveBeenCalledOnce()
    const info = eventClick.mock.calls[0][0]
    expect(info.el).toBe(eventEls[0])
    expect(info.event.id).toBe('2')
    expect(info.jsEvent.type).toBe('click')
    expect(info.view.type).toBe(view)
  })

  it('fires on a background event', async () => {
    const eventClick = vi.fn()
    const calendar = initCalendar({
      ...options,
      eventClick,
      events: [{ id: 'bg', start: '2018-08-31', display: 'background' }],
    })
    await waitForSettle()

    const bgEventEls = getBgEventEls(calendar.el)
    expect(bgEventEls.length).toBe(1)
    const rect = bgEventEls[0].getBoundingClientRect()
    await pointer.click({ x: rect.left + rect.width / 2, y: rect.bottom - 5 }) // below the day number

    expect(eventClick).toHaveBeenCalledOnce()
    expect(eventClick.mock.calls[0][0].event.display).toBe('background')
    expect(eventClick.mock.calls[0][0].el).toBe(bgEventEls[0])
  })

  it('fires on a touch tap', async () => {
    const eventClick = vi.fn()
    const calendar = initCalendar({
      ...options,
      eventClick,
      events: [{ id: '1', start: '2018-08-31' }],
    })
    await waitForSettle()

    const eventEl = getVisibleEventEls(calendar.el)[0]
    await touchPointer.press(getRectCenter(eventEl.getBoundingClientRect()), 0, async () => {})
    await waitForSettle()

    expect(eventClick).toHaveBeenCalledOnce()
    expect(eventClick.mock.calls[0][0].event.id).toBe('1')
  })
})
