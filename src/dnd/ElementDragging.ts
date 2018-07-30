import EmitterMixin from '../common/EmitterMixin'

/* emits:
- pointerdown
- dragstart
- dragmove
- pointerup ... TODO: change order!
- dragend
*/
export default abstract class ElementDragging {

  isDragging: boolean = false // will go away when DragMirror is more loosely coupled
  emitter: EmitterMixin

  constructor() {
    this.emitter = new EmitterMixin()
  }

  destroy() {
  }

  setIgnoreMove(bool: boolean) {
  }

  enableMirror() {
    // TODO: make it a switch
  }

  disableMirror() {
    // TODO: make it a switch
  }

  setMirrorNeedsRevert(bool: boolean) {
  }

}
