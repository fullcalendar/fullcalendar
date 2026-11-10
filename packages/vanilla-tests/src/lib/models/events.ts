import { getElEventRange } from 'fullcalendar/protected-api'
import classNames from 'fullcalendar/protected-styles'
import { getParts, partSelector } from '../parts'
import { Point } from '../pointer'

export function queryParts(root: ParentNode, part: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(partSelector(part)))
}

export function queryPart(root: ParentNode, part: string): HTMLElement | null {
  return root.querySelector<HTMLElement>(partSelector(part))
}

/*
Event elements (one per rendered segment) for the event with the given id, or all events.
Excludes drag/resize mirrors.
*/
export function getEventEls(root: ParentNode, eventId?: string): HTMLElement[] {
  return queryParts(root, 'event').filter((el) => {
    const eventRange = getElEventRange(el)
    return eventRange && !isMirrorEl(el) && (eventId == null || eventRange.def.publicId === eventId)
  })
}

export function getEventIdOfEl(el: HTMLElement): string {
  return getElEventRange(el)!.def.publicId
}

export function isElVisible(el: HTMLElement): boolean {
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
}

export function getMirrorEls(root: ParentNode): HTMLElement[] {
  return queryParts(root, 'event').filter(isMirrorEl)
}

function isMirrorEl(el: HTMLElement): boolean {
  return el.classList.contains(classNames.internalEventMirror)
}

/*
Throws if the point is on an event. Selections can't start on an event (FullCalendar ignores those
presses), so selection gestures must start on empty space.
*/
export function assertNotOnEvent(point: Point, what: string): void {
  const hitEl = document.elementFromPoint(point.x, point.y)

  if (hitEl && hitEl.closest('.test-part-event')) {
    throw new Error(`Point for ${what} is on an event, where a selection can't start`)
  }
}

/*
Resize handles inside the event element. A press on one resizes instead of dragging.
*/
export function getResizerEls(eventEl: HTMLElement): HTMLElement[] {
  return Array.from(eventEl.querySelectorAll<HTMLElement>('.' + classNames.internalEventResizer))
}

/*
Throws unless the point is on the event element and not on one of its resize handles.
*/
export function assertGrabbable(point: Point, eventEl: HTMLElement, what: string): void {
  assertPointHits(point, eventEl, what)

  const hitEl = document.elementFromPoint(point.x, point.y)!
  if (hitEl.closest('.' + classNames.internalEventResizer)) {
    throw new Error(`Point for ${what} is on a resize handle, which would resize instead of drag`)
  }
}

/*
Throws unless the topmost element at the point is (inside) the expected element.
Raw mouse input has no covered-target check of its own, so models call this before acting.
*/
export function assertPointHits(point: Point, expectedEl: HTMLElement, what: string): void {
  const hitEl = document.elementFromPoint(point.x, point.y)

  if (!hitEl || !expectedEl.contains(hitEl)) {
    throw new Error(
      `Point (${Math.round(point.x)}, ${Math.round(point.y)}) for ${what} hits ` +
      `${describeEl(hitEl)} instead of ${describeEl(expectedEl)}`,
    )
  }
}

function describeEl(el: Element | null): string {
  if (!el) {
    return 'nothing'
  }
  const parts = getParts(el)
  return `<${el.tagName.toLowerCase()}${parts.length ? ` parts="${parts.join(' ')}"` : ''}>`
}
