import { FullCalendarElement } from './FullCalendarElement'

export function defineFullCalendarElement(tagName: string = 'full-calendar'): void {
  customElements.define(tagName, FullCalendarElement)
}

export { FullCalendarElement }
export * from '@fullcalendar/common'
