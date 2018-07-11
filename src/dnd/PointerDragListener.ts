import * as exportHooks from '../exports'
import { elementClosest } from '../util/dom-manip'
import { default as EmitterMixin } from '../common/EmitterMixin'
import { isPrimaryMouseButton } from '../util/dom-event'

(exportHooks as any).touchMouseIgnoreWait = 500

export interface PointerEvent {
  origEvent: UIEvent
  isTouch: boolean
  el: HTMLElement
  pageX: number
  pageY: number
}

export type PointerEventHandler = (ev: PointerEvent) => void

export default class PointerDragListener {

  containerEl: HTMLElement
  selector: string
  subjectEl: HTMLElement
  emitter: EmitterMixin

  isDragging: boolean = false
  isDraggingTouch: boolean = false
  ignoreMouseDepth: number = 0

  constructor(containerEl: HTMLElement, selector?: string) {
    this.containerEl = containerEl
    this.selector = selector
    this.emitter = new EmitterMixin()
    containerEl.addEventListener('mousedown', this.onMouseDown)
    containerEl.addEventListener('touchstart', this.onTouchStart)
    listenerCreated()
  }

  destroy() {
    listenerDestroyed()
  }

  on(name, handler: PointerEventHandler) {
    this.emitter.on(name, handler)
  }

  onMouseDown = (ev: MouseEvent) => {
    if (
      !this.shouldIgnoreMouse() &&
      isPrimaryMouseButton(ev) &&
      (this.subjectEl = this.queryValidSubjectEl(ev))
    ) {
      this.isDragging = true // do this first so cancelTouchScroll will work
      this.emitter.trigger('down', this.createMouseEvent(ev))
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    }
  }

  onMouseMove = (ev: MouseEvent) => {
    this.emitter.trigger('move', this.createMouseEvent(ev))
  }

  onMouseUp = (ev: MouseEvent) => {
    isWindowTouchMoveCancelled = false
    this.isDragging = false
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
    this.emitter.trigger('up', this.createMouseEvent(ev))
    this.subjectEl = null // clear afterwards, so handlers have access
  }

  onTouchStart = (ev: TouchEvent) => {
    if ((this.subjectEl = this.queryValidSubjectEl(ev))) {
      this.isDragging = true // do this first so cancelTouchScroll will work
      this.isDraggingTouch = true
      this.emitter.trigger('down', this.createTouchEvent(ev))
      document.addEventListener('touchmove', this.onTouchMove)
      document.addEventListener('touchend', this.onTouchEnd)
      document.addEventListener('touchcancel', this.onTouchEnd) // treat it as a touch end
    }
  }

  onTouchMove = (ev: TouchEvent) => {
    this.emitter.trigger('move', this.createTouchEvent(ev))
  }

  onTouchEnd = (ev: TouchEvent) => {
    isWindowTouchMoveCancelled = false
    this.isDragging = false
    this.isDraggingTouch = false
    document.removeEventListener('touchmove', this.onTouchMove)
    document.removeEventListener('touchend', this.onTouchEnd)
    document.removeEventListener('touchcancel', this.onTouchEnd)
    this.emitter.trigger('up', this.createTouchEvent(ev))
    this.subjectEl = null // clear afterwards, so handlers have access
    this.startIgnoringMouse()
  }

  queryValidSubjectEl(ev: UIEvent): HTMLElement {
    if (this.selector) {
      return elementClosest(ev.target as HTMLElement, this.selector)
    } else {
      return this.containerEl
    }
  }

  shouldIgnoreMouse() {
    return this.ignoreMouseDepth || this.isDraggingTouch
  }

  startIgnoringMouse() {
    this.ignoreMouseDepth++

    setTimeout(() => {
      this.ignoreMouseDepth--
    }, (exportHooks as any).touchMouseIgnoreWait)
  }

  cancelTouchScroll() {
    if (this.isDragging) {
      isWindowTouchMoveCancelled = true
    }
  }

  createMouseEvent(ev): PointerEvent {
    return {
      origEvent: ev,
      isTouch: false,
      el: this.subjectEl,
      pageX: ev.pageX,
      pageY: ev.pageY
    }
  }

  createTouchEvent(ev): PointerEvent {
    let touches = ev.touches
    let obj = {
      origEvent: ev,
      isTouch: true,
      el: this.subjectEl
    } as PointerEvent

    // if touch coords available, prefer,
    // because FF would give bad ev.pageX ev.pageY
    if (touches && touches.length) {
      obj.pageX = touches[0].pageX
      obj.pageY = touches[0].pageY
    } else {
      obj.pageX = ev.pageX
      obj.pageY = ev.pageY
    }

    return obj
  }

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
