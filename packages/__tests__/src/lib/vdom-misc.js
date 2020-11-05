import { render, createElement, unmountComponentAtNode } from '@fullcalendar/common'

// render then quickly unrender a vdom node in a real HTML element.
// causes the given vdom's global handlers to attach.
export function primeVDomContainer(rootEl) {
  render(createElement('div', {}), rootEl)
  unmountComponentAtNode(rootEl)
}
