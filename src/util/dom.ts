
// TODO: util for animation end
// TODO: get straight the distinction between HTMLElement and Element


// Creating
// ----------------------------------------------------------------------------------------------------------------

// TODO: use in other places
// TODO: rename to createElement
export function makeElement(tagName, attrs, content?): HTMLElement {
  let el: HTMLElement = document.createElement(tagName)

  if (attrs) {
    for (let attrName in attrs) {
      if (attrName === 'style') {
        applyStyle(el, attrs[attrName])
      } else if (attrName === 'className' || attrName === 'colSpan' || attrName === 'rowSpan') { // TODO: do hash
        el[attrName] = attrs[attrName]
      } else {
        el.setAttribute(attrName, attrs[attrName])
      }
    }
  }

  if (typeof content === 'string') {
    el.innerHTML = content
  } else if (content != null) {
    appendContentTo(el, content)
  }

  return el
}

export function htmlToElement(htmlString): HTMLElement {
  htmlString = htmlString.trim()
  let container = document.createElement(computeContainerTag(htmlString))
  container.innerHTML = htmlString
  return container.firstChild as HTMLElement
}

export function htmlToElements(htmlString): HTMLElement[] {
  htmlString = htmlString.trim()
  let container = document.createElement(computeContainerTag(htmlString))
  container.innerHTML = htmlString
  return Array.prototype.slice.call(container.childNodes)
}

// assumes html already trimmed
// assumes html tags are lowercase
// TODO: use hash?
function computeContainerTag(html: string) {
  let first3 = html.substr(0, 3) // faster than using regex
  if (first3 === '<tr') {
    return 'tbody'
  } else if (first3 === '<td') {
    return 'tr'
  } else {
    return 'div'
  }
}


// Inserting / Removing
// ----------------------------------------------------------------------------------------------------------------

export type ElementContent = string | Node | NodeList | Node[]

export function appendContentTo(el: HTMLElement, content: ElementContent) {
  let childNodes = normalizeContent(content)
  for (let i = 0; i < childNodes.length; i++) {
    el.appendChild(childNodes[i])
  }
}

export function prependWithinEl(parent: HTMLElement, content: ElementContent) {
  let newEls = normalizeContent(content)
  let afterEl = parent.firstChild || null // if no firstChild, will append to end, but that's okay, b/c there were no children

  for (let i = 0; i < newEls.length; i++) {
    parent.insertBefore(newEls[i], afterEl)
  }
}

export function insertAfterEl(refEl: HTMLElement, content: ElementContent) {
  let newEls = normalizeContent(content)
  let afterEl = refEl.nextSibling || null

  for (let i = 0; i < newEls.length; i++) {
    refEl.parentNode.insertBefore(newEls[i], afterEl)
  }
}

function normalizeContent(content: ElementContent): NodeList | Node[] {
  let els
  if (typeof content === 'string') {
    els = htmlToElements(content) // TODO: optimization, htmlToNodeList
  } else if (content instanceof Node) {
    els = [ content ]
  } else { // assumed to be HTMLElement[]
    els = content
  }
  return els
}

export function removeElement(el: HTMLElement) {
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
  (Element.prototype as any).mozMatchesSelector ||
  (Element.prototype as any).msMatchesSelector ||
  (Element.prototype as any).oMatchesSelector ||
  (Element.prototype as any).webkitMatchesSelector

const closestMethod = Element.prototype.closest || function(selector) {
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

export function elementClosest(el: HTMLElement, selector: string) {
  return closestMethod.call(el, selector)
}

export function elementMatches(el: HTMLElement, selector: string) {
  return matchesMethod.call(el, selector)
}

// TODO: user new signature in other places
// this is only func that accepts array :(
export function findElsWithin(containers: HTMLElement[] | HTMLElement, selector: string): HTMLElement[] {
  if (containers instanceof HTMLElement) {
    containers = [ containers ]
  }
  let allChildEls: HTMLElement[] = []

  for (let i = 0; i < containers.length; i++) {
    let childEls = containers[i].querySelectorAll(selector)
    for (let j = 0; j < childEls.length; j++) {
      allChildEls.push(childEls[j] as HTMLElement)
    }
  }

  return allChildEls
}

export function queryChildren(parent: HTMLElement, selector?: string): HTMLElement[] {
  let childNodes = parent.childNodes
  let a = []

  for (let i = 0; i < childNodes.length; i++) {
    let childNode = childNodes[i]
    if (
      childNode.nodeType === 1 && // an element
      (!selector || elementMatches(childNode as HTMLElement, selector))
    ) {
      a.push(childNode)
    }
  }

  return a
}

export function queryChild(parent: HTMLElement, selector?: string): HTMLElement | null {
  let childNodes = parent.childNodes

  for (let i = 0; i < childNodes.length; i++) {
    let childNode = childNodes[i]
    if (
      childNode.nodeType === 1 && // an element
      (!selector || elementMatches(childNode as HTMLElement, selector))
    ) {
      return childNode as HTMLElement
    }
  }

  return null
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

      matchedChild.addEventListener('mouseleave', realOnMouseLeave)
    }
  })
}


// Style
// ----------------------------------------------------------------------------------------------------------------

const PIXEL_PROP_RE = /(top|left|right|bottom|width|height)$/i

// find other places to do this
export function applyStyle(el: HTMLElement, props: object, propVal?: any) {
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


// Dimensions
// ----------------------------------------------------------------------------------------------------------------

export function computeHeightAndMargins(el: HTMLElement) {
  let computed = window.getComputedStyle(el)
  return el.offsetHeight +
    parseInt(computed.marginTop, 10) +
    parseInt(computed.marginBottom, 10)
}
