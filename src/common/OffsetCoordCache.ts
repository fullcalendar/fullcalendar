import CoordCache from './CoordCache'
import { computeInnerRect, getScrollParent, computeRect } from '../util/dom-geom'
import { Rect, pointInsideRect } from '../util/geom'

export default class OffsetCoordCache {

  coordCache: CoordCache
  boundingRect: Rect
  originOffsetLeft: number
  originOffsetTop: number

  constructor(coordCache: CoordCache) {
    this.coordCache = coordCache

    let scrollParent = getScrollParent(coordCache.originEl)
    this.boundingRect = scrollParent ? computeInnerRect(scrollParent) : null

    let rect = computeRect(coordCache.originEl)
    this.originOffsetLeft = rect.left
    this.originOffsetTop = rect.top
  }

  destroy() {
    // console.log('OffsetCoordCache::destroy')
  }

  isInBounds(pageX, pageY): boolean {
    return !this.boundingRect || pointInsideRect({ left: pageX, top: pageY }, this.boundingRect)
  }

  leftOffsetToIndex(leftOffset): number {
    return this.coordCache.leftPositionToIndex(leftOffset - this.originOffsetLeft)
  }

  topOffsetToIndex(topOffset): number {
    return this.coordCache.topPositionToIndex(topOffset - this.originOffsetTop)
  }

  indexToLeftOffset(index): number {
    return this.coordCache.indexToLeftPosition(index) + this.originOffsetLeft
  }

  indexToTopOffset(index): number {
    return this.coordCache.indexToTopPosition(index) + this.originOffsetTop
  }

  indexToRightOffset(index): number {
    return this.coordCache.indexToRightPosition(index) + this.originOffsetLeft
  }

  indexToBottomOffset(index): number {
    return this.coordCache.indexToBottomPosition(index) + this.originOffsetTop
  }

}
