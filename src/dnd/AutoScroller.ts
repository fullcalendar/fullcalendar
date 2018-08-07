import { ScrollControllerCache, ElScrollControllerCache, ElScrollController, WindowScrollControllerCache } from './scroll'

interface Side { // rename to Edge?
  controller: ScrollControllerCache
  name: 'top' | 'left' | 'right' | 'bottom'
  distance: number
}

// If available we are using native "performance" API instead of "Date"
// Read more about it on MDN:
// https://developer.mozilla.org/en-US/docs/Web/API/Performance
const getTime = typeof performance === 'function' ? (performance as any).now : Date.now

let uid = 0

export default class AutoScroller {

  id: string

  constructor() {
    this.id = String(uid++)
  }

  // options that can be set by caller
  scrollerQuery: (Window | string)[] = [ window, '.fc-scroller' ]
  edge: number = 50
  maxSpeed: number = 300 // pixels per second
  isAnimating: boolean = false
  pointerScreenX: number
  pointerScreenY: number

  private windowController: WindowScrollControllerCache
  private controllers: ScrollControllerCache[] // rename to caches?
  private msSinceRequest: number

  start(pageX: number, pageY: number, windowController: WindowScrollControllerCache) { // TODO: pass windowscrollcontrollercache
    this.windowController = windowController
    this.controllers = this.buildControllers()
    this.handleMove(pageX, pageY)
  }

  handleMove(pageX: number, pageY: number) {
    this.pointerScreenX = pageX - this.windowController.getScrollLeft() // audit all ordering
    this.pointerScreenY = pageY - this.windowController.getScrollTop()

    if (!this.isAnimating) {
      this.isAnimating = true
      this.requestAnimation(getTime())
    }
  }

  stop() {
    this.isAnimating = false // will stop animation

    for (let controller of this.controllers) {
      if (controller !== this.windowController) { // because window controller isnt our responsbility. TODO: rethink
        controller.destroy()
      }
    }
    this.controllers = null

    this.windowController = null
  }

  requestAnimation(now) {
    this.msSinceRequest = now
    requestAnimationFrame(this.animate)
  }

  private animate = () => {
    if (this.isAnimating) { // wasn't cancelled
      let side = this.computeBestSide(
        this.pointerScreenX + this.windowController.getScrollLeft(),
        this.pointerScreenY + this.windowController.getScrollTop()
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
    let { edge } = this
    let { controller } = side
    let invEdge = edge - side.distance
    let speed = ((invEdge * invEdge) / (edge * edge)) * // quadratic
      this.maxSpeed * seconds

    switch (side.name) {

      case 'left':
        controller.setScrollLeft(controller.getScrollLeft() - speed)
        break

      case 'right':
        controller.setScrollLeft(controller.getScrollLeft() + speed)
        break

      case 'top':
        controller.setScrollTop(controller.getScrollTop() - speed)
        break

      case 'bottom':
        controller.setScrollTop(controller.getScrollTop() + speed)
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

        if (topDist <= edge && controller.canScrollUp() && (!bestSide || bestSide.distance > topDist)) {
          bestSide = { controller, name: 'top', distance: topDist }
        }

        if (bottomDist <= edge && controller.canScrollDown() && (!bestSide || bestSide.distance > bottomDist)) {
          bestSide = { controller, name: 'bottom', distance: bottomDist }
        }

        if (leftDist <= edge && controller.canScrollLeft() && (!bestSide || bestSide.distance > leftDist)) {
          bestSide = { controller, name: 'left', distance: leftDist }
        }

        if (rightDist <= edge && controller.canScrollRight() && (!bestSide || bestSide.distance > rightDist)) {
          bestSide = { controller, name: 'right', distance: rightDist }
        }
      }
    }

    return bestSide
  }

  private buildControllers() {
    return this.queryScrollerEls().map((el) => {
      if (el === window) {
        return this.windowController
      } else {
        return new ElScrollControllerCache(new ElScrollController(el as HTMLElement))
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
