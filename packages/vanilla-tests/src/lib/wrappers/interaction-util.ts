import { Calendar } from 'fullcalendar'
import type { CalendarListeners } from 'fullcalendar/protected-api'

export function waitEventDrag(calendar: Calendar, dragging: Promise<any> | (() => Promise<any>)) {
  return waitForDragOutcome(calendar, dragging, 'eventDrop', '_noEventDrop', (info) => info)
}

export function waitEventResize(calendar: Calendar, dragging: Promise<any> | (() => Promise<any>)) {
  return waitForDragOutcome(calendar, dragging, 'eventResize', null, (info) => info)
}

export function waitDateSelect(calendar: Calendar, dragging: Promise<any> | (() => Promise<any>)) {
  return waitForDragOutcome(calendar, dragging, 'select', '_noDateSelect' as keyof CalendarListeners, (info) => info)
}

function waitForDragOutcome<T>(
  calendar: Calendar,
  dragging: Promise<any> | (() => Promise<any>),
  successEventName: keyof CalendarListeners,
  failureEventName: keyof CalendarListeners | null,
  transform: (info: any) => T,
) {
  return new Promise<T | false>((resolve, reject) => {
    let isDragDone = false
    let hasOutcome = false
    let outcome: T | false = false
    let timeoutId: number | null = null

    const cleanup = () => {
      calendar.off(successEventName, onSuccess)

      if (failureEventName) {
        calendar.off(failureEventName, onFailure)
      }

      if (timeoutId != null) {
        clearTimeout(timeoutId)
      }
    }

    const flush = () => {
      if (isDragDone && hasOutcome) {
        cleanup()
        resolve(outcome)
      }
    }

    const onSuccess = (info) => {
      hasOutcome = true
      outcome = transform(info)
      flush()
    }

    const onFailure = () => {
      hasOutcome = true
      outcome = false
      flush()
    }

    calendar.on(successEventName, onSuccess)

    if (failureEventName) {
      calendar.on(failureEventName, onFailure)
    }

    const draggingPromise = typeof dragging === 'function' ? dragging() : dragging

    draggingPromise.then(() => {
      isDragDone = true

      timeoutId = window.setTimeout(() => {
        cleanup()
        reject(new Error('Timed out waiting for drag outcome'))
      }, 1000)

      flush()
    }, (error) => {
      cleanup()
      reject(error)
    })
  })
}
