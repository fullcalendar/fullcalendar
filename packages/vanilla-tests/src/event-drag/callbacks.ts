import { describe, expect, it, vi } from 'vitest'
import { EventChangeInfo, EventDragStartInfo, EventDragStopInfo, EventDropInfo } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

/*
Drag behavior that doesn't depend on the view's geometry, tested once on dayGrid.
*/
describe('event dragging callbacks', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-06-11',
    editable: true,
    dragScroll: false,
    events: [{ id: '1', title: 'event', start: '2014-06-11' }],
  }

  it('calls eventDragStart, eventDragStop, eventDrop, then eventChange, with their arguments', async () => {
    const calls: string[] = []
    const eventDragStart = vi.fn((_info: EventDragStartInfo) => { calls.push('eventDragStart') })
    const eventDragStop = vi.fn((_info: EventDragStopInfo) => { calls.push('eventDragStop') })
    const eventDrop = vi.fn((_info: EventDropInfo) => { calls.push('eventDrop') })
    const eventChange = vi.fn((_info: EventChangeInfo) => { calls.push('eventChange') })
    const calendar = initCalendar({ ...options, eventDragStart, eventDragStop, eventDrop, eventChange })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const eventEl = dayGrid.getEventEls('1')[0]
    await dayGrid.dragEvent('1', '2014-06-11', '2014-06-13')

    expect(calls).toEqual(['eventDragStart', 'eventDragStop', 'eventDrop', 'eventChange'])

    for (const spy of [eventDragStart, eventDragStop]) {
      const info = spy.mock.calls[0][0]
      expect(info.el).toBe(eventEl)
      expect(info.event.id).toBe('1')
      expect(info.jsEvent).toBeInstanceOf(MouseEvent)
      expect(info.view.type).toBe('dayGridMonth')
    }

    const dropInfo = eventDrop.mock.calls[0][0]
    expect(dropInfo.el).toBe(eventEl)
    expect(dropInfo.event.startStr).toBe('2014-06-13')
    expect(dropInfo.oldEvent.startStr).toBe('2014-06-11')
    expect(dropInfo.relatedEvents).toEqual([])
    expect(dropInfo.jsEvent).toBeInstanceOf(MouseEvent)
    expect(dropInfo.view.type).toBe('dayGridMonth')

    const changeInfo = eventChange.mock.calls[0][0]
    expect(changeInfo.event.startStr).toBe('2014-06-13')
    expect(changeInfo.oldEvent.startStr).toBe('2014-06-11')
  })

  describe('when the drag changes nothing', () => {
    async function dragWithoutChange(drag: (dayGrid: DayGridModel) => Promise<void>) {
      const eventDragStart = vi.fn()
      const eventDragStop = vi.fn()
      const eventDrop = vi.fn()
      const eventChange = vi.fn()
      const calendar = initCalendar({ ...options, eventDragStart, eventDragStop, eventDrop, eventChange })
      await waitForSettle()

      const dayGrid = new DayGridModel(calendar.el)
      await drag(dayGrid)
      await waitForSettle()

      expect(eventDragStart).toHaveBeenCalledOnce()
      expect(eventDragStop).toHaveBeenCalledOnce()
      expect(eventDrop).not.toHaveBeenCalled()
      expect(eventChange).not.toHaveBeenCalled()
      expect(calendar.getEventById('1')!.startStr).toBe('2014-06-11')
      expect(dayGrid.getDayCell('2014-06-11').contains(dayGrid.getEventEls('1')[0])).toBe(true)
    }

    it('doesn\'t drop when moved to another day and back', async () => {
      await dragWithoutChange(async (dayGrid) => {
        const { point } = dayGrid.pointForEventOnDate('1', '2014-06-11')
        await pointer.press(point, async () => {
          await pointer.move(dayGrid.pointForDate('2014-06-13'))
          await waitForSettle()
          await pointer.move(dayGrid.pointForDate('2014-06-11'))
          await waitForSettle()
        })
      })
    })

    it('doesn\'t drop when released outside the calendar', async () => {
      await dragWithoutChange(async (dayGrid) => {
        const { point } = dayGrid.pointForEventOnDate('1', '2014-06-11')
        const rootRect = dayGrid.root.getBoundingClientRect()
        await pointer.press(point, async () => {
          await pointer.move(dayGrid.pointForDate('2014-06-13'))
          await waitForSettle()
          await pointer.move({ x: rootRect.left / 2, y: rootRect.top + rootRect.height / 2 })
          await waitForSettle()
        })
      })
    })
  })

  it.each([
    ['editable:false', { editable: false }],
    ['eventStartEditable:false', { eventStartEditable: false }],
    ['the event\'s startEditable:false', { events: [{ ...options.events[0], startEditable: false }] }],
  ])('doesn\'t drag with %s', async (_desc, moreOptions) => {
    const eventDragStart = vi.fn()
    const calendar = initCalendar({ ...options, ...moreOptions, eventDragStart })
    await waitForSettle()

    await new DayGridModel(calendar.el).dragEvent('1', '2014-06-11', '2014-06-13')

    expect(eventDragStart).not.toHaveBeenCalled()
    expect(calendar.getEventById('1')!.startStr).toBe('2014-06-11')
  })

  it('reverts the drop when eventDrop calls revert()', async () => {
    const eventDrop = vi.fn((info) => {
      expect(info.event.startStr).toBe('2014-06-13')
      info.revert()
    })
    const calendar = initCalendar({ ...options, eventDrop })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    await dayGrid.dragEvent('1', '2014-06-11', '2014-06-13')

    expect(eventDrop).toHaveBeenCalledOnce()
    expect(calendar.getEventById('1')!.startStr).toBe('2014-06-11')
    expect(dayGrid.getDayCell('2014-06-11').contains(dayGrid.getEventEls('1')[0])).toBe(true)
  })
})
