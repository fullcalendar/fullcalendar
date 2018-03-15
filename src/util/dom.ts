
// TODO: use in other places
export function makeElement(tagName, attrs, innerHtml?): HTMLElement {
  let el: HTMLElement = document.createElement(tagName)

  for (let attrName in attrs) {
    if (attrName === 'className') {
      el.className = attrs[attrName]
    } else {
      el.setAttribute(attrName, attrs[attrName])
    }
  }

  if (typeof innerHtml === 'string') {
    el.innerHTML = innerHtml
  }

  return el
}

export function htmlToElement(htmlString): HTMLElement {
  let div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstChild as HTMLElement
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
