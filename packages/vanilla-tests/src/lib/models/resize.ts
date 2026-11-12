import classNames from 'fullcalendar/protected-styles'
import { getRectCenter, Point, pointer, touchPointer } from '../pointer'
import { waitForSettle } from '../settle'
import { assertPointHits } from './events'

export type ResizeEdge = 'start' | 'end'

/*
The event segment's resize handle for the edge. Handles only take up space while the event is
hovered (or selected, for touch), so hover first.
*/
export function getResizerEl(eventEl: HTMLElement, edge: ResizeEdge): HTMLElement | null {
  return eventEl.querySelector<HTMLElement>(
    '.' + (edge === 'start' ? classNames.internalEventResizerStart : classNames.internalEventResizerEnd),
  )
}

/*
Hovers the segment to reveal its handle, presses the handle, and moves it by the distance between
the edge's old and new positions (points from `fromAnchor` and `toAnchor`), so the hit under the
pointer moves by exactly the intended amount.

`fromAnchor` is measured before the press and `toAnchor` after, because locating the target can
scroll. The handle keeps its offset from the anchor, which content scrolling doesn't change.
*/
export async function resizeSegment(
  eventEl: HTMLElement,
  edge: ResizeEdge,
  fromAnchor: () => Point,
  toAnchor: () => Point,
  whileResizing?: () => Promise<void>,
): Promise<void> {
  const fromPoint = fromAnchor()
  // hover near the edge, which is in view, rather than the event's center, which might not be
  await pointer.move(pointInRectNear(eventEl.getBoundingClientRect(), fromPoint), 1)
  await waitForSettle()

  const grabPoint = getHandlePoint(eventEl, edge)

  await pointer.press(grabPoint, async () => {
    const toPoint = toAnchor()
    await pointer.move({ x: toPoint.x + grabPoint.x - fromPoint.x, y: toPoint.y + grabPoint.y - fromPoint.y })
    await waitForSettle()

    if (whileResizing) {
      await whileResizing()
    }
  })
  await waitForSettle()
}

/*
Like resizeSegment, but with touch: a long press first selects the event (revealing its handles,
for `holdMs` beyond longPressDelay), then a touch drag moves the handle.
The target must already be in view: on touch, FullCalendar treats any scroll during the gesture as
the user scrolling (PointerDragging's wasTouchScroll), which cancels the resize.
*/
export async function touchResizeSegment(
  eventEl: HTMLElement,
  edge: ResizeEdge,
  fromAnchor: () => Point,
  toAnchor: () => Point,
  holdMs: number,
): Promise<void> {
  const fromPoint = fromAnchor()
  await touchPointer.press(pointInRectNear(eventEl.getBoundingClientRect(), fromPoint), holdMs, async () => {})
  await waitForSettle()

  const grabPoint = getHandlePoint(eventEl, edge)

  await touchPointer.press(grabPoint, 0, async () => {
    const toPoint = toAnchor()
    await touchPointer.move({ x: toPoint.x + grabPoint.x - fromPoint.x, y: toPoint.y + grabPoint.y - fromPoint.y })
    await waitForSettle()
  })
  await waitForSettle()
}

function getHandlePoint(eventEl: HTMLElement, edge: ResizeEdge): Point {
  const resizerEl = getResizerEl(eventEl, edge)
  if (!resizerEl) {
    throw new Error(`The event has no ${edge} resize handle. Is it resizable?`)
  }

  const point = getRectCenter(resizerEl.getBoundingClientRect())
  assertPointHits(point, resizerEl, `the ${edge} resize handle`)
  return point
}

// The point inside the rect (3px from its edges) closest to the given point
function pointInRectNear(rect: DOMRect, point: Point): Point {
  return {
    x: Math.min(Math.max(point.x, rect.left + 3), rect.right - 3),
    y: Math.min(Math.max(point.y, rect.top + 3), rect.bottom - 3),
  }
}
