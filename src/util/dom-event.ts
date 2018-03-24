import { elementClosest } from './dom'


// Returns a boolean whether this was a left mouse click and no ctrl key (which means right click on Mac)
export function isPrimaryMouseButton(ev: MouseEvent) {
  return ev.button === 0 && !ev.ctrlKey
}


export function getEvX(ev: UIEvent) {
  let touches = (ev as TouchEvent).touches

  // on mobile FF, pageX for touch events is present, but incorrect,
  // so, look at touch coordinates first.
  if (touches && touches.length) {
    return touches[0].pageX
  }

  return (ev as MouseEvent).pageX
}


export function getEvY(ev) {
  let touches = (ev as TouchEvent).touches

  // on mobile FF, pageX for touch events is present, but incorrect,
  // so, look at touch coordinates first.
  if (touches && touches.length) {
    return touches[0].pageY
  }

  return (ev as MouseEvent).pageY
}


export function getEvIsTouch(ev) {
  return /^touch/.test(ev.type)
}


// Stops a mouse/touch event from doing it's native browser action
export function preventDefault(ev) {
  ev.preventDefault()
}


// Event Delegation
// ----------------------------------------------------------------------------------------------------------------

export function listenBySelector(
  container: HTMLElement,
  eventType: string,
  selector: string,
  handler: (ev: Event, matchedTarget: HTMLElement) => void
) {
  function realHandler(ev: Event) {
    let matchedChild = elementClosest(ev.target as HTMLElement, selector)
    if (matchedChild) {
      handler.call(matchedChild, ev, matchedChild)
    }
  }

  container.addEventListener(eventType, realHandler)

  return function() {
    container.removeEventListener(eventType, realHandler)
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
