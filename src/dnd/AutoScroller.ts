import { ScrollControllerCache, ElScrollControllerCache, WindowScrollControllerCache } from '../common/scroll-geom-cache'

interface Side { // rename to Edge?
  controller: ScrollControllerCache
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
  scrollerQuery: (Window | string)[] = [ window, '.fc-scroller' ]
  edge: number = 50
  maxVelocity: number = 300 // pixels per second

  pointerScreenX: number
  pointerScreenY: number
  isAnimating: boolean = false
  everMovedUp: boolean = false
  everMovedDown: boolean = false
  everMovedLeft: boolean = false
  everMovedRight: boolean = false

  private controllers: ScrollControllerCache[] // rename to caches?
  private msSinceRequest: number

  start(pageX: number, pageY: number) {
    if (this.isEnabled) {
      this.controllers = this.buildControllers()

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

      for (let controller of this.controllers) {
        controller.destroy()
      }

      this.controllers = null
    }
  }

  requestAnimation(now) {
    this.msSinceRequest = now
    requestAnimationFrame(this.animate)
  }

  private animate = () => {
    if (this.isAnimating) { // wasn't cancelled between animation calls
      let side = this.computeBestSide(
        this.pointerScreenX + window.scrollX,
        this.pointerScreenY + window.scrollY
      )

      if (side) {
        let now = getTime()
        this.handleSide(side, (now - this.msSinceRequest) / 1000)
        this.requestAnimation(now)
      } else {
        this.isAnimating = false
      }
    }
  }

  private handleSide(side: Side, seconds: number) {
    let { controller } = side
    let { edge } = this
    let invDistance = edge - side.distance
    let velocity = (invDistance * invDistance) / (edge * edge) * this.maxVelocity * seconds // quadratic
    let sign = 1

    switch (side.name) {

      case 'left':
        sign = -1
      case 'right':
        controller.setScrollLeft(controller.getScrollLeft() + velocity * sign)
        break

      case 'top':
        sign = -1
      case 'bottom':
        controller.setScrollTop(controller.getScrollTop() + velocity * sign)
        break
    }
  }

  // left/top are relative to document topleft
  private computeBestSide(left, top): Side | null {
    let { edge } = this
    let bestSide: Side | null = null

    for (let controller of this.controllers) {
      let rect = controller.rect
      let leftDist = left - rect.left
      let rightDist = rect.right - left
      let topDist = top - rect.top
      let bottomDist = rect.bottom - top

      // completely within the rect?
      if (leftDist >= 0 && rightDist >= 0 && topDist >= 0 && bottomDist >= 0) {

        if (topDist <= edge && this.everMovedUp && controller.canScrollUp() && (!bestSide || bestSide.distance > topDist)) {
          bestSide = { controller, name: 'top', distance: topDist }
        }

        if (bottomDist <= edge && this.everMovedDown && controller.canScrollDown() && (!bestSide || bestSide.distance > bottomDist)) {
          bestSide = { controller, name: 'bottom', distance: bottomDist }
        }

        if (leftDist <= edge && this.everMovedLeft && controller.canScrollLeft() && (!bestSide || bestSide.distance > leftDist)) {
          bestSide = { controller, name: 'left', distance: leftDist }
        }

        if (rightDist <= edge && this.everMovedRight && controller.canScrollRight() && (!bestSide || bestSide.distance > rightDist)) {
          bestSide = { controller, name: 'right', distance: rightDist }
        }
      }
    }

    return bestSide
  }

  private buildControllers() {
    return this.queryScrollerEls().map((el) => {
      if (el === window) {
        return new WindowScrollControllerCache(false) // don't listen to user-generated scrolls
      } else {
        return new ElScrollControllerCache(el, false) // don't listen to user-generated scrolls
      }
    })
  }

  private queryScrollerEls() {
    let els = []

    for (let query of this.scrollerQuery) {
      if (typeof query === 'object') {
        els.push(query)
      } else {
        els.push(...Array.prototype.slice.call(document.querySelectorAll(query)))
      }
    }

    return els
  }

}
