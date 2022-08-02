import { FullCalendarElement } from './FullCalendarElement'

export function install(tagName: string = 'full-calendar'): void {
  customElements.define(tagName, FullCalendarElement)
}
