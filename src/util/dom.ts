
// TODO: use in other places
export function makeElement(tagName, attrs, content?): HTMLElement {
  let el: HTMLElement = document.createElement(tagName)

  if (attrs) {
    for (let attrName in attrs) {
      if (attrName === 'className' || attrName === 'colSpan' || attrName === 'rowSpan') {
        el[attrName] = attrs[attrName]
      } else {
        el.setAttribute(attrName, attrs[attrName])
      }
    }
  }

  appendContentTo(el, content)

  return el
}

export type ElementContent = string | Node | Node[]

export function appendContentTo(el: HTMLElement, content: ElementContent) {
  if (typeof content === 'string') {
    el.innerHTML = content
  } else if (content instanceof Node) {
    el.appendChild(content)
  } else if (content && content.length) {
    for (let i = 0; i < content.length; i++) {
      el.appendChild(content[i])
    }
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

export function findElsWithin(container: HTMLElement, selector: string): HTMLElement[] {
  return Array.prototype.slice.call(
    container.querySelectorAll(selector)
  )
}

export function removeElement(el: HTMLElement) {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}
