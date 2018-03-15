
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
