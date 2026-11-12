/*
Scrolls the element's scrollable ancestors (and the window) along ONE axis, just enough to show the
element ("nearest"). Unlike scrollIntoView, it never scrolls the other axis, so a coordinate measured
on that axis stays valid. That matters for elements longer than their scroller, like a timeline's
full-width resource lane or full-height slot.
*/
export function scrollIntoViewOnAxis(el: Element, axis: 'x' | 'y'): void {
  for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor)
    const overflow = axis === 'x' ? style.overflowX : style.overflowY
    const isScrollable = (overflow === 'auto' || overflow === 'scroll') && (
      axis === 'x'
        ? ancestor.scrollWidth > ancestor.clientWidth
        : ancestor.scrollHeight > ancestor.clientHeight
    )

    if (isScrollable) {
      const elRect = el.getBoundingClientRect()
      const boxRect = ancestor.getBoundingClientRect()
      const boxStart = axis === 'x' ? boxRect.left + ancestor.clientLeft : boxRect.top + ancestor.clientTop
      const boxEnd = boxStart + (axis === 'x' ? ancestor.clientWidth : ancestor.clientHeight)
      const delta = getNearestDelta(
        axis === 'x' ? elRect.left : elRect.top,
        axis === 'x' ? elRect.right : elRect.bottom,
        boxStart,
        boxEnd,
      )

      if (axis === 'x') {
        ancestor.scrollLeft += delta
      } else {
        ancestor.scrollTop += delta
      }
    }
  }

  const elRect = el.getBoundingClientRect()
  const delta = axis === 'x'
    ? getNearestDelta(elRect.left, elRect.right, 0, window.innerWidth)
    : getNearestDelta(elRect.top, elRect.bottom, 0, window.innerHeight)

  if (delta) {
    window.scrollBy(axis === 'x' ? delta : 0, axis === 'y' ? delta : 0)
  }
}

/*
How far to scroll so [start, end] is within [boxStart, boxEnd]. When it can't fit, aligns its start.
*/
function getNearestDelta(start: number, end: number, boxStart: number, boxEnd: number): number {
  if (start >= boxStart && end <= boxEnd) {
    return 0
  }
  if (start < boxStart || end - start > boxEnd - boxStart) {
    return start - boxStart
  }
  return end - boxEnd
}
