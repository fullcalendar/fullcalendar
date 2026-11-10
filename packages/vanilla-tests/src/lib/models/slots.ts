import { queryParts } from './events'

/*
Rendering details of a timeGrid's time axis, for tests about the slots themselves.
(For input at a time, use TimeGridModel.)
*/

/*
The text of each slot's label, in order. Minor slots (between labeled intervals) have empty text.
*/
export function getSlotLabelTexts(root: ParentNode): string[] {
  return queryParts(root, 'slotHeader').map((el) => el.textContent!)
}

/*
The labeled slots' texts, in order.
*/
export function getMajorSlotLabelTexts(root: ParentNode): string[] {
  return getSlotLabelTexts(root).filter(Boolean)
}

export function getSlotLaneEls(root: ParentNode): HTMLElement[] {
  return queryParts(root, 'slotLane')
}

/*
The viewport top of the slot that starts at the time (`HH:mm:ss`). Times repeat past midnight when
slotMaxTime is past 24h, so this is the first slot with the time.
*/
export function getSlotTop(root: ParentNode, time: string): number {
  const slotEl = getSlotLaneEls(root).find((el) => el.getAttribute('data-time') === time)

  if (!slotEl) {
    throw new Error(`No slot at ${time}`)
  }
  return slotEl.getBoundingClientRect().top
}

/*
The nearest ancestor that scrolls vertically.
*/
export function getVerticalScroller(el: Element): HTMLElement {
  for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
    const { overflowY } = getComputedStyle(ancestor)

    if (overflowY === 'auto' || overflowY === 'scroll') {
      return ancestor
    }
  }

  throw new Error('No vertical scroller')
}
