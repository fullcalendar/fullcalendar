import { getClippingParents, computeRect } from '../util/dom-geom'
import { computeElIsRtl } from '../util/dom-manip'
import { pointInsideRect, type Rect } from '../util/geom'
import { ElementScrollGeomCache } from './ElementScrollGeomCache'

/*
When this class is instantiated, it records the offset of an element (relative to the document topleft),
and continues to monitor scrolling, updating the cached coordinates if it needs to.
Does not access the DOM after instantiation, so highly performant.

Also keeps track of all scrolling/overflow:hidden containers that are parents of the given element
and an determine if a given point is inside the combined clipping rectangle.
*/
export class OffsetTracker { // ElementOffsetTracker
  scrollCaches: ElementScrollGeomCache[]
  origRect: Rect
  scaleX: number
  scaleY: number
  isRtl: boolean

  constructor(public el: HTMLElement) {
    this.origRect = computeRect(el)
    this.scaleX = computeScale(this.origRect.right - this.origRect.left, el.offsetWidth)
    this.scaleY = computeScale(this.origRect.bottom - this.origRect.top, el.offsetHeight)
    this.isRtl = computeElIsRtl(el)

    // will work fine for divs that have overflow:hidden
    this.scrollCaches = getClippingParents(el).map(
      (scrollEl) => new ElementScrollGeomCache(scrollEl, true), // listen=true
    )
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

// offsetWidth and offsetHeight round fractional layout sizes to the nearest pixel.
function computeScale(visualSize: number, layoutSize: number) {
  return layoutSize && Math.round(visualSize) !== layoutSize ? visualSize / layoutSize : 1
}
