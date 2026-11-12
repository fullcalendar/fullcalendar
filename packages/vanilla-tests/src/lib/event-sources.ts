import { Calendar } from 'fullcalendar'
import { getElEventRange } from 'fullcalendar/protected-api'
import { waitForSettle } from './settle'
import { getEventEls } from './models/events'

/*
Resolves when the calendar next finishes loading (its `loading` callback is called with false),
then waits for the resulting render to settle.
Call it before the action that starts the fetch, or right after, as long as the fetch is async.
*/
export async function whenLoaded(calendar: Calendar): Promise<void> {
  await new Promise<void>((resolve) => {
    const handler = (isLoading: boolean) => {
      if (!isLoading) {
        calendar.off('loading', handler)
        resolve()
      }
    }
    calendar.on('loading', handler)
  })
  await waitForSettle()
}

export interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason: unknown) => void
}

/*
A promise the test resolves itself. For async event-source callbacks whose timing the test controls.
*/
export function createDeferred<T = void>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/*
The titles of the rendered events (one per segment, mirrors excluded), sorted. Read from each element's
event rather than its text, which also has the time.
*/
export function getRenderedEventTitles(root: ParentNode): string[] {
  return getEventEls(root).map((el) => getElEventRange(el)!.def.title).sort()
}
