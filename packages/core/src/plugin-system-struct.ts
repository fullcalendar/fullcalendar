import { reducerFunc } from './reducers/types'
import { eventDefParserFunc } from './structs/event'
import { eventDefMutationApplier } from './structs/event-mutation'
import { DatePointTransform, DateSpanTransform, CalendarInteractionClass, OptionChangeHandlerMap } from './calendar-utils'
import { ViewConfigInputHash } from './structs/view-config'
import { ViewSpec } from './structs/view-spec'
import { ViewProps } from './View'
import { CalendarComponentProps } from './CalendarComponent'
import { ReducerContext } from './reducers/ReducerContext'
import { isPropsValidTester } from './structs/constraint'
import { eventDragMutationMassager, eventIsDraggableTransformer, EventDropTransformers } from './interactions/event-dragging'
import { dateSelectionJoinTransformer } from './interactions/date-selecting'
import { EventResizeJoinTransforms } from './interactions/event-resizing'
import { ExternalDefTransform } from './interactions/external-element-dragging'
import { InteractionClass } from './interactions/interaction'
import { ThemeClass } from './theme/Theme'
import { EventSourceDef } from './structs/event-source-def'
import { CmdFormatterFunc } from './datelib/DateFormatter'
import { RecurringType } from './structs/recurring-event'
import { NamedTimeZoneImplClass } from './datelib/timezone'
import { ElementDraggingClass } from './interactions/ElementDragging'
import { ComponentChildren } from './vdom'
import { ScrollGridImpl } from './scrollgrid/ScrollGridImpl'
import { ContentTypeHandlers } from './common/render-hook'

// TODO: easier way to add new hooks? need to update a million things

export interface PluginDefInput {
  deps?: PluginDef[]
  reducers?: reducerFunc[]
  eventDefParsers?: eventDefParserFunc[]
  isDraggableTransformers?: eventIsDraggableTransformer[]
  eventDragMutationMassagers?: eventDragMutationMassager[]
  eventDefMutationAppliers?: eventDefMutationApplier[]
  dateSelectionTransformers?: dateSelectionJoinTransformer[]
  datePointTransforms?: DatePointTransform[]
  dateSpanTransforms?: DateSpanTransform[]
  views?: ViewConfigInputHash
  viewPropsTransformers?: ViewPropsTransformerClass[]
  isPropsValid?: isPropsValidTester
  externalDefTransforms?: ExternalDefTransform[]
  eventResizeJoinTransforms?: EventResizeJoinTransforms[]
  viewContainerAppends?: ViewContainerAppend[]
  eventDropTransformers?: EventDropTransformers[]
  componentInteractions?: InteractionClass[]
  calendarInteractions?: CalendarInteractionClass[]
  themeClasses?: { [themeSystemName: string]: ThemeClass }
  eventSourceDefs?: EventSourceDef[]
  cmdFormatter?: CmdFormatterFunc
  recurringTypes?: RecurringType[]
  namedTimeZonedImpl?: NamedTimeZoneImplClass
  initialView?: string
  elementDraggingImpl?: ElementDraggingClass
  optionChangeHandlers?: OptionChangeHandlerMap
  scrollGridImpl?: ScrollGridImpl
  contentTypeHandlers?: ContentTypeHandlers
}

export interface PluginHooks {
  reducers: reducerFunc[]
  eventDefParsers: eventDefParserFunc[]
  isDraggableTransformers: eventIsDraggableTransformer[]
  eventDragMutationMassagers: eventDragMutationMassager[]
  eventDefMutationAppliers: eventDefMutationApplier[]
  dateSelectionTransformers: dateSelectionJoinTransformer[]
  datePointTransforms: DatePointTransform[]
  dateSpanTransforms: DateSpanTransform[]
  views: ViewConfigInputHash // TODO: parse before gets to this step?
  viewPropsTransformers: ViewPropsTransformerClass[]
  isPropsValid: isPropsValidTester | null
  externalDefTransforms: ExternalDefTransform[]
  eventResizeJoinTransforms: EventResizeJoinTransforms[]
  viewContainerAppends: ViewContainerAppend[]
  eventDropTransformers: EventDropTransformers[]
  componentInteractions: InteractionClass[]
  calendarInteractions: CalendarInteractionClass[]
  themeClasses: { [themeSystemName: string]: ThemeClass }
  eventSourceDefs: EventSourceDef[]
  cmdFormatter?: CmdFormatterFunc
  recurringTypes: RecurringType[]
  namedTimeZonedImpl?: NamedTimeZoneImplClass
  initialView: string
  elementDraggingImpl?: ElementDraggingClass
  optionChangeHandlers: OptionChangeHandlerMap
  scrollGridImpl: ScrollGridImpl | null
  contentTypeHandlers: ContentTypeHandlers
}

export interface PluginDef extends PluginHooks {
  id: string
  deps: PluginDef[]
}

export type ViewPropsTransformerClass = new() => ViewPropsTransformer

export interface ViewPropsTransformer {
  transform(viewProps: ViewProps, viewSpec: ViewSpec, calendarProps: CalendarComponentProps, allOptions: any): any
}

export type ViewContainerAppend = (context: ReducerContext) => ComponentChildren
