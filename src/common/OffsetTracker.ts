import { getClippingParents, computeRect } from '../util/dom-geom'
import { pointInsideRect } from '../util/geom'
import { ElementScrollGeomCache } from '../common/scroll-geom-cache'

/*
When this class is instantiated, it records the offset of an element (relative to the document topleft),
and continues to monitor scrolling, updating the cached coordinates if it needs to.
Does not access the DOM after instantiation, so highly performant.

Also keeps track of all scrolling/overflow:hidden containers that are parents of the given element
and an determine if a given point is inside the combined clipping rectangle.
*/
export default class OffsetTracker { // ElementOffsetTracker

  scrollCaches: ElementScrollGeomCache[]
  origLeft: number
  origTop: number
  origRight: number
  origBottom: number // TODO: use rect?

  constructor(el: HTMLElement) {
    let rect = computeRect(el)
    this.origLeft = rect.left
    this.origTop = rect.top
    this.origRight = rect.right
    this.origBottom = rect.bottom

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
    let left = this.origLeft

    for (let scrollCache of this.scrollCaches) {
      left += scrollCache.origScrollLeft - scrollCache.getScrollLeft()
    }

    return left
  }

  computeTop() {
    let top = this.origTop

    for (let scrollCache of this.scrollCaches) {
      top += scrollCache.origScrollTop - scrollCache.getScrollTop()
    }

    return top
  }

  isWithinClipping(pageX: number, pageY: number): boolean {
    let point = { left: pageX, top: pageY }

    for (let scrollCache of this.scrollCaches) {
      if (!pointInsideRect(point, scrollCache.clientRect)) {
        return false
      }
    }

    return true
  }

}
