import { getEventEls, isElVisible, queryPart, queryParts } from './events'

/*
The time text and title of an event element rendered with the default content. The time element
is only rendered when there's time text.
*/
export function getEventTexts(eventEl: HTMLElement): { time: string, title: string } {
  const timeEl = queryPart(eventEl, 'eventTime')
  const titleEl = queryPart(eventEl, 'eventTitle')

  if (!titleEl) {
    throw new Error('Event element has no title part. Is it rendered with custom content?')
  }

  return {
    time: timeEl ? timeEl.textContent! : '',
    title: titleEl.textContent!.trim(), // an untitled event renders a non-breaking space
  }
}

export function getEventTimeTexts(eventEls: HTMLElement[]): string[] {
  return eventEls.map((el) => getEventTexts(el).time)
}

export function getEventTitles(eventEls: HTMLElement[]): string[] {
  return eventEls.map((el) => getEventTexts(el).title)
}

/*
Visible foreground event elements, in document order. Excludes mirrors and events a more-link hides.
*/
export function getVisibleEventEls(root: ParentNode): HTMLElement[] {
  return getEventEls(root).filter(isElVisible)
}

export function getBgEventEls(root: ParentNode): HTMLElement[] {
  return queryParts(root, 'backgroundEvent')
}

/*
Visible more-links. (Views also render hidden, offscreen more-links for measuring.)
*/
export function getMoreLinkEls(root: ParentNode): HTMLElement[] {
  return queryParts(root, 'moreLink').filter(isElVisible)
}

/*
The dates of the day cells an element (an event segment, a more-link, a background event) covers
horizontally, within its own row of days. Works in either direction: dates come out in date order.
*/
export function getCoveredDates(el: HTMLElement): string[] {
  const rowEl = el.closest<HTMLElement>('.test-part-dayRow')

  if (!rowEl) {
    throw new Error('Element isn\'t in a row of days')
  }

  const rect = el.getBoundingClientRect()

  return queryParts(rowEl, 'dayCell')
    .filter((cellEl) => {
      const cellRect = cellEl.getBoundingClientRect()
      return Math.min(rect.right, cellRect.right) - Math.max(rect.left, cellRect.left) > 1
    })
    .map((cellEl) => cellEl.getAttribute('data-date')!)
    .sort()
}

/*
The date of the day cell (dayGrid) or day lane (timeGrid) that contains the element.
*/
export function getContainingDate(el: HTMLElement): string {
  const dayEl = el.closest('.test-part-dayCell, .test-part-dayLane')
  const date = dayEl && dayEl.getAttribute('data-date')

  if (!date) {
    throw new Error('Element isn\'t in a dated day cell or lane')
  }
  return date
}

/*
The first pair of elements whose rectangles overlap (by more than a rounding error), or null.
*/
export function findOverlappingEls(els: HTMLElement[]): [HTMLElement, HTMLElement] | null {
  const rects = els.map((el) => el.getBoundingClientRect())

  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      if (
        Math.min(rects[i].right, rects[j].right) - Math.max(rects[i].left, rects[j].left) > 0.5 &&
        Math.min(rects[i].bottom, rects[j].bottom) - Math.max(rects[i].top, rects[j].top) > 0.5
      ) {
        return [els[i], els[j]]
      }
    }
  }

  return null
}

/*
The first pair where one element's rectangle fully contains the other's, or null. Overlapping
timeGrid events (slotEventOverlap) partly cover each other, but none should hide another entirely.
*/
export function findObscuredEls(els: HTMLElement[]): [HTMLElement, HTMLElement] | null {
  const rects = els.map((el) => el.getBoundingClientRect())

  for (let i = 0; i < rects.length; i++) {
    for (let j = 0; j < rects.length; j++) {
      if (
        i !== j &&
        rects[j].left >= rects[i].left && rects[j].right <= rects[i].right &&
        rects[j].top >= rects[i].top && rects[j].bottom <= rects[i].bottom
      ) {
        return [els[i], els[j]]
      }
    }
  }

  return null
}

/*
The top of the timeGrid slot that starts at the time (ex: '01:00:00').
*/
export function getSlotTop(root: ParentNode, time: string): number {
  const slotEl = queryParts(root, 'slotLane').find((el) => el.getAttribute('data-time') === time)

  if (!slotEl) {
    throw new Error(`No slot starting at ${time}`)
  }
  return slotEl.getBoundingClientRect().top
}

/*
The vertical span in a timeGrid that an event element should occupy, from the start of slot
`startSlot` to the end of slot `endSlot - 1` (slot indexes count from slotMinTime). Slots are
identified by index because data-time repeats when slotMinTime/slotMaxTime cross midnight.
*/
export function getSlotSpan(root: ParentNode, startSlot: number, endSlot: number): { top: number, bottom: number } {
  const slotEls = queryParts(root, 'slotLane')
  return {
    top: slotEls[startSlot].getBoundingClientRect().top,
    bottom: slotEls[endSlot - 1].getBoundingClientRect().bottom,
  }
}
