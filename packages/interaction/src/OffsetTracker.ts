import {
  getClippingParents, computeRect,
  pointInsideRect, Rect
} from '@fullcalendar/core'
import { ElementScrollGeomCache } from './scroll-geom-cache'

/*
When this class is instantiated, it records the offset of an element (relative to the document topleft),
and continues to monitor scrolling, updating the cached coordinates if it needs to.
Does not access the DOM after instantiation, so highly performant.

Also keeps track of all scrolling/overflow:hidden containers that are parents of the given element
and an determine if a given point is inside the combined clipping rectangle.
*/
export default class OffsetTracker { // ElementOffsetTracker

  scrollCaches: ElementScrollGeomCache[]
  origRect: Rect

  constructor(el: HTMLElement) {
    this.origRect = computeRect(el)

    // will work fine for divs that have overflow:hidden
    this.scrollCaches = getClippingParents(el).map(function(el) {
      return new ElementScrollGeomCache(el, true) // listen=true
    })
  }

  destroy() {
    for (let scrollCache of this.scrollCaches) {
      scrollCache.destroy()
    }
  }

  computeLeft() {
    let left = this.origRect.left

    for (let scrollCache of this.scrollCaches) {
      left += scrollCache.origScrollLeft - scrollCache.getScrollLeft()
    }

    return left
  }

  computeTop() {
    let top = this.origRect.top

    for (let scrollCache of this.scrollCaches) {
      top += scrollCache.origScrollTop - scrollCache.getScrollTop()
    }

    return top
  }

  isWithinClipping(pageX: number, pageY: number): boolean {
    let point = { left: pageX, top: pageY }

    for (let scrollCache of this.scrollCaches) {
      if (
        !isIgnoredClipping(scrollCache.getEventTarget()) &&
        !pointInsideRect(point, scrollCache.clientRect)
      ) {
        return false
      }
    }

    return true
  }

}

// certain clipping containers should never constrain interactions, like <html> and <body>
// https://github.com/fullcalendar/fullcalendar/issues/3615
function isIgnoredClipping(node: EventTarget) {
  let tagName = (node as HTMLElement).tagName

  return tagName === 'HTML' || tagName === 'BODY'
}
