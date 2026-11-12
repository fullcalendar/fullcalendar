import React, {
  PropsWithoutRef,
  Ref,
  FunctionComponent,
  forwardRef,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
} from 'react'
import { flushSync } from 'react-dom'
import { CalendarDataManager } from './reducers/CalendarDataManager'
import { CalendarOptions } from './options'
import { CalendarApiImpl } from './api/CalendarApiImpl'
import { CalendarApi } from './api/CalendarApi'
import { CalendarMediaRoot, computeRootClassName } from './calendar-root'
import { CalendarInner } from './CalendarInner'
import { CalendarData } from './reducers/data-types'
import { Action } from './reducers/Action'
import { guid } from './util/misc'
import { warn } from './util/warn'

export interface CalendarRef {
  getApi(): CalendarApi
}

type CalendarPropsInternal = CalendarOptions & { id?: string }
export type CalendarProps = PropsWithoutRef<CalendarPropsInternal> & { ref?: Ref<CalendarRef> }

export const Calendar: FunctionComponent<CalendarProps> = forwardRef<CalendarRef, CalendarPropsInternal>((props, ref) => {
  const baseId = useStableId(props.id) // for DOM ids

  const [_revision, setRevision] = useState('')

  // Data changes from async work (fetches, timers) re-render only while mounted. A render React
  // discards (a suspended Suspense boundary) never mounts, and updating it would warn (#8092).
  // Changes made while not mounted, before the first mount or while hidden in <Activity>, are
  // caught up on mount. Paired with this render's handleDataChange, which the manager keeps
  const isMountedRef = useRef(false)
  const renderedDataRef = useRef<CalendarData | null>(null)

  function handleDataChange(_data: CalendarData, actions: Action[]) {
    if (isMountedRef.current) {
      (needsSyncRender(actions) ? flushSync : runNormal)(() => {
        setRevision(guid())
      })
    }
  }

  const [calendarApi] = useState(() => new CalendarApiImpl())
  const [calendarDataManager] = useState(() => new CalendarDataManager({
    calendarApi,
    onDataChange: handleDataChange,
  }))

  // Mount and unmount. Runs again for remounts (Strict Mode, a shown <Activity>). Layout timing, so
  // catching up renders before paint
  useIsomorphicLayoutEffect(() => {
    isMountedRef.current = true
    calendarDataManager.mount() // the timer starts only now (#8112)

    // a change since the data this commit rendered, made while not mounted. A change already in
    // the rendered data, such as one picked up by the render that shows an <Activity>, needs nothing
    if (calendarDataManager.getCurrentData() !== renderedDataRef.current) {
      setRevision(guid()) // not flushSync, which React forbids during a commit
    }

    return () => {
      isMountedRef.current = false
      calendarDataManager.destroy()
    }
  }, [])

  useImperativeHandle(ref, () => ({
    getApi: () => calendarApi
  }), [])

  const data = calendarDataManager.update(props)
  renderedDataRef.current = data

  return (
    <CalendarMediaRoot emitter={data.emitter}>
      {(forPrint: boolean) => {
        const options = data.calendarOptions
        const isRtl = options.direction === 'rtl'
        const className = computeRootClassName(options, forPrint)

        return (
          <div
            dir={isRtl ? 'rtl' : undefined}
            className={className}
            style={{ height: options.height }}
            data-color-scheme={options.colorScheme || undefined}
          >
            <CalendarInner {...data} baseId={baseId} forPrint={forPrint} />
          </div>
        )
      }}
    </CalendarMediaRoot>
  )
})

function needsSyncRender(actions: Action[]): boolean {
  for (const action of actions) {
    if (
      action.type === 'SET_EVENT_DRAG' ||
      action.type === 'UNSET_EVENT_DRAG' ||
      action.type === 'SET_EVENT_RESIZE' ||
      action.type === 'UNSET_EVENT_RESIZE' ||
      // could happen as a result of a drag or resize and must be part of same sync pipeline
      action.type === 'MERGE_EVENTS'
    ) {
      return true
    }
  }
  return false
}

function runNormal(f: () => void) {
  f()
}

// useLayoutEffect warns during server rendering in React 18 and earlier
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

let warnedStableId = false

function useStableId(fallbackId: string | undefined): string {
  // React >= 18
  // During runtime, will not change
  if (React.useId) {
    return React.useId()
  }

  // Must always execute, regardless of fallbackId, because of hook rules
  const [uid] = useState(() => guid())

  if (fallbackId) {
    return fallbackId + ':'
  }

  if (!warnedStableId) {
    warnedStableId = true
    warn('Missing `id` prop. Provide one for better SSR support in React 17.')
  }

  return `fc:${uid}:`
}
