import { elementClosest } from './dom-manip'
import { VDomUIEvent } from '../vdom'


// Stops a mouse/touch event from doing it's native browser action
export function preventDefault(ev) {
  ev.preventDefault()
}


// Event Delegation
// ----------------------------------------------------------------------------------------------------------------

export function buildDelegationHandler<EventType extends (Event | VDomUIEvent)>(
  selector: string,
  handler: (ev: EventType, matchedTarget: HTMLElement) => void
) {
  return function(ev: EventType) {
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
  handler: (ev: Event, matchedTarget: HTMLElement) => void
) {
  let attachedHandler = buildDelegationHandler(selector, handler)

  container.addEventListener(eventType, attachedHandler)

  return function() {
    container.removeEventListener(eventType, attachedHandler)
  }
}


export function listenToHoverBySelector(
  container: HTMLElement,
  selector: string,
  onMouseEnter: (ev: Event, matchedTarget: HTMLElement) => void,
  onMouseLeave: (ev: Event, matchedTarget: HTMLElement) => void
) {
  let currentMatchedChild

  return listenBySelector(container, 'mouseover', selector, function(ev, matchedChild) {
    if (matchedChild !== currentMatchedChild) {
      currentMatchedChild = matchedChild
      onMouseEnter(ev, matchedChild)

      let realOnMouseLeave = (ev) => {
        currentMatchedChild = null
        onMouseLeave(ev, matchedChild)
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
  'transitionend'
]

// triggered only when the next single subsequent transition finishes
export function whenTransitionDone(el: HTMLElement, callback: (ev: Event) => void) {
  let realCallback = function(ev) {
    callback(ev)
    transitionEventNames.forEach(function(eventName) {
      el.removeEventListener(eventName, realCallback)
    })
  }

  transitionEventNames.forEach(function(eventName) {
    el.addEventListener(eventName, realCallback) // cross-browser way to determine when the transition finishes
  })
}
