import { PointerDragEvent, ElementDragging } from '@fullcalendar/core'
import PointerDragging from '../dnd/PointerDragging'

/*
Detects when a *THIRD-PARTY* drag-n-drop system interacts with elements.
The third-party system is responsible for drawing the visuals effects of the drag.
This class simply monitors for pointer movements and fires events.
It also has the ability to hide the moving element (the "mirror") during the drag.
*/
export default class InferredElementDragging extends ElementDragging {

  pointer: PointerDragging
  shouldIgnoreMove: boolean = false
  mirrorSelector: string = ''
  currentMirrorEl: HTMLElement | null = null

  constructor(containerEl: HTMLElement) {
    super(containerEl)

    let pointer = this.pointer = new PointerDragging(containerEl)
    pointer.emitter.on('pointerdown', this.handlePointerDown)
    pointer.emitter.on('pointermove', this.handlePointerMove)
    pointer.emitter.on('pointerup', this.handlePointerUp)
  }

  destroy() {
    this.pointer.destroy()
  }

  handlePointerDown = (ev: PointerDragEvent) => {
    this.emitter.trigger('pointerdown', ev)

    if (!this.shouldIgnoreMove) {
      // fire dragstart right away. does not support delay or min-distance
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
      // fire dragend right away. does not support a revert animation
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
