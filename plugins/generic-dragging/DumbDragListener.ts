import {
  PointerDragListener,
  PointerDragEvent,
  IntentfulDragListener,
  EmitterMixin
} from 'fullcalendar'

/* needs to fire events:
- pointerdown
- dragstart
- dragmove
- pointerup
- dragend
*/
export default class DumbDragListener implements IntentfulDragListener {

  isDragging: boolean
  emitter: EmitterMixin
  options: any
  pointerListener: PointerDragListener

  constructor(options) {
    this.options = options
    this.emitter = new EmitterMixin()

    let pointerListener = this.pointerListener = new PointerDragListener(document as any)
    pointerListener.selector = options.itemSelector || '[data-event]' // TODO: better
    pointerListener.on('pointerdown', this.handlePointerDown)
    pointerListener.on('pointermove', this.handlePointerMove)
    pointerListener.on('pointerup', this.handlePointerUp)
  }

  destroy() {
    this.pointerListener.destroy()
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

  enableMirror() {
    let selector = this.options.mirrorSelector
    let mirrorEl = selector ? document.querySelector(selector) as HTMLElement : null

    if (mirrorEl) {
      mirrorEl.style.visibility = ''
    }
  }

  disableMirror() {
    let selector = this.options.mirrorSelector
    let mirrorEl = selector ? document.querySelector(selector) as HTMLElement : null

    if (mirrorEl) {
      mirrorEl.style.visibility = 'hidden'
    }
  }

  setIgnoreMove(bool: boolean) {
    // no optimization
  }

}
