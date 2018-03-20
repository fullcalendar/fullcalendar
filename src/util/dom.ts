
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

  if (content != null) {
    appendContentTo(el, content)
  }

  return el
}

const PIXEL_PROP_RE = /(top|left|right|bottom|width|height)$/i

// find other places to do this
export function applyStyle(el: HTMLElement, props: object | string, propVal?: any) {
  if (typeof props === 'object') {
    for (let propName in props) {
      applyStyleProp(el, propName, props[propName])
    }
  } else if (typeof props === 'string') {
    applyStyleProp(el, props, propVal)
  }
}

function applyStyleProp(el, name, val) {
  if (val == null) {
    el.style[name] = ''
  } else if (typeof val === 'number' && PIXEL_PROP_RE.test(name)) {
    el.style[name] = val + 'px'
  } else {
    el.style[name] = val
  }
}

export type ElementContent = string | Node | NodeList | Node[]

export function appendContentTo(el: HTMLElement, content: ElementContent) {
  let childNodes = normalizeContent(content)
  for (let i = 0; i < childNodes.length; i++) {
    el.appendChild(childNodes[i])
  }
}

export function htmlToElement(htmlString): HTMLElement {
  let div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstChild as HTMLElement
}

export function htmlToElements(htmlString): HTMLElement {
  let div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return Array.prototype.slice.call(div.childNodes)
}

// TODO: rename to listenByClassName
export function listenViaDelegation(container: HTMLElement, eventType, childClassName, handler) {
  container.addEventListener(eventType, function(ev: Event) {
    for (let node = ev.target as HTMLElement; node !== container; node = node.parentNode as HTMLElement) {
      if (node.classList.contains(childClassName)) {
        handler.call(node, ev)
        break
      }
    }
  })
}

// from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
const matchesMethod = Element.prototype.matches || Element.prototype.msMatchesSelector
const closestMethod = Element.prototype.closest || function(selector) {
  let el = this
  if (!document.documentElement.contains(el)) {
    return null
  }
  do {
    if (matchesMethod.call(el, selector)) {
      return el
    }
    el = el.parentElement || el.parentNode
  } while (el !== null && el.nodeType === 1)
  return null;
}

export function listenBySelector(container: HTMLElement, eventType: string, selector: string, handler: (ev: Event, matchedTarget: Element) => void) {

  function realHandler(ev: Event) {
    let matchedChild = closestMethod.call(ev.target, selector)
    if (matchedChild) {
      handler.call(matchedChild, ev, matchedChild)
    }
  }

  container.addEventListener(eventType, realHandler)

  return function() {
    container.removeEventListener(eventType, realHandler)
  }
}

// TODO: user new signature in other places
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

export function removeElement(el: HTMLElement) {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
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

export function toggleClassName(el, className, bool) {
  if (bool) {
    el.classList.add(className)
  } else {
    el.classList.remove(className)
  }
}
