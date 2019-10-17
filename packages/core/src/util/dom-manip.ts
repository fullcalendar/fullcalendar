
// Creating
// ----------------------------------------------------------------------------------------------------------------

const elementPropHash = { // when props given to createElement should be treated as props, not attributes
  className: true,
  colSpan: true,
  rowSpan: true
}

const containerTagHash = {
  '<tr': 'tbody',
  '<td': 'tr'
}

export function createElement(tagName: string, attrs: object | null, content?: ElementContent): HTMLElement {
  let el: HTMLElement = document.createElement(tagName)

  if (attrs) {
    for (let attrName in attrs) {
      if (attrName === 'style') {
        applyStyle(el, attrs[attrName])
      } else if (elementPropHash[attrName]) {
        el[attrName] = attrs[attrName]
      } else {
        el.setAttribute(attrName, attrs[attrName])
      }
    }
  }

  if (typeof content === 'string') {
    el.innerHTML = content // shortcut. no need to process HTML in any way
  } else if (content != null) {
    appendToElement(el, content)
  }

  return el
}

export function htmlToElement(html: string): HTMLElement {
  html = html.trim()
  let container = document.createElement(computeContainerTag(html))
  container.innerHTML = html
  return container.firstChild as HTMLElement
}

export function htmlToElements(html: string): HTMLElement[] {
  return Array.prototype.slice.call(htmlToNodeList(html))
}

function htmlToNodeList(html: string): NodeList {
  html = html.trim()
  let container = document.createElement(computeContainerTag(html))
  container.innerHTML = html
  return container.childNodes
}

// assumes html already trimmed and tag names are lowercase
function computeContainerTag(html: string) {
  return containerTagHash[
    html.substr(0, 3) // faster than using regex
  ] || 'div'
}


// Inserting / Removing
// ----------------------------------------------------------------------------------------------------------------

export type ElementContent = string | Node | Node[] | NodeList

export function appendToElement(el: HTMLElement, content: ElementContent) {
  let childNodes = normalizeContent(content)

  for (let i = 0; i < childNodes.length; i++) {
    el.appendChild(childNodes[i])
  }
}

export function prependToElement(parent: HTMLElement, content: ElementContent) {
  let newEls = normalizeContent(content)
  let afterEl = parent.firstChild || null // if no firstChild, will append to end, but that's okay, b/c there were no children

  for (let i = 0; i < newEls.length; i++) {
    parent.insertBefore(newEls[i], afterEl)
  }
}

export function insertAfterElement(refEl: HTMLElement, content: ElementContent) {
  let newEls = normalizeContent(content)
  let afterEl = refEl.nextSibling || null

  for (let i = 0; i < newEls.length; i++) {
    refEl.parentNode.insertBefore(newEls[i], afterEl)
  }
}

function normalizeContent(content: ElementContent): Node[] {
  let els
  if (typeof content === 'string') {
    els = htmlToElements(content)
  } else if (content instanceof Node) {
    els = [ content ]
  } else { // Node[] or NodeList
    els = Array.prototype.slice.call(content)
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
  return closestMethod.call(el, selector)
}

export function elementMatches(el: HTMLElement, selector: string): HTMLElement {
  return matchesMethod.call(el, selector)
}

// accepts multiple subject els
// returns a real array. good for methods like forEach
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
// only queries direct child elements
export function findChildren(parent: HTMLElement[] | HTMLElement, selector?: string): HTMLElement[] {
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


// Attributes
// ----------------------------------------------------------------------------------------------------------------

export function forceClassName(el: HTMLElement, className: string, bool) { // might not be used anywhere
  if (bool) {
    el.classList.add(className)
  } else {
    el.classList.remove(className)
  }
}


// Style
// ----------------------------------------------------------------------------------------------------------------

const PIXEL_PROP_RE = /(top|left|right|bottom|width|height)$/i

export function applyStyle(el: HTMLElement, props: object) {
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
