
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
