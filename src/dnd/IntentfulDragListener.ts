import { default as EmitterMixin } from '../common/EmitterMixin'
import { default as PointerDragListener, PointerDragEvent } from './PointerDragListener'
import { preventSelection, allowSelection, preventContextMenu, allowContextMenu } from '../util/misc'

export interface IntentfulDragOptions {
  containerEl: HTMLElement
  selector?: string
  ignoreMove?: any // set to false if you don't need to track moves, for performance reasons
  touchMinDistance?: number
  mouseMinDistance?: number
  touchDelay?: number | ((ev: PointerDragEvent) => number)
  mouseDelay?: number | ((ev: PointerDragEvent) => number)

  // if set to false, if there's a touch scroll after pointdown but before the drag begins,
  // it won't be considered a drag and dragstart/dragmove/dragend won't be fired.
  // if the drag initiates and this value is set to false, touch dragging will be prevented.
  touchScrollAllowed?: boolean
}

/*
fires:
- pointerdown
- dragstart
- dragmove
- pointermove
- dragend
- pointerup
*/
export default class IntentfulDragListener {

  pointerListener: PointerDragListener
  emitter: EmitterMixin

  options: IntentfulDragOptions

  isDragging: boolean = false // is it INTENTFULLY dragging?
  isDelayEnded: boolean = false
  isDistanceSurpassed: boolean = false

  delay: number
  delayTimeoutId: number

  minDistance: number
  origX: number
  origY: number

  constructor(options: IntentfulDragOptions) {
    this.options = options
    this.pointerListener = new PointerDragListener(options.containerEl, options.selector, options.ignoreMove)
    this.emitter = new EmitterMixin()

    this.pointerListener.on('pointerdown', this.onPointerDown)
    this.pointerListener.on('pointermove', this.onPointerMove)
    this.pointerListener.on('pointerup', this.onPointerUp)
  }

  destroy() {
    this.pointerListener.destroy()
  }

  on(name, handler) {
    this.emitter.on(name, handler)
  }

  onPointerDown = (ev: PointerDragEvent) => {
    this.emitter.trigger('pointerdown', ev)

    preventSelection(document.body)
    preventContextMenu(document.body)

    let minDistance = this.options[ev.isTouch ? 'touchMinDistance' : 'mouseMinDistance']
    let delay = this.options[ev.isTouch ? 'touchDelay' : 'mouseDelay']

    this.minDistance = minDistance || 0
    this.delay = typeof delay === 'function' ? (delay as any)(ev) : delay

    this.origX = ev.pageX
    this.origY = ev.pageY

    this.isDelayEnded = false
    this.isDistanceSurpassed = false

    this.startDelay(ev)

    if (!this.minDistance) {
      this.handleDistanceSurpassed(ev)
    }
  }

  onPointerMove = (ev: PointerDragEvent) => {
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

  onPointerUp = (ev: PointerDragEvent) => {
    if (this.isDragging) {
      this.stopDrag(ev)
    }

    allowSelection(document.body)
    allowContextMenu(document.body)

    if (this.delayTimeoutId) {
      clearTimeout(this.delayTimeoutId)
      this.delayTimeoutId = null
    }

    this.emitter.trigger('pointerup', ev)
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
    this.startDrag(ev)
  }

  handleDistanceSurpassed(ev: PointerDragEvent) {
    this.isDistanceSurpassed = true
    this.startDrag(ev)
  }

  startDrag(ev: PointerDragEvent) { // will only start if appropriate
    if (this.isDelayEnded && this.isDistanceSurpassed) {
      let touchScrollAllowed = this.options.touchScrollAllowed

      if (!this.pointerListener.isTouchScroll || touchScrollAllowed) {
        this.emitter.trigger('dragstart', ev)
        this.isDragging = true

        if (touchScrollAllowed === false) {
          this.pointerListener.cancelTouchScroll()
        }
      }
    }
  }

  stopDrag(ev) {
    this.emitter.trigger('dragend', ev)
    this.isDragging = false
  }

}
