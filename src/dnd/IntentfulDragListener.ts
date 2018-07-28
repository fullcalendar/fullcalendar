import { default as EmitterMixin } from '../common/EmitterMixin'
import { default as PointerDragListener, PointerDragEvent } from './PointerDragListener'
import { preventSelection, allowSelection, preventContextMenu, allowContextMenu } from '../util/misc'
import DragMirror from './DragMirror'

/* needs events:
- pointerdown
- dragstart
- dragmove
- pointerup
- dragend
*/
export interface IntentfulDragListener {
  isDragging: boolean
  on(evName: string, callback: (ev: PointerDragEvent) => void)
  setMirrorNeedsRevert(bool: boolean)
  enableMirror()
  disableMirror()
  setIgnoreMove(bool: boolean)
  destroy()
}

/*
fires:
- pointerdown
- dragstart
- dragmove
- pointermove
- pointerup (always happens before dragend!)
- dragend (happens after any revert animation)
*/
export class IntentfulDragListenerImpl implements IntentfulDragListener {

  pointerListener: PointerDragListener
  emitter: EmitterMixin
  dragMirror: DragMirror // TODO: move out of here?

  // options
  delay: number
  minDistance: number = 0
  touchScrollAllowed: boolean = true

  isWatchingPointer: boolean = false
  isDragging: boolean = false // is it INTENTFULLY dragging? lasts until after revert animation // TODO: exclude revert anim?
  isDelayEnded: boolean = false
  isDistanceSurpassed: boolean = false

  delayTimeoutId: number
  origX: number
  origY: number

  constructor(containerEl: HTMLElement) {
    this.emitter = new EmitterMixin()
    this.dragMirror = new DragMirror(this)

    let pointerListener = this.pointerListener = new PointerDragListener(containerEl)
    pointerListener.on('pointerdown', this.onPointerDown)
    pointerListener.on('pointermove', this.onPointerMove)
    pointerListener.on('pointerup', this.onPointerUp)
  }

  destroy() {
    this.pointerListener.destroy()
  }

  on(name, handler) {
    this.emitter.on(name, handler)
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

      // if moving is being ignored, don't fire any initial drag events
      if (!this.pointerListener.ignoreMove) {
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

      this.emitter.trigger('pointerup', ev) // can potentially set needsRevert

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
      if (!this.pointerListener.isTouchScroll || this.touchScrollAllowed) {
        this.isDragging = true
        this.emitter.trigger('dragstart', ev)

        if (this.touchScrollAllowed === false) {
          this.pointerListener.cancelTouchScroll()
        }
      }
    }
  }

  tryStopDrag(ev) {
    let stopDrag = this.stopDrag.bind(this, ev) // bound with args

    if (this.dragMirror.isReverting) {
      this.dragMirror.revertDoneCallback = stopDrag // will clear itself
    } else {
      // HACK - we want to make sure dragend fires after all pointerup events.
      // Without doing this hack, pointer-up event propogation might reach an ancestor
      // node after dragend
      setTimeout(stopDrag, 0)
    }
  }

  stopDrag(ev) {
    this.isDragging = false // go first because DragMirror::enable relies on it :(
    this.emitter.trigger('dragend', ev)
  }


  enableMirror() {
    this.dragMirror.enable()
  }

  disableMirror() {
    this.dragMirror.disable()
  }

  setMirrorNeedsRevert(bool: boolean) {
    this.dragMirror.needsRevert = bool
  }

  setIgnoreMove(bool: boolean) {
    this.pointerListener.ignoreMove = bool
  }

}
