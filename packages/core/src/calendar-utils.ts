import { PointerDragEvent } from './interactions/pointer'
import { buildDateSpanApi, DateSpanApi, DatePointApi, DateSpan, buildDatePointApi } from './structs/date-span'
import { ReducerContext } from './reducers/ReducerContext'
import { __assign } from 'tslib'
import { ViewApi } from './ViewApi'


export interface DateClickApi extends DatePointApi {
  dayEl: HTMLElement
  jsEvent: UIEvent
  view: ViewApi
}

export interface DateSelectionApi extends DateSpanApi {
  jsEvent: UIEvent
  view: ViewApi
}

export type DatePointTransform = (dateSpan: DateSpan, context: ReducerContext) => any
export type DateSpanTransform = (dateSpan: DateSpan, context: ReducerContext) => any

export type CalendarInteraction = { destroy() }
export type CalendarInteractionClass = { new(context: ReducerContext): CalendarInteraction }

export type OptionChangeHandler = (propValue: any, context: ReducerContext) => void
export type OptionChangeHandlerMap = { [propName: string]: OptionChangeHandler }


export function triggerDateSelect(selection: DateSpan, pev: PointerDragEvent | null, context: ReducerContext & { viewApi?: ViewApi }) {
  const arg = {
    ...buildDateSpanApiWithContext(selection, context),
    jsEvent: pev ? pev.origEvent as MouseEvent : null, // Is this always a mouse event? See #4655
    view: context.viewApi || context.calendar.view
  }

  context.emitter.trigger('select', arg)
}


export function triggerDateUnselect(pev: PointerDragEvent | null, context: ReducerContext & { viewApi?: ViewApi }) {
  context.emitter.trigger('unselect', {
    jsEvent: pev ? pev.origEvent : null,
    view: context.viewApi || context.calendar.view
  })
}


// TODO: receive pev?
export function triggerDateClick(dateSpan: DateSpan, dayEl: HTMLElement, ev: UIEvent, context: ReducerContext & { viewApi?: ViewApi }) {
  const arg = {
    ...buildDatePointApiWithContext(dateSpan, context),
    dayEl,
    jsEvent: ev as MouseEvent, // Is this always a mouse event? See #4655
    view: context.viewApi || context.calendar.view
  }

  context.emitter.trigger('dateClick', arg)
}


export function buildDatePointApiWithContext(dateSpan: DateSpan, context: ReducerContext) {
  let props = {} as DatePointApi

  for (let transform of context.pluginHooks.datePointTransforms) {
    __assign(props, transform(dateSpan, context))
  }

  __assign(props, buildDatePointApi(dateSpan, context.dateEnv))

  return props
}


export function buildDateSpanApiWithContext(dateSpan: DateSpan, context: ReducerContext) {
  let props = {} as DateSpanApi

  for (let transform of context.pluginHooks.dateSpanTransforms) {
    __assign(props, transform(dateSpan, context))
  }

  __assign(props, buildDateSpanApi(dateSpan, context.dateEnv))

  return props
}
