import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { TimeGridModel } from '../lib/models/time-grid'
import { getSlotLaneEls, getVerticalScroller } from '../lib/models/slots'
import { pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

/*
While dragging, FullCalendar's AutoScroller scrolls a scroller when the pointer is within 50px of its
edge (faster the closer it is), once per animation frame, without the pointer moving.
waitForSettle doesn't track auto-scrolling, so the tests poll for it.
*/
describe('event dragging auto-scroll (dragScroll)', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-06-11',
    editable: true,
    height: 400,
    scrollTime: '00:00',
    events: [{ id: '1', start: '2014-06-11T01:00:00', end: '2014-06-11T02:00:00' }],
  }

  it.each([
    ['scrolls the time grid down while the pointer rests near its bottom edge', true],
    ['doesn\'t scroll with dragScroll:false', false],
  ])('%s', async (_desc, dragScroll) => {
    const eventDrop = vi.fn()
    const calendar = initCalendar({ ...options, dragScroll, eventDrop })
    await waitForSettle()

    const timeGrid = new TimeGridModel(calendar.el)
    const scroller = getVerticalScroller(timeGrid.getDayLane('2014-06-11'))
    expect(scroller.scrollTop).toBe(0)

    // grab the event at its first slot's center, so the drop is the slot under the pointer
    const { point: grabPoint } = timeGrid.pointForEventAt('1', '2014-06-11T01:15')
    const holdPoint = { x: grabPoint.x, y: scroller.getBoundingClientRect().bottom - 5 }
    const heldSlotTime = getSlotTimeAt(calendar.el, holdPoint.y)

    await pointer.press(grabPoint, async () => {
      await pointer.move(holdPoint)

      if (dragScroll) {
        await expect.poll(() => scroller.scrollTop, { timeout: 5000 }).toBeGreaterThan(200)
      } else {
        await waitForAnimationFrames(30) // ample frames to have scrolled, if it were going to
        expect(scroller.scrollTop).toBe(0)
      }
      await waitForSettle()
    })
    await waitForSettle()

    expect(eventDrop).toHaveBeenCalledOnce()
    const event = calendar.getEventById('1')!
    expect(event.startStr.slice(0, 11)).toBe('2014-06-11T')

    if (dragScroll) {
      // dropped below what was initially in view
      expect(event.startStr.slice(11, 19) > heldSlotTime).toBe(true)
    } else {
      expect(event.startStr).toBe(`2014-06-11T${heldSlotTime}Z`)
    }
  })
})

/*
The data-time (`HH:mm:ss`) of the slot at the viewport y.
*/
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

async function waitForAnimationFrames(n: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    await new Promise((resolve) => requestAnimationFrame(resolve))
  }
}
