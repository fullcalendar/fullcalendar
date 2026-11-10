import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { getBgEventEls, getEventTexts, getVisibleEventEls } from '../lib/models/event-content'
import { getRectCenter, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

// a point on the page margin, above the calendar
const OUTSIDE = { x: 5, y: 5 }

describe('eventMouseEnter and eventMouseLeave', () => {
  const options = {
    initialDate: '2014-08-01',
    scrollTime: '00:00:00',
  }

  it.each([
    { view: 'dayGridMonth' },
    { view: 'timeGridWeek' },
    { view: 'listWeek' },
  ])('fire when the pointer enters and leaves an event in $view', async ({ view }) => {
    const eventMouseEnter = vi.fn()
    const eventMouseLeave = vi.fn()
    const calendar = initCalendar({
      ...options,
      initialView: view,
      events: [{ id: '1', start: '2014-08-02T01:00:00' }],
      eventMouseEnter,
      eventMouseLeave,
    })
    await waitForSettle()
    await pointer.move(OUTSIDE, 1)

    const eventEl = getVisibleEventEls(calendar.el)[0]
    await pointer.move(getRectCenter(eventEl.getBoundingClientRect()))
    expect(eventMouseEnter).toHaveBeenCalledOnce()
    expect(eventMouseLeave).not.toHaveBeenCalled()

    const enterInfo = eventMouseEnter.mock.calls[0][0]
    expect(enterInfo.event.id).toBe('1')
    expect(enterInfo.el).toBe(eventEl)
    expect(enterInfo.jsEvent).toBeInstanceOf(MouseEvent)
    expect(enterInfo.view.type).toBe(view)

    await pointer.move(OUTSIDE)
    expect(eventMouseLeave).toHaveBeenCalledOnce()
    expect(eventMouseLeave.mock.calls[0][0].event.id).toBe('1')
  })

  it.each([
    { view: 'dayGridMonth' },
    { view: 'timeGridWeek' },
  ])('don\'t fire eventMouseLeave when the hovered event is updated, in $view', async ({ view }) => {
    const eventMouseEnter = vi.fn((info) => {
      info.event.setProp('title', 'YO')
    })
    const eventMouseLeave = vi.fn()
    const calendar = initCalendar({
      ...options,
      initialView: view,
      events: [{ title: 'event', start: '2014-08-02T01:00:00' }],
      eventMouseEnter,
      eventMouseLeave,
    })
    await waitForSettle()
    await pointer.move(OUTSIDE, 1)

    await pointer.move(getRectCenter(getVisibleEventEls(calendar.el)[0].getBoundingClientRect()))
    await waitForSettle()

    expect(eventMouseEnter).toHaveBeenCalledOnce()
    expect(getEventTexts(getVisibleEventEls(calendar.el)[0]).title).toBe('YO') // rerendered
    expect(eventMouseLeave).not.toHaveBeenCalled()

    // leaving the updated event still fires, once
    await pointer.move(OUTSIDE)
    expect(eventMouseLeave).toHaveBeenCalledOnce()
    expect(eventMouseLeave.mock.calls[0][0].event.title).toBe('YO')
    expect(eventMouseLeave.mock.calls[0][0].el).toBe(getVisibleEventEls(calendar.el)[0])
  })

  it('fire for background events', async () => {
    const eventMouseEnter = vi.fn()
    const eventMouseLeave = vi.fn()
    const calendar = initCalendar({
      ...options,
      initialView: 'dayGridMonth',
      events: [{ start: '2014-08-02', display: 'background' }],
      eventMouseEnter,
      eventMouseLeave,
    })
    await waitForSettle()
    await pointer.move(OUTSIDE, 1)

    const rect = getBgEventEls(calendar.el)[0].getBoundingClientRect()
    await pointer.move({ x: rect.left + rect.width / 2, y: rect.bottom - 5 }) // below the day number
    expect(eventMouseEnter).toHaveBeenCalledOnce()
    expect(eventMouseEnter.mock.calls[0][0].event.display).toBe('background')

    await pointer.move(OUTSIDE)
    expect(eventMouseLeave).toHaveBeenCalledOnce()
  })
})
