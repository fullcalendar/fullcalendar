import EmitterMixin from '../common/EmitterMixin'

/* emits:
- pointerdown
- dragstart
- dragmove
- pointerup
- dragend
*/
export default abstract class ElementDragging {

  emitter: EmitterMixin

  constructor() {
    this.emitter = new EmitterMixin()
  }

  destroy() {
  }

  setIgnoreMove(bool: boolean) {
  }

  setMirrorIsVisible(bool: boolean) {
  }

  setMirrorNeedsRevert(bool: boolean) {
  }

}
