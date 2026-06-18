import React, {
  PropsWithoutRef,
  Ref,
  FunctionComponent,
  forwardRef,
  useState,
  useEffect,
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

  function handleDataChange(_data: CalendarData, actions: Action[]) {
    (needsSyncRender(actions) ? flushSync : runNormal)(() => {
      setRevision(guid())
    })
  }

  const [calendarApi] = useState(() => new CalendarApiImpl())
  const [calendarDataManager] = useState(() => new CalendarDataManager({
    calendarApi,
    onDataChange: handleDataChange,
  }))

  useEffect(() => { // Cleanup on unmount
    return () => {
      calendarDataManager.destroy()
    }
  }, [])

  useImperativeHandle(ref, () => ({
    getApi: () => calendarApi
  }), [])

  const data = calendarDataManager.update(props)

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
