import { ScrollGeomCache, ElementScrollGeomCache, WindowScrollGeomCache } from '../common/scroll-geom-cache'

interface Edge {
  scrollCache: ScrollGeomCache
  name: 'top' | 'left' | 'right' | 'bottom'
  distance: number
}

// If available we are using native "performance" API instead of "Date"
// Read more about it on MDN:
// https://developer.mozilla.org/en-US/docs/Web/API/Performance
const getTime = typeof performance === 'function' ? (performance as any).now : Date.now

export default class AutoScroller {

  // options that can be set by caller
  isEnabled: boolean = true
  scrollQuery: (Window | string)[] = [ window, '.fc-scroller' ]
  edgeThreshold: number = 50 // pixels
  maxVelocity: number = 300 // pixels per second

  // internal state
  pointerScreenX: number
  pointerScreenY: number
  isAnimating: boolean = false
  everMovedUp: boolean = false
  everMovedDown: boolean = false
  everMovedLeft: boolean = false
  everMovedRight: boolean = false
  scrollCaches: ScrollGeomCache[]
  msSinceRequest: number

  start(pageX: number, pageY: number) {
    if (this.isEnabled) {
      this.scrollCaches = this.buildCaches()

      this.pointerScreenX = null
      this.pointerScreenY = null
      this.everMovedUp = false
      this.everMovedDown = false
      this.everMovedLeft = false
      this.everMovedRight = false

      this.handleMove(pageX, pageY)
    }
  }

  handleMove(pageX: number, pageY: number) {
    if (this.isEnabled) {
      let pointerScreenX = pageX - window.scrollX //this.windowController.getScrollLeft() // audit all ordering
      let pointerScreenY = pageY - window.scrollY // this.windowController.getScrollTop()

      let yDelta = this.pointerScreenY === null ? 0 : pointerScreenY - this.pointerScreenY
      let xDelta = this.pointerScreenX === null ? 0 : pointerScreenX - this.pointerScreenX

      if (yDelta < 0) { this.everMovedUp = true }
      else if (yDelta > 0) { this.everMovedDown = true }

      if (xDelta < 0) { this.everMovedLeft = true }
      else if (yDelta > 0) { this.everMovedRight = true }

      this.pointerScreenX = pointerScreenX
      this.pointerScreenY = pointerScreenY

      if (!this.isAnimating) {
        this.isAnimating = true
        this.requestAnimation(getTime())
      }
    }
  }

  stop() {
    if (this.isEnabled) {
      this.isAnimating = false

      for (let scrollCache of this.scrollCaches) {
        scrollCache.destroy()
      }

      this.scrollCaches = null
    }
  }

  requestAnimation(now) {
    this.msSinceRequest = now
    requestAnimationFrame(this.animate)
  }

  private animate = () => {
    if (this.isAnimating) { // wasn't cancelled between animation calls
      let edge = this.computeBestEdge(
        this.pointerScreenX + window.scrollX,
        this.pointerScreenY + window.scrollY
      )

      if (edge) {
        let now = getTime()
        this.handleSide(edge, (now - this.msSinceRequest) / 1000)
        this.requestAnimation(now)
      } else {
        this.isAnimating = false
      }
    }
  }

  private handleSide(edge: Edge, seconds: number) {
    let { scrollCache } = edge
    let { edgeThreshold } = this
    let invDistance = edgeThreshold - edge.distance
    let velocity =
      (invDistance * invDistance) / (edgeThreshold * edgeThreshold) * // quadratic
      this.maxVelocity * seconds
    let sign = 1

    switch (edge.name) {

      case 'left':
        sign = -1
      case 'right':
        scrollCache.setScrollLeft(scrollCache.getScrollLeft() + velocity * sign)
        break

      case 'top':
        sign = -1
      case 'bottom':
        scrollCache.setScrollTop(scrollCache.getScrollTop() + velocity * sign)
        break
    }
  }

  // left/top are relative to document topleft
  private computeBestEdge(left, top): Edge | null {
    let { edgeThreshold } = this
    let bestSide: Edge | null = null

    for (let scrollCache of this.scrollCaches) {
      let rect = scrollCache.clientRect
      let leftDist = left - rect.left
      let rightDist = rect.right - left
      let topDist = top - rect.top
      let bottomDist = rect.bottom - top

      // completely within the rect?
      if (leftDist >= 0 && rightDist >= 0 && topDist >= 0 && bottomDist >= 0) {

        if (
          topDist <= edgeThreshold && this.everMovedUp && scrollCache.canScrollUp() &&
          (!bestSide || bestSide.distance > topDist)
        ) {
          bestSide = { scrollCache, name: 'top', distance: topDist }
        }

        if (
          bottomDist <= edgeThreshold && this.everMovedDown && scrollCache.canScrollDown() &&
          (!bestSide || bestSide.distance > bottomDist)
        ) {
          bestSide = { scrollCache, name: 'bottom', distance: bottomDist }
        }

        if (
          leftDist <= edgeThreshold && this.everMovedLeft && scrollCache.canScrollLeft() &&
          (!bestSide || bestSide.distance > leftDist)
        ) {
          bestSide = { scrollCache, name: 'left', distance: leftDist }
        }

        if (
          rightDist <= edgeThreshold && this.everMovedRight && scrollCache.canScrollRight() &&
          (!bestSide || bestSide.distance > rightDist)
        ) {
          bestSide = { scrollCache, name: 'right', distance: rightDist }
        }
      }
    }

    return bestSide
  }

  private buildCaches() {
    return this.queryScrollEls().map((el) => {
      if (el === window) {
        return new WindowScrollGeomCache(false) // false = don't listen to user-generated scrolls
      } else {
        return new ElementScrollGeomCache(el, false) // false = don't listen to user-generated scrolls
      }
    })
  }

  private queryScrollEls() {
    let els = []

    for (let query of this.scrollQuery) {
      if (typeof query === 'object') {
        els.push(query)
      } else {
        els.push(...Array.prototype.slice.call(document.querySelectorAll(query)))
      }
    }

    return els
  }

}
