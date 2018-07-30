import PointerDragging, { PointerDragEvent } from '../dnd/PointerDragging'
import ElementDragging from '../dnd/ElementDragging'

/* needs to fire events:
- pointerdown
- dragstart
- dragmove
- pointerup
- dragend
*/
export default class DumbElementDragging extends ElementDragging {

  isDragging: boolean
  options: any
  pointer: PointerDragging
  currentMirrorEl: HTMLElement

  constructor(options) {
    super()

    this.options = options

    let pointer = this.pointer = new PointerDragging(document as any)
    pointer.selector = options.itemSelector || '[data-event]' // TODO: better
    pointer.emitter.on('pointerdown', this.handlePointerDown)
    pointer.emitter.on('pointermove', this.handlePointerMove)
    pointer.emitter.on('pointerup', this.handlePointerUp)
  }

  destroy() {
    this.pointer.destroy()
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

}
