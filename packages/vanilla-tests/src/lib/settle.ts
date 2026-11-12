import { whenSettled } from 'fullcalendar/protected-api'

/*
Resolves once every calendar has finished the rendering it has started: ResizeObserver-driven
re-renders, animation-frame and short-timer work, and drag-mirror cleanup.
Long timers (now-indicator, scroll-end debounce, long-press delay) and drag auto-scrolling
aren't waited on.
*/
export function waitForSettle(): Promise<void> {
  return whenSettled()
}
