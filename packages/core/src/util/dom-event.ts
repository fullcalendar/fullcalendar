import { elementClosest } from './dom-manip.js'

// Stops a mouse/touch event from doing it's native browser action
export function preventDefault(ev) {
  ev.preventDefault()
}

// Event Delegation
// ----------------------------------------------------------------------------------------------------------------

export function buildDelegationHandler<EventType extends (Event | UIEvent)>(
  selector: string,
  handler: (ev: EventType, matchedTarget: HTMLElement) => void,
) {
  return (ev: EventType) => {
    let matchedChild = elementClosest(ev.target as HTMLElement, selector)

    if (matchedChild) {
      handler.call(matchedChild, ev, matchedChild)
    }
  }
}

export function listenBySelector(
  container: HTMLElement,
  eventType: string,
  selector: string,
  handler: (ev: Event, matchedTarget: HTMLElement) => void,
) {
  let attachedHandler = buildDelegationHandler(selector, handler)

  container.addEventListener(eventType, attachedHandler)

  return () => {
    container.removeEventListener(eventType, attachedHandler)
  }
}

export function listenToHoverBySelector(
  container: HTMLElement,
  selector: string,
  onMouseEnter: (ev: Event, matchedTarget: HTMLElement) => void,
  onMouseLeave: (ev: Event, matchedTarget: HTMLElement) => void,
) {
  let currentMatchedChild

  return listenBySelector(container, 'mouseover', selector, (mouseOverEv, matchedChild) => {
    if (matchedChild !== currentMatchedChild) {
      currentMatchedChild = matchedChild
      onMouseEnter(mouseOverEv, matchedChild)

      let realOnMouseLeave = (mouseLeaveEv) => {
        currentMatchedChild = null
        onMouseLeave(mouseLeaveEv, matchedChild)
        matchedChild.removeEventListener('mouseleave', realOnMouseLeave)
      }

      // listen to the next mouseleave, and then unattach
      matchedChild.addEventListener('mouseleave', realOnMouseLeave)
    }
  })
}

// Animation
// ----------------------------------------------------------------------------------------------------------------

const transitionEventNames = [
  'webkitTransitionEnd',
  'otransitionend',
  'oTransitionEnd',
  'msTransitionEnd',
  'transitionend',
]

// triggered only when the next single subsequent transition finishes
export function whenTransitionDone(el: HTMLElement, callback: (ev: Event) => void) {
  let realCallback = (ev) => {
    callback(ev)
    transitionEventNames.forEach((eventName) => {
      el.removeEventListener(eventName, realCallback)
    })
  }

  transitionEventNames.forEach((eventName) => {
    el.addEventListener(eventName, realCallback) // cross-browser way to determine when the transition finishes
  })
}

// ARIA workarounds
// ----------------------------------------------------------------------------------------------------------------

export function createAriaClickAttrs(handler: ((ev: UIEvent) => void)) {
  return {
    onClick: handler,
    ...createAriaKeyboardAttrs(handler),
  }
}

export function createAriaKeyboardAttrs(handler: ((ev: UIEvent) => void)) {
  return {
    tabIndex: 0,
    onKeyDown(ev: KeyboardEvent) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        handler(ev)
        ev.preventDefault() // if space, don't scroll down page
      }
    },
  }
}
