import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { TimeGridModel } from '../lib/models/time-grid'
import { getSlotLaneEls, getVerticalScroller } from '../lib/models/slots'
import { pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

describe('event dragging when the time grid scrolls under a still pointer', () => {
  it('drops on the slot under the pointer', async () => {
    const eventDrop = vi.fn()
    const calendar = initCalendar({
      initialView: 'timeGridDay',
      initialDate: '2014-06-11',
      editable: true,
      dragScroll: false,
      height: 400,
      scrollTime: '00:00',
      events: [{ id: '1', start: '2014-06-11T01:00:00', end: '2014-06-11T02:00:00' }],
      eventDrop,
    })
    await waitForSettle()

    const timeGrid = new TimeGridModel(calendar.el)
    const scroller = getVerticalScroller(timeGrid.getDayLane('2014-06-11'))
    const { point: grabPoint } = timeGrid.pointForEventAt('1', '2014-06-11T01:15')
    const holdPoint = { x: grabPoint.x + 20, y: grabPoint.y }

    await pointer.press(grabPoint, async () => {
      await pointer.move(holdPoint)
      await waitForSettle()

      scroller.scrollTop += 200
      await waitForAnimationFrames(2)
      await waitForSettle()
    })
    await waitForSettle()

    expect(eventDrop).toHaveBeenCalledOnce()
    expect(calendar.getEventById('1')!.startStr).toBe(
      `2014-06-11T${getSlotTimeAt(calendar.el, holdPoint.y)}Z`,
    )
  })
})

async function waitForAnimationFrames(n: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    await new Promise((resolve) => requestAnimationFrame(resolve))
  }
}

function getSlotTimeAt(root: HTMLElement, y: number): string {
  const slotEl = getSlotLaneEls(root).find((el) => {
    const rect = el.getBoundingClientRect()
    return rect.top <= y && y < rect.bottom
  })

  if (!slotEl) {
    throw new Error(`No slot at y=${y}`)
  }
  return slotEl.getAttribute('data-time')!
}
