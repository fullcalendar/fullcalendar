import PointerDragging, { PointerDragEvent } from '../dnd/PointerDragging'
import ElementDragging from '../dnd/ElementDragging'

export interface InferredElementDraggingSettings {
  itemSelector?: string
  mirrorSelector?: string
}

/* emits:
- pointerdown
- dragstart
- dragmove
- pointerup
- dragend
*/
export default class InferredElementDragging extends ElementDragging {

  pointer: PointerDragging
  shouldIgnoreMove: boolean = false
  mirrorSelector: string
  currentMirrorEl: HTMLElement | null = null

  constructor(options: InferredElementDraggingSettings) {
    super()

    let pointer = this.pointer = new PointerDragging(document)
    pointer.selector = options.itemSelector || '[data-event]'
    pointer.emitter.on('pointerdown', this.handlePointerDown)
    pointer.emitter.on('pointermove', this.handlePointerMove)
    pointer.emitter.on('pointerup', this.handlePointerUp)

    this.mirrorSelector = options.mirrorSelector || ''
  }

  destroy() {
    this.pointer.destroy()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    this.emitter.trigger('pointerdown', ev)

    if (!this.shouldIgnoreMove) {
      this.emitter.trigger('dragstart', ev)
    }
  }

  handlePointerMove = (ev: PointerDragEvent) => {
    if (!this.shouldIgnoreMove) {
      this.emitter.trigger('dragmove', ev)
    }
  }

  handlePointerUp = (ev: PointerDragEvent) => {
    this.emitter.trigger('pointerup', ev)

    if (!this.shouldIgnoreMove) {
      this.emitter.trigger('dragend', ev)
    }
  }

  setIgnoreMove(bool: boolean) {
    this.shouldIgnoreMove = bool
  }

  setMirrorIsVisible(bool: boolean) {
    if (bool) {
      // restore a previously hidden element.
      // use the reference in case the selector class has already been removed.
      if (this.currentMirrorEl) {
        this.currentMirrorEl.style.visibility = ''
        this.currentMirrorEl = null
      }
    } else {
      let mirrorEl = this.mirrorSelector ?
        document.querySelector(this.mirrorSelector) as HTMLElement :
        null

      if (mirrorEl) {
        this.currentMirrorEl = mirrorEl
        mirrorEl.style.visibility = 'hidden'
      }
    }
  }

}
