import { getClippingParents, computeRect } from '../util/dom-geom'
import { pointInsideRect } from '../util/geom'
import { ElementScrollGeomCache } from '../common/scroll-geom-cache'

/*
*/
export default class OffsetTracker {

  scrollCaches: ElementScrollGeomCache[]
  origLeft: number
  origTop: number

  constructor(el: HTMLElement) {
    let rect = computeRect(el)
    this.origLeft = rect.left
    this.origTop = rect.top

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

  isWithinClipping(pageX, pageY): boolean {
    let point = { left: pageX, top: pageY }

    for (let scrollCache of this.scrollCaches) {
      if (!pointInsideRect(point, scrollCache.rect)) {
        return false
      }
    }

    return true
  }

  computeLeft() {
    let left = this.origLeft

    for (let scrollCache of this.scrollCaches) {
      left += scrollCache.getScrollLeft() - scrollCache.origScrollLeft
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

}
