import * as $ from 'jquery'
import * as exportHooks from '../exports'
import { default as EmitterMixin, EmitterInterface } from './EmitterMixin'
import { default as ListenerMixin, ListenerInterface } from './ListenerMixin'

(exportHooks as any).touchMouseIgnoreWait = 500

let globalEmitter = null
let neededCount = 0

/*
Listens to document and window-level user-interaction events, like touch events and mouse events,
and fires these events as-is to whoever is observing a GlobalEmitter.
Best when used as a singleton via GlobalEmitter.get()

Normalizes mouse/touch events. For examples:
- ignores the the simulated mouse events that happen after a quick tap: mousemove+mousedown+mouseup+click
- compensates for various buggy scenarios where a touchend does not fire
*/
export default class GlobalEmitter {

  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']
  listenTo: ListenerInterface['listenTo']
  stopListeningTo: ListenerInterface['stopListeningTo']

  isTouching: boolean = false
  mouseIgnoreDepth: number = 0
  handleScrollProxy: (ev: Event) => void
  handleTouchMoveProxy: (ev: Event) => void


  // gets the singleton
  static get() {
    if (!globalEmitter) {
      globalEmitter = new GlobalEmitter()
      globalEmitter.bind()
    }

    return globalEmitter
  }


  // called when an object knows it will need a GlobalEmitter in the near future.
  static needed() {
    GlobalEmitter.get() // ensures globalEmitter
    neededCount++
  }


  // called when the object that originally called needed() doesn't need a GlobalEmitter anymore.
  static unneeded() {
    neededCount--

    if (!neededCount) { // nobody else needs it
      globalEmitter.unbind()
      globalEmitter = null
    }
  }


  bind() {
    this.listenTo($(document), {
      touchstart: this.handleTouchStart,
      touchcancel: this.handleTouchCancel,
      touchend: this.handleTouchEnd,
      mousedown: this.handleMouseDown,
      mousemove: this.handleMouseMove,
      mouseup: this.handleMouseUp,
      click: this.handleClick,
      selectstart: this.handleSelectStart,
      contextmenu: this.handleContextMenu
    })

    // because we need to call preventDefault
    // because https://www.chromestatus.com/features/5093566007214080
    // TODO: investigate performance because this is a global handler
    window.addEventListener(
      'touchmove',
      this.handleTouchMoveProxy = (ev) => {
        this.handleTouchMove($.Event(ev as any))
      },
      { passive: false } // allows preventDefault()
    )

    // attach a handler to get called when ANY scroll action happens on the page.
    // this was impossible to do with normal on/off because 'scroll' doesn't bubble.
    // http://stackoverflow.com/a/32954565/96342
    window.addEventListener(
      'scroll',
      this.handleScrollProxy = (ev) => {
        this.handleScroll($.Event(ev as any))
      },
      true // useCapture
    )
  }

  unbind() {
    this.stopListeningTo($(document))

    window.removeEventListener(
      'touchmove',
      this.handleTouchMoveProxy,
      { passive: false } as AddEventListenerOptions // use same options as addEventListener
    )

    window.removeEventListener(
      'scroll',
      this.handleScrollProxy,
      true // useCapture
    )
  }


  // Touch Handlers
  // -----------------------------------------------------------------------------------------------------------------

  handleTouchStart(ev) {

    // if a previous touch interaction never ended with a touchend, then implicitly end it,
    // but since a new touch interaction is about to begin, don't start the mouse ignore period.
    this.stopTouch(ev, true) // skipMouseIgnore=true

    this.isTouching = true
    this.trigger('touchstart', ev)
  }

  handleTouchMove(ev) {
    if (this.isTouching) {
      this.trigger('touchmove', ev)
    }
  }

  handleTouchCancel(ev) {
    if (this.isTouching) {
      this.trigger('touchcancel', ev)

      // Have touchcancel fire an artificial touchend. That way, handlers won't need to listen to both.
      // If touchend fires later, it won't have any effect b/c isTouching will be false.
      this.stopTouch(ev)
    }
  }

  handleTouchEnd(ev) {
    this.stopTouch(ev)
  }


  // Mouse Handlers
  // -----------------------------------------------------------------------------------------------------------------

  handleMouseDown(ev) {
    if (!this.shouldIgnoreMouse()) {
      this.trigger('mousedown', ev)
    }
  }

  handleMouseMove(ev) {
    if (!this.shouldIgnoreMouse()) {
      this.trigger('mousemove', ev)
    }
  }

  handleMouseUp(ev) {
    if (!this.shouldIgnoreMouse()) {
      this.trigger('mouseup', ev)
    }
  }

  handleClick(ev) {
    if (!this.shouldIgnoreMouse()) {
      this.trigger('click', ev)
    }
  }


  // Misc Handlers
  // -----------------------------------------------------------------------------------------------------------------

  handleSelectStart(ev) {
    this.trigger('selectstart', ev)
  }

  handleContextMenu(ev) {
    this.trigger('contextmenu', ev)
  }

  handleScroll(ev) {
    this.trigger('scroll', ev)
  }


  // Utils
  // -----------------------------------------------------------------------------------------------------------------

  stopTouch(ev, skipMouseIgnore= false) {
    if (this.isTouching) {
      this.isTouching = false
      this.trigger('touchend', ev)

      if (!skipMouseIgnore) {
        this.startTouchMouseIgnore()
      }
    }
  }

  startTouchMouseIgnore() {
    let wait = (exportHooks as any).touchMouseIgnoreWait

    if (wait) {
      this.mouseIgnoreDepth++
      setTimeout(() => {
        this.mouseIgnoreDepth--
      }, wait)
    }
  }

  shouldIgnoreMouse() {
    return this.isTouching || Boolean(this.mouseIgnoreDepth)
  }

}

ListenerMixin.mixInto(GlobalEmitter)
EmitterMixin.mixInto(GlobalEmitter)
