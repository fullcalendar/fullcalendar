import { Emitter } from '../common/Emitter'

/*
An abstraction for a dragging interaction originating on an event.
Does higher-level things than PointerDragger, such as possibly:
- a "mirror" that moves with the pointer
- a minimum number of pixels or other criteria for a true drag to begin

subclasses must emit:
- pointerdown
- dragstart
- dragmove
- pointerup
- dragend
*/
export abstract class ElementDragging { // TODO: rename to *Interface?
  emitter: Emitter<any>

  constructor(el: HTMLElement, selector?: string) {
    this.emitter = new Emitter()
  }

  destroy() {
  }

  // if given true, should prevent dragstart+dragmove+dragend from firing
  abstract setIgnoreMove(bool: boolean): void

  setMirrorIsVisible(bool: boolean) {
    // optional if subclass doesn't want to support a mirror
  }

  setMirrorNeedsRevert(bool: boolean) {
    // optional if subclass doesn't want to support a mirror
  }

  setAutoScrollEnabled(bool: boolean) {
    // optional
  }
}

export type ElementDraggingClass = { new(el: HTMLElement, selector?: string): ElementDragging }
