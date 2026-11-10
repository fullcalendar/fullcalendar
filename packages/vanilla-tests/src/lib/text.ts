import { expect } from 'vitest'
import classNames from 'fullcalendar/protected-styles'

/*
Screen-reader-only text elements (visually hidden, but read aloud) within the element.
*/
export function getScreenReaderEls(el: Element): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>('.' + classNames.srOnly))
}

/*
The element's text, minus screen-reader-only text.
*/
export function getVisibleText(el: Element): string {
  const clone = el.cloneNode(true) as HTMLElement

  for (const srEl of getScreenReaderEls(clone)) {
    srEl.remove()
  }

  return clone.textContent!
}

/*
Screen readers read the visually hidden text. The visible content is aria-hidden, and so is its
wrapper, otherwise screen readers find an empty group.
*/
export function expectScreenReaderText(headerEl: Element, text: string): void {
  const srEls = getScreenReaderEls(headerEl)
  expect(srEls.map((el) => el.textContent)).toEqual([text])
  expect(headerEl.hasAttribute('aria-label')).toBe(false)

  for (const childEl of Array.from(headerEl.children)) {
    if (childEl !== srEls[0]) {
      expect(childEl.getAttribute('aria-hidden')).toBe('true')
    }
  }
}
