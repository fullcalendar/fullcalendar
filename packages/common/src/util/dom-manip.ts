import { Dictionary } from '../options'


export function removeElement(el: HTMLElement) { // removes nodes in addition to elements. bad name
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}


// Querying
// ----------------------------------------------------------------------------------------------------------------

// from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
const matchesMethod =
  Element.prototype.matches ||
  (Element.prototype as any).matchesSelector ||
  (Element.prototype as any).msMatchesSelector

const closestMethod = Element.prototype.closest || function(selector) {
  // polyfill
  let el = this
  if (!document.documentElement.contains(el)) {
    return null
  }
  do {
    if (elementMatches(el, selector)) {
      return el
    }
    el = el.parentElement || el.parentNode
  } while (el !== null && el.nodeType === 1)
  return null
}


export function elementClosest(el: HTMLElement, selector: string): HTMLElement {
  return (closestMethod as any).call(el, selector)
}


export function elementMatches(el: HTMLElement, selector: string): HTMLElement {
  return matchesMethod.call(el, selector)
}


// accepts multiple subject els
// returns a real array. good for methods like forEach
// TODO: accept the document
export function findElements(container: HTMLElement[] | HTMLElement | NodeListOf<HTMLElement>, selector: string): HTMLElement[] {
  let containers = container instanceof HTMLElement ? [ container ] : container
  let allMatches: HTMLElement[] = []

  for (let i = 0; i < containers.length; i++) {
    let matches = containers[i].querySelectorAll(selector)

    for (let j = 0; j < matches.length; j++) {
      allMatches.push(matches[j] as HTMLElement)
    }
  }

  return allMatches
}


// accepts multiple subject els
// only queries direct child elements // TODO: rename to findDirectChildren!
export function findDirectChildren(parent: HTMLElement[] | HTMLElement, selector?: string): HTMLElement[] {
  let parents = parent instanceof HTMLElement ? [ parent ] : parent
  let allMatches = []

  for (let i = 0; i < parents.length; i++) {
    let childNodes = parents[i].children // only ever elements

    for (let j = 0; j < childNodes.length; j++) {
      let childNode = childNodes[j]

      if (!selector || elementMatches(childNode as HTMLElement, selector)) {
        allMatches.push(childNode)
      }
    }
  }

  return allMatches
}


// Style
// ----------------------------------------------------------------------------------------------------------------

const PIXEL_PROP_RE = /(top|left|right|bottom|width|height)$/i

export function applyStyle(el: HTMLElement, props: Dictionary) {
  for (let propName in props) {
    applyStyleProp(el, propName, props[propName])
  }
}

export function applyStyleProp(el: HTMLElement, name: string, val) {
  if (val == null) {
    el.style[name] = ''
  } else if (typeof val === 'number' && PIXEL_PROP_RE.test(name)) {
    el.style[name] = val + 'px'
  } else {
    el.style[name] = val
  }
}
