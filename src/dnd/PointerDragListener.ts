import * as exportHooks from '../exports'
import { elementClosest } from '../util/dom-manip'
import { default as EmitterMixin } from '../common/EmitterMixin'
import { isPrimaryMouseButton } from '../util/dom-event'

(exportHooks as any).touchMouseIgnoreWait = 500

export interface PointerDragEvent {
  origEvent: UIEvent
  isTouch: boolean
  el: HTMLElement // rename to target?
  pageX: number
  pageY: number
}

export type PointerEventHandler = (ev: PointerDragEvent) => void

/*
events:
- pointerdown
- pointermove
- pointerup
*/
export default class PointerDragListener {

  containerEl: HTMLElement
  subjectEl: HTMLElement
  downEl: HTMLElement
  emitter: EmitterMixin

  // options
  selector: string
  ignoreMove: boolean = false // bad name?

  isDragging: boolean = false
  isDraggingTouch: boolean = false
  isTouchScroll: boolean = false

  constructor(containerEl: HTMLElement) {
    this.containerEl = containerEl
    this.emitter = new EmitterMixin()
    containerEl.addEventListener('mousedown', this.onMouseDown)
    containerEl.addEventListener('touchstart', this.onTouchStart)
    listenerCreated()
  }

  destroy() {
    this.containerEl.removeEventListener('mousedown', this.onMouseDown)
    this.containerEl.removeEventListener('touchstart', this.onTouchStart)
    listenerDestroyed()
  }

  on(name, handler: PointerEventHandler) {
    this.emitter.on(name, handler)
  }

  maybeStart(ev: UIEvent) {
    if ((this.subjectEl = this.queryValidSubjectEl(ev))) {
      this.downEl = ev.target as HTMLElement
      this.isDragging = true // do this first so cancelTouchScroll will work
      this.isTouchScroll = false
      return true
    }
  }

  cleanup() { // do this last, so that pointerup has access to props
    isWindowTouchMoveCancelled = false
    this.isDragging = false
    this.subjectEl = null
    this.downEl = null
    // keep isTouchScroll around for later access
  }

  onTouchScroll = () => {
    this.isTouchScroll = true
  }

  queryValidSubjectEl(ev: UIEvent): HTMLElement {
    if (this.selector) {
      return elementClosest(ev.target as HTMLElement, this.selector)
    } else {
      return this.containerEl
    }
  }

  onMouseDown = (ev: MouseEvent) => {
    if (
      !this.shouldIgnoreMouse() &&
      isPrimaryMouseButton(ev) &&
      this.maybeStart(ev)
    ) {
      this.emitter.trigger('pointerdown', this.createMouseEvent(ev))

      if (!this.ignoreMove) {
        document.addEventListener('mousemove', this.onMouseMove)
      }

      document.addEventListener('mouseup', this.onMouseUp)
    }
  }

  onMouseMove = (ev: MouseEvent) => {
    this.emitter.trigger('pointermove', this.createMouseEvent(ev))
  }

  onMouseUp = (ev: MouseEvent) => {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)

    this.emitter.trigger('pointerup', this.createMouseEvent(ev))

    this.cleanup()
  }

  onTouchStart = (ev: TouchEvent) => {
    if (this.maybeStart(ev)) {
      this.isDraggingTouch = true

      this.emitter.trigger('pointerdown', this.createTouchEvent(ev))

      // unlike mouse, need to attach to target, not document
      // https://stackoverflow.com/a/45760014
      let target = ev.target

      if (!this.ignoreMove) {
        target.addEventListener('touchmove', this.onTouchMove)
      }

      target.addEventListener('touchend', this.onTouchEnd)
      target.addEventListener('touchcancel', this.onTouchEnd) // treat it as a touch end

      // attach a handler to get called when ANY scroll action happens on the page.
      // this was impossible to do with normal on/off because 'scroll' doesn't bubble.
      // http://stackoverflow.com/a/32954565/96342
      window.addEventListener(
        'scroll',
        this.onTouchScroll, // always bound to `this`
        true // useCapture
      )
    }
  }

  onTouchMove = (ev: TouchEvent) => {
    this.emitter.trigger('pointermove', this.createTouchEvent(ev))
  }

  onTouchEnd = (ev: TouchEvent) => {
    if (this.isDragging) { // done to guard against touchend followed by touchcancel
      let target = ev.target

      target.removeEventListener('touchmove', this.onTouchMove)
      target.removeEventListener('touchend', this.onTouchEnd)
      target.removeEventListener('touchcancel', this.onTouchEnd)
      window.removeEventListener('scroll', this.onTouchScroll)

      this.emitter.trigger('pointerup', this.createTouchEvent(ev))

      this.cleanup()
      this.isDraggingTouch = false
      startIgnoringMouse()
    }
  }

  shouldIgnoreMouse() {
    return ignoreMouseDepth || this.isDraggingTouch
  }

  cancelTouchScroll() {
    if (this.isDragging) {
      isWindowTouchMoveCancelled = true
    }
  }

  createMouseEvent(ev): PointerDragEvent {
    return {
      origEvent: ev,
      isTouch: false,
      el: this.subjectEl,
      pageX: ev.pageX,
      pageY: ev.pageY
    }
  }

  createTouchEvent(ev): PointerDragEvent {
    let pev = {
      origEvent: ev,
      isTouch: true,
      el: this.subjectEl
    } as PointerDragEvent

    let touches = ev.touches

    // if touch coords available, prefer,
    // because FF would give bad ev.pageX ev.pageY
    if (touches && touches.length) {
      pev.pageX = touches[0].pageX
      pev.pageY = touches[0].pageY
    } else {
      pev.pageX = ev.pageX
      pev.pageY = ev.pageY
    }

    return pev
  }

}

let ignoreMouseDepth = 0

function startIgnoringMouse() { // can be made non-class function
  ignoreMouseDepth++

  setTimeout(() => {
    ignoreMouseDepth--
  }, (exportHooks as any).touchMouseIgnoreWait)
}

// we want to attach touchmove as early as possible for safari

let listenerCnt = 0
let isWindowTouchMoveCancelled = false

function listenerCreated() {
  if (!(listenerCnt++)) {
    window.addEventListener('touchmove', onWindowTouchMove, { passive: false })
  }
}

function listenerDestroyed() {
  if (!(--listenerCnt)) {
    window.removeEventListener('touchmove', onWindowTouchMove)
  }
}

function onWindowTouchMove(ev) {
  if (isWindowTouchMoveCancelled) {
    ev.preventDefault()
  }
}
