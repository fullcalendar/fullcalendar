import { afterEach, describe, expect, it } from 'vitest'
import * as vdom from 'fullcalendar/preact'
import dayGridPlugin from 'fullcalendar/daygrid'
import timeGridPlugin from 'fullcalendar/timegrid'
import multiMonthPlugin from 'fullcalendar/multimonth'
import classicThemePlugin from 'fullcalendar/themes/classic'
import testPlugin from '../lib/test-plugin'
import { appendTestElement } from '../lib/calendar'
import { queryPart } from '../lib/models/events'
import { getRectCenter, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'
import { isForceReact } from '../lib/env'

/*
#8112 bug 2: a grid shown again by a React <Activity> jumped back to its initial scroll, because
<Activity> mounts the same component instance again.
<Activity> is React only, so these run only against the React-rendering builds (FORCE_REACT=1).
*/
describe.skipIf(!isForceReact)('scroll position across a hidden <Activity>', () => {
  const react = vdom as any
  let root: any

  afterEach(() => {
    root?.unmount()
    root = undefined
  })

  const VIEWS = [
    {
      name: 'dayGrid',
      options: {
        initialView: 'dayGridYear', // tall enough to scroll
        initialDate: '2024-01-03', // in the first row, so the initial scroll is to the top
      },
      partInScroller: 'dayCell',
    },
    {
      name: 'timeGrid',
      options: {
        initialView: 'timeGridWeek',
        initialDate: '2024-01-03',
        scrollTime: '00:00', // the initial scroll is to the top
      },
      partInScroller: 'slotLane',
    },
    {
      name: 'multiMonth',
      options: {
        initialView: 'multiMonthYear',
        initialDate: '2024-01-03', // in the first month, so the initial scroll is to the top
        multiMonthMaxColumns: 1, // tall enough to scroll
      },
      partInScroller: 'singleMonth',
    },
  ]

  for (const view of VIEWS) {
    it(`keeps where the user scrolled a ${view.name}`, async () => {
      await testScrollAcrossActivity(view.options, view.partInScroller, false)
    })

    // Strict Mode mounts, unmounts and mounts again first, so the first mount isn't the only mount
    it(`keeps where the user scrolled a ${view.name}, in Strict Mode`, async () => {
      await testScrollAcrossActivity(view.options, view.partInScroller, true)
    })
  }

  async function testScrollAcrossActivity(
    calendarOptions: object,
    partInScroller: string,
    isStrict: boolean,
  ) {
    const containerEl = appendTestElement(document.createElement('div'))
    containerEl.style.width = '600px'
    root = react.createRoot(containerEl)

    function renderInActivity(mode: 'visible' | 'hidden') {
      const activityEl = react.createElement(react.Activity, { mode },
        react.createElement(react.FullCalendar, {
          plugins: [dayGridPlugin, timeGridPlugin, multiMonthPlugin, classicThemePlugin, testPlugin],
          timeZone: 'UTC',
          height: 250,
          ...calendarOptions,
        }),
      )

      react.flushSync(() => {
        root.render(isStrict ? react.createElement(react.StrictMode, null, activityEl) : activityEl)
      })
    }

    renderInActivity('visible')
    await waitForSettle()

    const scrollerEl = findScroller(queryPart(containerEl, partInScroller)!)
    expect(scrollerEl.scrollTop).toBe(0) // the initial scroll

    // the user's scroll. FullCalendar records it when the scroll ends, after its debounce
    const scrollStopped = waitForScrollStop(scrollerEl, 700)
    await pointer.wheel(getRectCenter(scrollerEl.getBoundingClientRect()), 80)
    await scrollStopped
    const scrolledTop = scrollerEl.scrollTop
    expect(scrolledTop).toBeGreaterThan(0)

    renderInActivity('hidden')
    await waitForSettle()
    renderInActivity('visible')
    await waitForSettle()

    expect(scrollerEl.scrollTop).toBe(scrolledTop)
  }
})

function findScroller(innerEl: HTMLElement): HTMLElement {
  for (let el = innerEl.parentElement; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el)

    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      return el
    }
  }
  throw new Error('No vertical scroller')
}

/*
Resolves once scroll events have stopped for `quietMs`. FullCalendar ends a wheel scroll 500ms after
the last wheel event, a long timer that waitForSettle() doesn't wait on, so a quietMs above that
waits for FullCalendar's scroll end, and one well below it doesn't
*/
function waitForScrollStop(scrollerEl: HTMLElement, quietMs: number): Promise<void> {
  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout>

    function handleScroll() {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        scrollerEl.removeEventListener('scroll', handleScroll)
        resolve()
      }, quietMs)
    }

    scrollerEl.addEventListener('scroll', handleScroll)
  })
}
