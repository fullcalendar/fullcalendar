import { default as EmitterMixin } from '../common/EmitterMixin'
import { default as PointerDragListener, PointerEvent } from './PointerDragListener'
import { preventSelection, allowSelection, preventContextMenu, allowContextMenu } from '../util/misc'

export interface IntentfulDragOptions {
  touchMinDistance?: number
  mouseMinDistance?: number
  touchDelay?: number | [() => number]
  mouseDelay?: number | [() => number]
  touchScrollAllowed?: boolean
}

export default class IntentfulDragListener {

  pointer: PointerDragListener
  emitter: EmitterMixin

  options: IntentfulDragOptions

  isDragging: boolean = false // is it INTENTFULLY dragging?
  isDelayEnded: boolean = false
  isDistanceSurpassed: boolean = false
  isTouchScroll: boolean = false

  delay: number
  delayTimeoutId: number

  minDistance: number
  origX: number
  origY: number

  constructor(options) {
    this.options = options
    this.pointer = new PointerDragListener(options.containerEl, options.selector)
    this.emitter = new EmitterMixin()

    this.pointer.on('down', this.handleDown)
    this.pointer.on('move', this.handleMove)
    this.pointer.on('up', this.handleUp)
  }

  destroy() {
    this.pointer.destroy()
  }

  on(name, handler) {
    this.emitter.on(name, handler)
  }

  handleDown = (ev: PointerEvent) => {
    preventSelection(document.body)
    preventContextMenu(document.body)

    let minDistance = this.options[ev.isTouch ? 'touchMinDistance' : 'mouseMinDistance']
    let delay = this.options[ev.isTouch ? 'touchDelay' : 'mouseDelay']

    this.minDistance = minDistance
    this.delay = typeof delay === 'function' ? (delay as any)() : delay

    this.origX = ev.pageX
    this.origY = ev.pageY

    this.isDelayEnded = false
    this.isDistanceSurpassed = false
    this.isTouchScroll = false

    this.emitter.trigger('pointerdown', ev)
    this.startDelay(ev)

    if (!this.minDistance) {
      this.handleDistanceSurpassed(ev)
    }

    if (ev.isTouch) {
      // attach a handler to get called when ANY scroll action happens on the page.
      // this was impossible to do with normal on/off because 'scroll' doesn't bubble.
      // http://stackoverflow.com/a/32954565/96342
      window.addEventListener(
        'scroll',
        this.handleTouchScroll, // always bound to `this`
        true // useCapture
      )
    }
  }

  handleMove = (ev: PointerEvent) => {
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

  handleUp = (ev: PointerEvent) => {
    if (this.isDragging) {
      this.stopDrag(ev)
    }

    allowSelection(document.body)
    allowContextMenu(document.body)

    if (this.delayTimeoutId) {
      clearTimeout(this.delayTimeoutId)
      this.delayTimeoutId = null
    }

    if (ev.isTouch) {
      window.removeEventListener('scroll', this.handleTouchScroll)
    }

    this.emitter.trigger('pointerup', ev)
  }

  handleTouchScroll = () => {
    this.isTouchScroll = true
  }

  startDelay(ev: PointerEvent) {
    if (typeof this.delay === 'number') {
      this.delayTimeoutId = setTimeout(() => {
        this.delayTimeoutId = null
        this.handleDelayEnd(ev)
      }, this.delay)
    } else {
      this.handleDelayEnd(ev)
    }
  }

  handleDelayEnd(ev: PointerEvent) {
    this.isDelayEnded = true
    this.startDrag(ev)
  }

  handleDistanceSurpassed(ev: PointerEvent) {
    this.isDistanceSurpassed = true
    this.startDrag(ev)
  }

  startDrag(ev: PointerEvent) { // will only start if appropriate
    if (
      this.isDelayEnded &&
      this.isDistanceSurpassed &&
      (!this.isTouchScroll || this.options.touchScrollAllowed !== false)
    ) {
      this.emitter.trigger('dragstart', ev)
      this.isDragging = true

      if (this.options.touchScrollAllowed === false) {
        this.pointer.cancelTouchScroll()
      }
    }
  }

  stopDrag(ev) {
    this.emitter.trigger('dragend', ev)
    this.isDragging = false
  }

}
