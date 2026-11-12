import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { TimeGridModel } from '../lib/models/time-grid'
import { getEventEls, queryPart } from '../lib/models/events'
import { getRectCenter, Point, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

/*
Dragging events out of a "+more" popover. Pressing anywhere in the popover counts as pressing on
the popover's day.
*/
describe('dragging events out of the more-link popover', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-08-01',
    dayMaxEventRows: 3,
    editable: true,
    dragScroll: false,
    events: [
      { id: '1', start: '2014-07-28', end: '2014-07-30' },
      { id: '2', start: '2014-07-29', end: '2014-07-31' },
      { id: '3', start: '2014-07-29' },
      { id: '4', start: '2014-07-29' },
    ],
  }

  async function dragFromPopover(popoverEl: HTMLElement, eventId: string, drop: () => Point): Promise<void> {
    const eventEl = getEventEls(popoverEl, eventId)[0]
    await pointer.press(getRectCenter(eventEl.getBoundingClientRect()), async () => {
      await pointer.move(drop())
      await waitForSettle()
    })
    await waitForSettle()
  }

  it('moves an all-day event to another day, keeping it all-day', async () => {
    const calendar = initCalendar(options)
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const popoverEl = await dayGrid.openMorePopover('2014-07-29')
    await dragFromPopover(popoverEl, '4', () => dayGrid.pointForDate('2014-07-28'))

    const event = calendar.getEventById('4')!
    expect(event.startStr).toBe('2014-07-28')
    expect(event.allDay).toBe(true)
  })

  it('moves a timed event to another day, keeping its time', async () => {
    const calendar = initCalendar({
      ...options,
      events: [...options.events, { id: '5', start: '2014-07-29T13:00:00' }],
    })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const popoverEl = await dayGrid.openMorePopover('2014-07-29')
    await dragFromPopover(popoverEl, '5', () => dayGrid.pointForDate('2014-07-28'))

    const event = calendar.getEventById('5')!
    expect(event.startStr).toBe('2014-07-28T13:00:00Z')
    expect(event.allDay).toBe(false)
  })

  it('moves an all-day event into a timeGrid slot, making it timed with no end', async () => {
    const calendar = initCalendar({ ...options, initialView: 'timeGridWeek', scrollTime: '00:00:00' })
    await waitForSettle()

    const timeGrid = new TimeGridModel(calendar.el)
    const popoverEl = await timeGrid.allDay.openMorePopover('2014-07-29')
    await dragFromPopover(popoverEl, '4', () => timeGrid.pointForDateTime('2014-07-30T03:00'))

    const event = calendar.getEventById('4')!
    expect(event.startStr).toBe('2014-07-30T03:00:00Z')
    expect(event.end).toBeNull()
    expect(event.allDay).toBe(false)
  })

  it('does nothing when the event isn\'t dragged out of the popover', async () => {
    const eventDragStop = vi.fn()
    const eventDrop = vi.fn()
    const calendar = initCalendar({ ...options, eventDragStop, eventDrop })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const popoverEl = await dayGrid.openMorePopover('2014-07-29')
    const eventRect = getEventEls(popoverEl, '3')[0].getBoundingClientRect()
    await dragFromPopover(popoverEl, '3', () => ({ x: eventRect.left + eventRect.width / 2 + 20, y: eventRect.top + eventRect.height / 2 }))

    expect(eventDragStop).toHaveBeenCalledOnce()
    expect(eventDrop).not.toHaveBeenCalled()
    expect(queryPart(document, 'popover')).not.toBeNull()
  })
})
