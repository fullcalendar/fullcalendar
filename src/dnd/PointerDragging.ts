import * as exportHooks from '../exports'
import { elementClosest } from '../util/dom-manip'
import { default as EmitterMixin } from '../common/EmitterMixin'

(exportHooks as any).touchMouseIgnoreWait = 500

export interface PointerDragEvent {
  origEvent: UIEvent
  isTouch: boolean
  subjectEl: HTMLElement
  pageX: number
  pageY: number
}

/*
Uses a "pointer" abstraction, which monitors UI events for both mouse and touch.
Tracks when the pointer "drags" on a certain element, meaning down+move+up.

Also, tracks if there was touch-scrolling.
Also, can prevent touch-scrolling from happening.

emits:
- pointerdown
- pointermove
- pointerup
*/
export default class PointerDragging {

  containerEl: HTMLElement
  subjectEl: HTMLElement | null = null
  downEl: HTMLElement | null = null
  emitter: EmitterMixin

  // options that can be directly assigned by caller
  selector: string = '' // will cause subjectEl in all emitted events to be this element
  handleSelector: string = ''
  shouldIgnoreMove: boolean = false

  // internal states
  isDragging: boolean = false
  isTouchDragging: boolean = false
  wasTouchScroll: boolean = false

  constructor(containerEl: HTMLElement) {
    this.containerEl = containerEl
    this.emitter = new EmitterMixin()
    containerEl.addEventListener('mousedown', this.handleMouseDown)
    containerEl.addEventListener('touchstart', this.handleTouchStart)
    listenerCreated()
  }

  destroy() {
    this.containerEl.removeEventListener('mousedown', this.handleMouseDown)
    this.containerEl.removeEventListener('touchstart', this.handleTouchStart)
    listenerDestroyed()
  }

  tryStart(ev: UIEvent): boolean {
    let subjectEl = this.querySubjectEl(ev)
    let downEl = ev.target as HTMLElement

    if (
      subjectEl &&
      (!this.handleSelector || elementClosest(downEl, this.handleSelector))
    ) {
      this.subjectEl = subjectEl
      this.downEl = downEl
      this.isDragging = true // do this first so cancelTouchScroll will work
      this.wasTouchScroll = false
      return true
    }

    return false
  }

  cleanup() {
    isWindowTouchMoveCancelled = false
    this.isDragging = false
    this.subjectEl = null
    this.downEl = null
    // keep wasTouchScroll around for later access
  }

  querySubjectEl(ev: UIEvent): HTMLElement {
    if (this.selector) {
      return elementClosest(ev.target as HTMLElement, this.selector)
    } else {
      return this.containerEl
    }
  }


  // Mouse
  // ----------------------------------------------------------------------------------------------------

  handleMouseDown = (ev: MouseEvent) => {
    if (
      !this.shouldIgnoreMouse() &&
      isPrimaryMouseButton(ev) &&
      this.tryStart(ev)
    ) {
      this.emitter.trigger('pointerdown', createEventFromMouse(ev, this.subjectEl!))

      if (!this.shouldIgnoreMove) {
        document.addEventListener('mousemove', this.handleMouseMove)
      }

      document.addEventListener('mouseup', this.handleMouseUp)
    }
  }

  handleMouseMove = (ev: MouseEvent) => {
    this.emitter.trigger('pointermove', createEventFromMouse(ev, this.subjectEl!))
  }

  handleMouseUp = (ev: MouseEvent) => {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)

    this.emitter.trigger('pointerup', createEventFromMouse(ev, this.subjectEl!))

    this.cleanup() // call last so that pointerup has access to props
  }

  shouldIgnoreMouse() {
    return ignoreMouseDepth || this.isTouchDragging
  }


  // Touch
  // ----------------------------------------------------------------------------------------------------

  handleTouchStart = (ev: TouchEvent) => {
    if (this.tryStart(ev)) {
      this.isTouchDragging = true

      this.emitter.trigger('pointerdown', createEventFromTouch(ev, this.subjectEl!))

      // unlike mouse, need to attach to target, not document
      // https://stackoverflow.com/a/45760014
      let target = ev.target as HTMLElement

      if (!this.shouldIgnoreMove) {
        target.addEventListener('touchmove', this.handleTouchMove)
      }

      target.addEventListener('touchend', this.handleTouchEnd)
      target.addEventListener('touchcancel', this.handleTouchEnd) // treat it as a touch end

      // attach a handler to get called when ANY scroll action happens on the page.
      // this was impossible to do with normal on/off because 'scroll' doesn't bubble.
      // http://stackoverflow.com/a/32954565/96342
      window.addEventListener(
        'scroll',
        this.handleTouchScroll,
        true // useCapture
      )
    }

  }

  handleTouchMove = (ev: TouchEvent) => {
    this.emitter.trigger('pointermove', createEventFromTouch(ev, this.subjectEl!))
  }

  handleTouchEnd = (ev: TouchEvent) => {
    if (this.isDragging) { // done to guard against touchend followed by touchcancel
      let target = ev.target as HTMLElement

      target.removeEventListener('touchmove', this.handleTouchMove)
      target.removeEventListener('touchend', this.handleTouchEnd)
      target.removeEventListener('touchcancel', this.handleTouchEnd)
      window.removeEventListener('scroll', this.handleTouchScroll)

      this.emitter.trigger('pointerup', createEventFromTouch(ev, this.subjectEl!))

      this.cleanup() // call last so that pointerup has access to props
      this.isTouchDragging = false
      startIgnoringMouse()
    }
  }

  handleTouchScroll = () => {
    this.wasTouchScroll = true
  }

  // can be called by user of this class, to cancel touch-based scrolling for the current drag
  cancelTouchScroll() {
    if (this.isDragging) {
      isWindowTouchMoveCancelled = true
    }
  }

}


// Event Normalization
// ----------------------------------------------------------------------------------------------------

function createEventFromMouse(ev: MouseEvent, subjectEl: HTMLElement): PointerDragEvent {
  return {
    origEvent: ev,
    isTouch: false,
    subjectEl,
    pageX: ev.pageX,
    pageY: ev.pageY
  }
}

function createEventFromTouch(ev: TouchEvent, subjectEl: HTMLElement): PointerDragEvent {
  let touches = ev.touches
  let pageX
  let pageY

  // if touch coords available, prefer,
  // because FF would give bad ev.pageX ev.pageY
  if (touches && touches.length) {
    pageX = touches[0].pageX
    pageY = touches[0].pageY
  } else {
    pageX = (ev as any).pageX
    pageY = (ev as any).pageY
  }

  return {
    origEvent: ev,
    isTouch: true,
    subjectEl,
    pageX,
    pageY
  }
}

// Returns a boolean whether this was a left mouse click and no ctrl key (which means right click on Mac)
function isPrimaryMouseButton(ev: MouseEvent) {
  return ev.button === 0 && !ev.ctrlKey
}


// Ignoring fake mouse events generated by touch
// ----------------------------------------------------------------------------------------------------

let ignoreMouseDepth = 0

function startIgnoringMouse() { // can be made non-class function
  ignoreMouseDepth++

  setTimeout(() => {
    ignoreMouseDepth--
  }, (exportHooks as any).touchMouseIgnoreWait)
}


// We want to attach touchmove as early as possible for Safari
// ----------------------------------------------------------------------------------------------------

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

function onWindowTouchMove(ev: UIEvent) {
  if (isWindowTouchMoveCancelled) {
    ev.preventDefault()
  }
}
