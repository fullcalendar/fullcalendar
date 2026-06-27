import { Emitter } from "../common/Emitter"
import { DelayedRunner } from "../util/DelayedRunner"

/*
NOTE: detection is complicated (w/ touch and wheel) because ScrollerSyncer needs to know about it,
but are we sure we can't just ignore programmatic scrollTo() calls with a flag? and determine the
the scroll-master simply by who was the newest scroller? Does passive:true do things asynchronously?
*/
export class ScrollListener {
  public emitter: Emitter<{
    scrollStart: (isDevice: boolean) => void
    scroll: (isDevice: boolean) => void
    scrollEnd: (isDevice: boolean) => void
  }> = new Emitter()

  private wheelWaiter: DelayedRunner
  private scrollWaiter: DelayedRunner

  private isScroll = false
  private isScrollRecent = false
  private isWheelRecent = false
  private isMouseDown = false // user currently has mouse down?
  private isTouchDown = false // user currently has finger down?

  // accumulated during scroll
  private isMouse = false
  private isTouch = false
  private isWheel = false

  constructor(public el: HTMLElement) {
    this.wheelWaiter = new DelayedRunner(this.handleWheelWait)
    this.scrollWaiter = new DelayedRunner(this.handleScrollWait)

    el.addEventListener('scroll', this.handleScroll, { passive: true })
    el.addEventListener('wheel', this.handleWheel, { passive: true })
    el.addEventListener('mousedown', this.handleMouseDown)
    el.addEventListener('mouseup', this.handleMouseUp)
    el.addEventListener('touchstart', this.handleTouchStart, { passive: true })
    el.addEventListener('touchend', this.handleTouchEnd)
  }

  destroy() {
    let { el } = this

    el.removeEventListener('scroll', this.handleScroll, { passive: true } as AddEventListenerOptions)
    el.removeEventListener('wheel', this.handleWheel, { passive: true } as AddEventListenerOptions)
    el.removeEventListener('mousedown', this.handleMouseDown)
    el.removeEventListener('mouseup', this.handleMouseUp)
    el.removeEventListener('touchstart', this.handleTouchStart, { passive: true } as AddEventListenerOptions)
    el.removeEventListener('touchend', this.handleTouchEnd)
  }

  // Start / Stop
  // ----------------------------------------------------------------------------------------------

  private startScroll() {
    if (!this.isScroll) {
      this.isScroll = true
      this.emitter.trigger('scrollStart', this.getIsDevice())
    }
  }

  endScroll() {
    if (this.isScroll) { // extra protection because might be called publicly
      this.scrollWaiter.clear() // (same)
      this.wheelWaiter.clear() // (same)

      this.isScroll = false
      this.isWheelRecent = false
      this.emitter.trigger('scrollEnd', this.getIsDevice())
      this.isMouse = false
      this.isTouch = false
      this.isWheel = false
    }
  }

  private getIsDevice() {
    return this.isWheel || this.isMouse || this.isTouch
  }

  // Handlers
  // ----------------------------------------------------------------------------------------------

  private handleScroll = () => {
    this.isScrollRecent = true

    if (this.isMouseDown) {
      this.isMouse = true
    }
    if (this.isTouchDown) {
      this.isTouch = true
    }
    if (this.isWheelRecent) {
      this.isWheel = true
    }

    this.startScroll()
    this.emitter.trigger('scroll', this.getIsDevice())
    this.scrollWaiter.request(500)
  }

  private handleScrollWait = () => {
    this.isScrollRecent = false

    // only end the scroll if not currently touching.
    // if touching, the scrolling will end later, on touchend.
    if (!this.isTouchDown) {
      this.endScroll()
    }
  }

  // will fire *before* the scroll event is fired (might not cause a scroll!)
  private handleWheel = () => {
    this.isWheelRecent = true
    this.wheelWaiter.request(500)
  }

  private handleWheelWait = () => {
    this.isWheelRecent = false
  }

  private handleMouseDown = () => {
    this.isMouseDown = true
  }

  private handleMouseUp = () => {
    this.isMouseDown = false
  }

  // will fire *before* the scroll event is fired (might not cause a scroll!)
  private handleTouchStart = () => {
    this.isTouchDown = true
  }

  private handleTouchEnd = () => {
    this.isTouchDown = false

    // if the user ended their touch, and the scroll area wasn't moving,
    // we consider this to be the end of the scroll
    // otherwise, wait for inertia to finish and handleScrollWait to fire
    if (!this.isScrollRecent) {
      this.endScroll()
    }
  }
}
