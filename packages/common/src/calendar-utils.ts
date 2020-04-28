import { PointerDragEvent } from './interactions/pointer'
import { buildDateSpanApi, DateSpanApi, DatePointApi, DateSpan, buildDatePointApi } from './structs/date-span'
import { CalendarContext } from './CalendarContext'
import { __assign } from 'tslib'
import { ViewApi } from './ViewApi'
import { DateMarker, startOfDay } from './datelib/marker'


export interface DateClickApi extends DatePointApi {
  dayEl: HTMLElement
  jsEvent: UIEvent
  view: ViewApi
}

export interface DateSelectionApi extends DateSpanApi {
  jsEvent: UIEvent
  view: ViewApi
}

export type DatePointTransform = (dateSpan: DateSpan, context: CalendarContext) => any
export type DateSpanTransform = (dateSpan: DateSpan, context: CalendarContext) => any

export type CalendarInteraction = { destroy() }
export type CalendarInteractionClass = { new(context: CalendarContext): CalendarInteraction }

export type OptionChangeHandler = (propValue: any, context: CalendarContext) => void
export type OptionChangeHandlerMap = { [propName: string]: OptionChangeHandler }


export function triggerDateSelect(selection: DateSpan, pev: PointerDragEvent | null, context: CalendarContext & { viewApi?: ViewApi }) {
  const arg = {
    ...buildDateSpanApiWithContext(selection, context),
    jsEvent: pev ? pev.origEvent as MouseEvent : null, // Is this always a mouse event? See #4655
    view: context.viewApi || context.calendarApi.view
  }

  context.emitter.trigger('select', arg)
}


export function triggerDateUnselect(pev: PointerDragEvent | null, context: CalendarContext & { viewApi?: ViewApi }) {
  context.emitter.trigger('unselect', {
    jsEvent: pev ? pev.origEvent : null,
    view: context.viewApi || context.calendarApi.view
  })
}


// TODO: receive pev?
export function triggerDateClick(dateSpan: DateSpan, dayEl: HTMLElement, ev: UIEvent, context: CalendarContext & { viewApi?: ViewApi }) {
  const arg = {
    ...buildDatePointApiWithContext(dateSpan, context),
    dayEl,
    jsEvent: ev as MouseEvent, // Is this always a mouse event? See #4655
    view: context.viewApi || context.calendarApi.view
  }

  context.emitter.trigger('dateClick', arg)
}


export function buildDatePointApiWithContext(dateSpan: DateSpan, context: CalendarContext) {
  let props = {} as DatePointApi

  for (let transform of context.pluginHooks.datePointTransforms) {
    __assign(props, transform(dateSpan, context))
  }

  __assign(props, buildDatePointApi(dateSpan, context.dateEnv))

  return props
}


export function buildDateSpanApiWithContext(dateSpan: DateSpan, context: CalendarContext) {
  let props = {} as DateSpanApi

  for (let transform of context.pluginHooks.dateSpanTransforms) {
    __assign(props, transform(dateSpan, context))
  }

  __assign(props, buildDateSpanApi(dateSpan, context.dateEnv))

  return props
}


// Given an event's allDay status and start date, return what its fallback end date should be.
// TODO: rename to computeDefaultEventEnd
export function getDefaultEventEnd(allDay: boolean, marker: DateMarker, context: CalendarContext): DateMarker {
  let { dateEnv, computedOptions } = context
  let end = marker

  if (allDay) {
    end = startOfDay(end)
    end = dateEnv.add(end, computedOptions.defaultAllDayEventDuration)
  } else {
    end = dateEnv.add(end, computedOptions.defaultTimedEventDuration)
  }

  return end
}
