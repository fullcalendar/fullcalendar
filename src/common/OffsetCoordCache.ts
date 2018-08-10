import { getClippingParents, computeRect } from '../util/dom-geom'
import { pointInsideRect } from '../util/geom'
import { ElScrollControllerCache, ElScrollController } from '../dnd/scroll'

export default class OffsetCoordCache { // TODO: rename to OffsetTracker?

  scrollCaches: ElScrollControllerCache[]
  originOffsetLeft: number
  originOffsetTop: number

  constructor(el: HTMLElement) {
    let rect = computeRect(el)
    this.originOffsetLeft = rect.left
    this.originOffsetTop = rect.top

    this.scrollCaches = getClippingParents(el).map(function(el) {
      return new ElScrollControllerCache(
        new ElScrollController(el),
        true // listens to element for scrolling
      )
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

  getLeftAdjust() {
    let left = this.originOffsetLeft

    for (let scrollCache of this.scrollCaches) {
      left += scrollCache.scrollLeft - scrollCache.origScrollLeft
    }

    return left
  }

  getTopAdjust() {
    let top = this.originOffsetTop

    for (let scrollCache of this.scrollCaches) {
      top += scrollCache.origScrollTop - scrollCache.scrollTop
    }

    return top
  }

}
