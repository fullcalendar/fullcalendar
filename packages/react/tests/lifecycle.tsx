/// <reference types="vitest/globals" />
import React, { Activity, Suspense, StrictMode, act, createRef } from 'react'
import { render as rtlRender } from '@testing-library/react'

/*
React lifecycle cases the vanilla specs can't reach: Strict Mode replays, <Activity>, Suspense.
Only works on build dist code!
*/
import FullCalendar from '../dist/index'
import dayGridPlugin from '../dist/daygrid'
import timeGridPlugin from '../dist/timegrid'

const OPTIONS = {
  plugins: [dayGridPlugin, timeGridPlugin],
  initialView: 'timeGridWeek',
  nowIndicator: true, // a second timer, on top of the calendar's own day timer
}

// Long-timer tracking
// -------------------------------------------------------------------------------------------------
// FullCalendar's now-timers wait up to a day. Counting only timers of 1s or more ignores React's
// own scheduling and test utilities

let liveLongTimers: Set<unknown>
let origSetTimeout: typeof setTimeout
let origClearTimeout: typeof clearTimeout

beforeEach(() => {
  liveLongTimers = new Set()
  origSetTimeout = globalThis.setTimeout
  origClearTimeout = globalThis.clearTimeout

  globalThis.setTimeout = ((callback: (...args: any[]) => void, ms = 0, ...args: any[]) => {
    const id = origSetTimeout(() => {
      liveLongTimers.delete(id)
      callback(...args)
    }, ms)

    if (ms >= 1000) {
      liveLongTimers.add(id)
    }

    return id
  }) as typeof setTimeout

  globalThis.clearTimeout = ((id: any) => {
    liveLongTimers.delete(id)
    origClearTimeout(id)
  }) as typeof clearTimeout
})

afterEach(() => {
  // clear leftovers, so a leaking spec doesn't keep the test process alive
  for (const id of liveLongTimers) {
    origClearTimeout(id as any)
  }

  globalThis.setTimeout = origSetTimeout
  globalThis.clearTimeout = origClearTimeout
})

function waitReal(ms: number): Promise<void> {
  return new Promise((resolve) => origSetTimeout(resolve, ms))
}

const neverResolves = new Promise(() => {})

function Suspender(): React.ReactNode {
  throw neverResolves
}

const EVENTS = [{ id: '1', title: 'original', start: '2024-01-15T10:00:00' }] // stable

// Specs
// -------------------------------------------------------------------------------------------------
// Each runs twice: plainly, and in Strict Mode, which mounts, unmounts and mounts again on first
// render, and invokes render twice. Remounts are what <Activity> does too

describe.each([
  { mode: 'normally', isStrict: false },
  { mode: 'in Strict Mode', isStrict: true },
])('$mode', ({ isStrict }) => {
  const renderFactor = isStrict ? 2 : 1 // Strict Mode invokes each render twice

  function render(ui: React.ReactElement) {
    return rtlRender(ui, { wrapper: isStrict ? StrictMode : undefined })
  }

  it('clears its long timers on unmount', () => {
    const { unmount } = render(<FullCalendar {...OPTIONS} />)

    expect(liveLongTimers.size).toBe(2) // the calendar's day timer and the now-indicator's

    unmount()
    expect(liveLongTimers.size).toBe(0)
  })

  // #8112 bug 1: hiding runs the cleanups, then a re-render while hidden re-armed the timers, and
  // removing the hidden calendar ran no cleanup. The timers kept the calendar alive forever
  it('#8112: hiding in <Activity>, re-rendering, then unmounting leaves no long timers', () => {
    function App({ isShown, revision }: { isShown: boolean, revision: number }) {
      return (
        <Activity mode={isShown ? 'visible' : 'hidden'}>
          <FullCalendar
            {...OPTIONS}
            plugins={[...OPTIONS.plugins]} // a new array each render, like an inline prop would be
            dayCellClass={`revision-${revision}`}
          />
        </Activity>
      )
    }

    const { rerender, unmount } = render(<App isShown revision={0} />)
    expect(liveLongTimers.size).toBe(2)

    rerender(<App isShown={false} revision={0} />)
    expect(liveLongTimers.size).toBe(0)

    rerender(<App isShown={false} revision={1} />)
    expect(liveLongTimers.size).toBe(0)

    rerender(<App isShown revision={1} />)
    expect(liveLongTimers.size).toBe(2)

    rerender(<App isShown={false} revision={1} />)
    unmount()
    expect(liveLongTimers.size).toBe(0)
  })

  // a render discarded because a sibling suspended must not arm timers, which nothing would clear
  it('#8092: a render discarded by Suspense leaves no long timers', async () => {
    const { unmount } = render(
      <Suspense fallback={<div>loading</div>}>
        <FullCalendar {...OPTIONS} />
        <Suspender />
      </Suspense>,
    )

    await act(async () => {})
    expect(liveLongTimers.size).toBe(0)

    unmount()
    expect(liveLongTimers.size).toBe(0)
  })

  // #8092: an async fetch started by a discarded render delivered its result to a component that never
  // mounted. React warned "Can't perform a React state update on a component that hasn't mounted yet"
  it('#8092: an async fetch from a render discarded by Suspense updates nothing', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      const { unmount } = render(
        <Suspense fallback={<div>loading</div>}>
          <FullCalendar
            {...OPTIONS}
            events={(_info, successCallback) => {
              origSetTimeout(() => successCallback([]), 10)
            }}
          />
          <Suspender />
        </Suspense>,
      )

      await act(() => waitReal(50))
      unmount()

      expect(consoleErrorSpy.mock.calls.map(String).join('\n')).not.toMatch(/state update/i)
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })

  it('renders the events of an async fetch that resolves after mount', async () => {
    const { container, unmount } = render(
      <FullCalendar
        {...OPTIONS}
        initialDate="2024-01-15"
        events={(_info, successCallback) => {
          origSetTimeout(() => successCallback(EVENTS), 10)
        }}
      />,
    )

    expect(container.textContent).not.toContain('original')
    await act(() => waitReal(50))
    expect(container.textContent).toContain('original')

    unmount()
  })

  // a change made while hidden is applied when shown, from a layout effect, where React forbids
  // flushSync. The render that shows the calendar already has the change, so no second render follows
  it('applies an event change made while hidden in <Activity> when shown, in one render, without flushSync', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const calendarRef = createRef<any>()
    let rootRenderCnt = 0
    const rootClass = () => { // the root's class callback runs once per render of the calendar
      rootRenderCnt++
      return ''
    }

    function App({ isShown }: { isShown: boolean }) {
      return (
        <Activity mode={isShown ? 'visible' : 'hidden'}>
          <FullCalendar
            {...OPTIONS}
            ref={calendarRef}
            initialDate="2024-01-15"
            events={EVENTS}
            class={rootClass}
          />
        </Activity>
      )
    }

    try {
      const { rerender, container, unmount } = render(<App isShown />)
      const calendarApi = calendarRef.current.getApi()

      rerender(<App isShown={false} />)
      act(() => {
        calendarApi.getEventById('1').setProp('title', 'changed')
      })
      rootRenderCnt = 0
      rerender(<App isShown />)

      expect(container.textContent).toContain('changed')
      expect(rootRenderCnt).toBe(renderFactor)
      expect(consoleErrorSpy.mock.calls.map(String).join('\n')).not.toMatch(/flushSync/)
      unmount()
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })

  // with no parent render to pick it up, showing the calendar catches up on the change itself
  it('applies an event change made while hidden in <Activity> when shown without a parent render', () => {
    const calendarRef = createRef<any>()
    let setIsShown: (isShown: boolean) => void
    const calendarEl = ( // the same element each render, so React can skip re-rendering it
      <FullCalendar {...OPTIONS} ref={calendarRef} initialDate="2024-01-15" events={EVENTS} />
    )

    function App() {
      const [isShown, _setIsShown] = React.useState(true)
      setIsShown = _setIsShown
      return <Activity mode={isShown ? 'visible' : 'hidden'}>{calendarEl}</Activity>
    }

    const { container, unmount } = render(<App />)
    const calendarApi = calendarRef.current.getApi()

    act(() => setIsShown(false))
    act(() => {
      calendarApi.getEventById('1').setProp('title', 'changed')
    })
    act(() => setIsShown(true))

    expect(container.textContent).toContain('changed')
    unmount()
  })

  // a day that passed while hidden refreshes "today" when shown
  it('refreshes today when shown in <Activity> after the day changed while hidden', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2024-01-15T12:00:00'))

    function App({ isShown }: { isShown: boolean }) {
      return (
        <Activity mode={isShown ? 'visible' : 'hidden'}>
          <FullCalendar {...OPTIONS} initialView="dayGridMonth" initialDate="2024-01-15" />
        </Activity>
      )
    }

    try {
      const { rerender, container, unmount } = render(<App isShown />)
      expect(container.querySelector('[aria-current="date"]')?.getAttribute('data-date')).toBe('2024-01-15')

      rerender(<App isShown={false} />)
      vi.setSystemTime(new Date('2024-01-16T12:00:00'))
      rerender(<App isShown />)

      expect(container.querySelector('[aria-current="date"]')?.getAttribute('data-date')).toBe('2024-01-16')
      unmount()
    } finally {
      vi.useRealTimers()
    }
  })
})
