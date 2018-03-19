import { assignTo } from '../util/object'

// TODO: use in other places
// TODO: rename to createElement
export function makeElement(tagName, attrs, content?): HTMLElement {
  let el: HTMLElement = document.createElement(tagName)

  if (attrs) {
    for (let attrName in attrs) {
      if (attrName === 'style') {
        assignTo(el.style, attrs[attrName])
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
