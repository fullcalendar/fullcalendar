import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { TimeGridModel } from '../lib/models/time-grid'
import { getRectCenter, touchPointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

/*
Touch drags only start after a long press.
*/
describe('event dragging with touch', () => {
  const LONG_PRESS_DELAY = 50
  const HOLD = LONG_PRESS_DELAY + 100

  const options = {
    initialDate: '2014-06-11',
    editable: true,
    dragScroll: false,
    longPressDelay: LONG_PRESS_DELAY,
  }

  it('moves an all-day event in dayGrid after a long press', async () => {
    const calendar = initCalendar({
      ...options,
      initialView: 'dayGridMonth',
      events: [{ id: '1', start: '2014-06-11' }],
    })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const { point } = dayGrid.pointForEventOnDate('1', '2014-06-11')
    await touchPointer.press(point, HOLD, async () => {
      await touchPointer.move(dayGrid.pointForDate('2014-06-20'))
      await waitForSettle()
    })
    await waitForSettle()

    expect(calendar.getEventById('1')!.startStr).toBe('2014-06-20')
  })

  it('moves a timed event in timeGrid after a long press', async () => {
    const calendar = initCalendar({
      ...options,
      initialView: 'timeGridWeek',
      events: [{ id: '1', start: '2014-06-11T06:00:00' }],
    })
    await waitForSettle()

    const timeGrid = new TimeGridModel(calendar.el)
    const { point } = timeGrid.pointForEventAt('1', '2014-06-11T06:00')
    await touchPointer.press(point, HOLD, async () => {
      await touchPointer.move(timeGrid.pointForDateTime('2014-06-12T07:30'))
      await waitForSettle()
    })
    await waitForSettle()

    expect(calendar.getEventById('1')!.startStr).toBe('2014-06-12T07:30:00Z')
  })

  it('doesn\'t drag when the press is shorter than longPressDelay', async () => {
    const eventDragStart = vi.fn()
    const calendar = initCalendar({
      ...options,
      initialView: 'dayGridMonth',
      longPressDelay: 1000,
      events: [{ id: '1', start: '2014-06-11' }],
      eventDragStart,
    })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const { point } = dayGrid.pointForEventOnDate('1', '2014-06-11')
    await touchPointer.press(point, 0, async () => {
      await touchPointer.move(dayGrid.pointForDate('2014-06-20'))
    })
    await waitForSettle()

    expect(eventDragStart).not.toHaveBeenCalled()
    expect(calendar.getEventById('1')!.startStr).toBe('2014-06-11')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5706
  it('drags when the press starts on custom event content', async () => {
    const calendar = initCalendar({
      ...options,
      initialView: 'dayGridMonth',
      initialDate: '2020-08-12',
      events: [{ id: '1', start: '2020-08-12' }],
      eventContent: { html: '<i>the text</i>' },
    })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const customEl = dayGrid.getEventEls('1')[0].querySelector('i')!
    await touchPointer.press(getRectCenter(customEl.getBoundingClientRect()), HOLD, async () => {
      await touchPointer.move(dayGrid.pointForDate('2020-08-13'))
      await waitForSettle()
    })
    await waitForSettle()

    expect(calendar.getEventById('1')!.startStr).toBe('2020-08-13')
  })
})
