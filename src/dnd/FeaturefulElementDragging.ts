import { default as PointerDragging, PointerDragEvent } from './PointerDragging'
import { preventSelection, allowSelection, preventContextMenu, allowContextMenu } from '../util/misc'
import ElementMirror from './ElementMirror'
import ElementDragging from './ElementDragging'

/*
Monitors dragging on an element. Has a number of high-level features:
- minimum distance required before dragging
- minimum wait time ("delay") before dragging
- a mirror element that follows the pointer
*/
export default class FeaturefulElementDragging extends ElementDragging {

  pointer: PointerDragging
  mirror: ElementMirror
  mirrorNeedsRevert: boolean = false

  // options that can be directly set by caller
  // the caller can also set the PointerDragging's options as well
  delay: number
  minDistance: number = 0
  touchScrollAllowed: boolean = true

  isWatchingPointer: boolean = false
  isDragging: boolean = false // is it INTENTFULLY dragging? lasts until after revert animation
  isDelayEnded: boolean = false
  isDistanceSurpassed: boolean = false
  delayTimeoutId: number
  origX: number
  origY: number

  constructor(containerEl: HTMLElement) {
    super()

    let pointer = this.pointer = new PointerDragging(containerEl)
    pointer.emitter.on('pointerdown', this.onPointerDown)
    pointer.emitter.on('pointermove', this.onPointerMove)
    pointer.emitter.on('pointerup', this.onPointerUp)

    this.mirror = new ElementMirror()
  }

  destroy() {
    this.pointer.destroy()
  }

  onPointerDown = (ev: PointerDragEvent) => {
    if (!this.isDragging) { // mainly so new drag doesn't happen while revert animation is going
      this.isWatchingPointer = true
      this.isDelayEnded = false
      this.isDistanceSurpassed = false

      preventSelection(document.body)
      preventContextMenu(document.body)

      this.origX = ev.pageX
      this.origY = ev.pageY

      this.emitter.trigger('pointerdown', ev)
      this.mirror.start(ev.subjectEl, ev.pageX, ev.pageY)

      // if moving is being ignored, don't fire any initial drag events
      if (!this.pointer.shouldIgnoreMove) {
        // actions that could fire dragstart...

        this.startDelay(ev)

        if (!this.minDistance) {
          this.handleDistanceSurpassed(ev)
        }
      }
    }
  }

  onPointerMove = (ev: PointerDragEvent) => {
    if (this.isWatchingPointer) { // if false, still waiting for previous drag's revert
      this.emitter.trigger('pointermove', ev)
      this.mirror.handleMove(ev.pageX, ev.pageY)

      if (!this.isDistanceSurpassed) {
        let dx = ev.pageX - this.origX
        let dy = ev.pageY - this.origY
        let minDistance = this.minDistance
        let distanceSq // current distance from the origin, squared

        distanceSq = dx * dx + dy * dy
        if (distanceSq >= minDistance * minDistance) { // use pythagorean theorem
          this.handleDistanceSurpassed(ev)
        }
      }

      if (this.isDragging) {
        this.emitter.trigger('dragmove', ev)
      }
    }
  }

  onPointerUp = (ev: PointerDragEvent) => {
    if (this.isWatchingPointer) { // if false, still waiting for previous drag's revert
      this.isWatchingPointer = false

      this.emitter.trigger('pointerup', ev) // can potentially set mirrorNeedsRevert

      if (this.isDragging) {
        this.tryStopDrag(ev)
      }

      allowSelection(document.body)
      allowContextMenu(document.body)

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
      }, this.delay)
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

}
