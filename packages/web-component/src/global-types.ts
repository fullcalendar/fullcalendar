import { type FullCalendarElement } from './FullCalendarElement'

type FullCalendarElementType = typeof FullCalendarElement

declare global {
  // (extensions to globalThis must use `var`)
  // eslint-disable-next-line no-var
  var FullCalendarElement: FullCalendarElementType

  interface HTMLElementTagNameMap {
    'full-calendar': FullCalendarElement
  }
}
