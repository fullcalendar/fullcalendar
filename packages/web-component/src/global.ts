import { FullCalendarElement } from './FullCalendarElement.js'

declare global {
  interface HTMLElementTagNameMap {
    'full-calendar': FullCalendarElement
  }
}

customElements.define('full-calendar', FullCalendarElement)
