import { PointerDragEvent, preventSelection, allowSelection, preventContextMenu, allowContextMenu, ElementDragging } from '@fullcalendar/core'
import PointerDragging from './PointerDragging'
import ElementMirror from './ElementMirror'
import AutoScroller from './AutoScroller'

/*
Monitors dragging on an element. Has a number of high-level features:
- minimum distance required before dragging
- minimum wait time ("delay") before dragging
- a mirror element that follows the pointer
*/
export default class FeaturefulElementDragging extends ElementDragging {

  pointer: PointerDragging
  mirror: ElementMirror
  autoScroller: AutoScroller

  // options that can be directly set by caller
  // the caller can also set the PointerDragging's options as well
  delay: number | null = null
  minDistance: number = 0
  touchScrollAllowed: boolean = true // prevents drag from starting and blocks scrolling during drag

  mirrorNeedsRevert: boolean = false
  isInteracting: boolean = false // is the user validly moving the pointer? lasts until pointerup
  isDragging: boolean = false // is it INTENTFULLY dragging? lasts until after revert animation
  isDelayEnded: boolean = false
  isDistanceSurpassed: boolean = false
  delayTimeoutId: number | null = null


  constructor(containerEl: HTMLElement) {
    super(containerEl)

    let pointer = this.pointer = new PointerDragging(containerEl)
    pointer.emitter.on('pointerdown', this.onPointerDown)
    pointer.emitter.on('pointermove', this.onPointerMove)
    pointer.emitter.on('pointerup', this.onPointerUp)

    this.mirror = new ElementMirror()
    this.autoScroller = new AutoScroller()
  }

  destroy() {
    this.pointer.destroy()
  }

  onPointerDown = (ev: PointerDragEvent) => {
    if (!this.isDragging) { // so new drag doesn't happen while revert animation is going

      this.isInteracting = true
      this.isDelayEnded = false
      this.isDistanceSurpassed = false

      preventSelection(document.body)
      preventContextMenu(document.body)

      // prevent links from being visited if there's an eventual drag.
      // also prevents selection in older browsers (maybe?).
      // not necessary for touch, besides, browser would complain about passiveness.
      if (!ev.isTouch) {
        ev.origEvent.preventDefault()
      }

      this.emitter.trigger('pointerdown', ev)

      if (!this.pointer.shouldIgnoreMove) {
        // actions related to initiating dragstart+dragmove+dragend...

        this.mirror.setIsVisible(false) // reset. caller must set-visible
        this.mirror.start(ev.subjectEl as HTMLElement, ev.pageX, ev.pageY) // must happen on first pointer down

        this.startDelay(ev)

        if (!this.minDistance) {
          this.handleDistanceSurpassed(ev)
        }
      }
    }
  }

  onPointerMove = (ev: PointerDragEvent) => {
    if (this.isInteracting) { // if false, still waiting for previous drag's revert

      this.emitter.trigger('pointermove', ev)

      if (!this.isDistanceSurpassed) {
        let minDistance = this.minDistance
        let distanceSq // current distance from the origin, squared
        let { deltaX, deltaY } = ev

        distanceSq = deltaX * deltaX + deltaY * deltaY
        if (distanceSq >= minDistance * minDistance) { // use pythagorean theorem
          this.handleDistanceSurpassed(ev)
        }
      }

      if (this.isDragging) {

        // a real pointer move? (not one simulated by scrolling)
        if (ev.origEvent.type !== 'scroll') {
          this.mirror.handleMove(ev.pageX, ev.pageY)
          this.autoScroller.handleMove(ev.pageX, ev.pageY)
        }

        this.emitter.trigger('dragmove', ev)
      }
    }
  }

  onPointerUp = (ev: PointerDragEvent) => {
    if (this.isInteracting) { // if false, still waiting for previous drag's revert
      this.isInteracting = false

      allowSelection(document.body)
      allowContextMenu(document.body)

      this.emitter.trigger('pointerup', ev) // can potentially set mirrorNeedsRevert

      if (this.isDragging) {
        this.autoScroller.stop()
        this.tryStopDrag(ev) // which will stop the mirror
      }

      if (this.delayTimeoutId) {
        clearTimeout(this.delayTimeoutId)
        this.delayTimeoutId = null
      }
    }
  }

  startDelay(ev: PointerDragEvent) {
    if (typeof this.delay === 'number') {
      this.delayTimeoutId = setTimeout(() => {
        this.delayTimeoutId = null
        this.handleDelayEnd(ev)
      }, this.delay) as any // not assignable to number!
    } else {
      this.handleDelayEnd(ev)
    }
  }

  handleDelayEnd(ev: PointerDragEvent) {
    this.isDelayEnded = true
    this.tryStartDrag(ev)
  }

  handleDistanceSurpassed(ev: PointerDragEvent) {
    this.isDistanceSurpassed = true
    this.tryStartDrag(ev)
  }

  tryStartDrag(ev: PointerDragEvent) {
    if (this.isDelayEnded && this.isDistanceSurpassed) {
      if (!this.pointer.wasTouchScroll || this.touchScrollAllowed) {
        this.isDragging = true
        this.mirrorNeedsRevert = false

        this.autoScroller.start(ev.pageX, ev.pageY)
        this.emitter.trigger('dragstart', ev)

        if (this.touchScrollAllowed === false) {
          this.pointer.cancelTouchScroll()
        }
      }
    }
  }

  tryStopDrag(ev: PointerDragEvent) {
    // .stop() is ALWAYS asynchronous, which we NEED because we want all pointerup events
    // that come from the document to fire beforehand. much more convenient this way.
    this.mirror.stop(
      this.mirrorNeedsRevert,
      this.stopDrag.bind(this, ev) // bound with args
    )
  }

  stopDrag(ev: PointerDragEvent) {
    this.isDragging = false
    this.emitter.trigger('dragend', ev)
  }

  // fill in the implementations...

  setIgnoreMove(bool: boolean) {
    this.pointer.shouldIgnoreMove = bool
  }

  setMirrorIsVisible(bool: boolean) {
    this.mirror.setIsVisible(bool)
  }

  setMirrorNeedsRevert(bool: boolean) {
    this.mirrorNeedsRevert = bool
  }

  setAutoScrollEnabled(bool: boolean) {
    this.autoScroller.isEnabled = bool
  }

}
