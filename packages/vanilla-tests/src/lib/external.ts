import { appendTestElement } from './calendar'
import { assertPointHits } from './models/events'
import { getRectCenter, Point, pointer } from './pointer'
import { waitForSettle } from './settle'

/*
An element outside the calendar to drag in, below the calendar. Teardown removes it.
*/
export function createExternalEl(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('div')
  el.textContent = 'external'
  el.style.width = '200px'
  el.style.padding = '4px'

  for (const name in attrs) {
    el.setAttribute(name, attrs[name])
  }

  return appendTestElement(el)
}

/*
Drags the element and releases at the point computed by `drop` (after the press).
*/
export async function dragExternalEl(el: HTMLElement, drop: () => Point): Promise<void> {
  el.scrollIntoView({ block: 'nearest' })
  const start = getRectCenter(el.getBoundingClientRect())
  assertPointHits(start, el, 'the external element')
  await pointer.press(start, async () => {
    await pointer.move(drop())
    await waitForSettle()
  })
  await waitForSettle()
}
