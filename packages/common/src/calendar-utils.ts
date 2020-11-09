import { __assign } from 'tslib'
import { PointerDragEvent } from './interactions/pointer'
import { buildDateSpanApi, DateSpanApi, DatePointApi, DateSpan } from './structs/date-span'
import { CalendarContext } from './CalendarContext'
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

export type CalendarInteraction = { destroy: () => void }
export type CalendarInteractionClass = { new(context: CalendarContext): CalendarInteraction }

export type OptionChangeHandler = (propValue: any, context: CalendarContext) => void
export type OptionChangeHandlerMap = { [propName: string]: OptionChangeHandler }

export interface DateSelectArg extends DateSpanApi {
  jsEvent: MouseEvent | null
  view: ViewApi
}

export function triggerDateSelect(selection: DateSpan, pev: PointerDragEvent | null, context: CalendarContext & { viewApi?: ViewApi }) {
  context.emitter.trigger('select', {
    ...buildDateSpanApiWithContext(selection, context),
    jsEvent: pev ? pev.origEvent as MouseEvent : null, // Is this always a mouse event? See #4655
    view: context.viewApi || context.calendarApi.view,
  } as DateSelectArg)
}

export interface DateUnselectArg {
  jsEvent: MouseEvent
  view: ViewApi
}

export function triggerDateUnselect(pev: PointerDragEvent | null, context: CalendarContext & { viewApi?: ViewApi }) {
  context.emitter.trigger('unselect', {
    jsEvent: pev ? pev.origEvent : null,
    view: context.viewApi || context.calendarApi.view,
  } as DateUnselectArg)
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
  let { dateEnv, options } = context
  let end = marker

  if (allDay) {
    end = startOfDay(end)
    end = dateEnv.add(end, options.defaultAllDayEventDuration)
  } else {
    end = dateEnv.add(end, options.defaultTimedEventDuration)
  }

  return end
}
