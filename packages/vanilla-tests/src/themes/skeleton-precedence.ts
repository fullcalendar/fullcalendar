import { describe, expect, it, onTestFinished } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryPart } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
The skeleton CSS's stacking order is FullCalendar's: an app's class on a hook element can't change it.
The app's CSS here is unlayered and comes after the skeleton, the case where a plain rule would win.
*/

function injectCss(cssText: string): void {
  const styleEl = document.createElement('style')
  styleEl.textContent = cssText
  document.head.appendChild(styleEl)
  onTestFinished(() => {
    styleEl.remove()
  })
}

describe('skeleton CSS z-index', () => {
  it.each([
    ['a fixed height', { height: 1000 }, '1'],
    ['a sticky header', { height: 'auto' as const }, '3'], // --fc-sticky-header-footer-z
  ])('with %s, keeps the time grid header\'s z-index over an app class', async (_desc, extraOptions, expectedZIndex) => {
    injectCss('.test-raised-header { position: relative; z-index: 10 }')
    const calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2023-04-12',
      tableHeaderClass: 'test-raised-header',
      ...extraOptions,
    })
    await waitForSettle()

    const headerEl = queryPart(calendar.el, 'tableHeader')!
    expect(headerEl.classList).toContain('test-raised-header')
    expect(getComputedStyle(headerEl).zIndex).toBe(expectedZIndex)
  })
})
