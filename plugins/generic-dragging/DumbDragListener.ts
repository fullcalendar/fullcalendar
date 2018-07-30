import {
  PointerDragging,
  PointerDragEvent,
  ElementDragging,
  EmitterMixin
} from 'fullcalendar'

/* needs to fire events:
- pointerdown
- dragstart
- dragmove
- pointerup
- dragend
*/
export default class DumbDragListener extends ElementDragging {

  isDragging: boolean
  emitter: EmitterMixin
  options: any
  pointer: PointerDragging
  currentMirrorEl: HTMLElement

  constructor(options) {
    super()

    this.options = options
    this.emitter = new EmitterMixin()

    let pointer = this.pointer = new PointerDragging(document as any)
    pointer.selector = options.itemSelector || '[data-event]' // TODO: better
    pointer.emitter.on('pointerdown', this.handlePointerDown)
    pointer.emitter.on('pointermove', this.handlePointerMove)
    pointer.emitter.on('pointerup', this.handlePointerUp)
  }

  destroy() {
    this.pointer.destroy()
  }

  on(name, func) {
    this.emitter.on(name, func)
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    this.isDragging = true
    this.emitter.trigger('pointerdown', ev)
    this.emitter.trigger('dragstart', ev)
  }

  handlePointerMove = (ev: PointerDragEvent) => {
    this.emitter.trigger('dragmove', ev)
  }

  handlePointerUp = (ev: PointerDragEvent) => {
    this.isDragging = false
    this.emitter.trigger('pointerup', ev)
    this.emitter.trigger('dragend', ev)
  }

  setMirrorNeedsRevert() {
    // doesn't support revert animation
  }

  disableMirror() {
    let selector = this.options.mirrorSelector
    let mirrorEl = selector ? document.querySelector(selector) as HTMLElement : null

    if (mirrorEl) {
      this.currentMirrorEl = mirrorEl
      mirrorEl.style.visibility = 'hidden'
    }
  }

  enableMirror() {
    // use the reference in case the selector class has already been removed
    if (this.currentMirrorEl) {
      this.currentMirrorEl.style.visibility = ''
      this.currentMirrorEl = null
    }
  }

  setIgnoreMove(bool: boolean) {
    // no optimization
  }

}
