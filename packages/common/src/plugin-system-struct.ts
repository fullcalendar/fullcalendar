import { ReducerFunc } from './reducers/CalendarDataManager'
import { EventDefMemberAdder } from './structs/event-parse'
import { eventDefMutationApplier } from './structs/event-mutation'
import { DatePointTransform, DateSpanTransform, CalendarInteractionClass, OptionChangeHandlerMap } from './calendar-utils'
import { ViewConfigInputHash } from './structs/view-config'
import { ViewSpec } from './structs/view-spec'
import { ViewProps } from './View'
import { CalendarContentProps } from './CalendarContent'
import { CalendarContext } from './CalendarContext'
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
import { GenericRefiners, GenericListenerRefiners } from './options'

// TODO: easier way to add new hooks? need to update a million things

export interface PluginDefInput {
  deps?: PluginDef[]
  reducers?: ReducerFunc[]
  eventRefiners?: GenericRefiners
  eventDefMemberAdders?: EventDefMemberAdder[]
  eventSourceRefiners?: GenericRefiners
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
  eventSourceDefs?: EventSourceDef<any>[]
  cmdFormatter?: CmdFormatterFunc
  recurringTypes?: RecurringType<any>[]
  namedTimeZonedImpl?: NamedTimeZoneImplClass
  initialView?: string
  elementDraggingImpl?: ElementDraggingClass
  optionChangeHandlers?: OptionChangeHandlerMap
  scrollGridImpl?: ScrollGridImpl
  contentTypeHandlers?: ContentTypeHandlers
  listenerRefiners?: GenericListenerRefiners
  optionRefiners?: GenericRefiners
}

export interface PluginHooks {
  reducers: ReducerFunc[]
  eventRefiners: GenericRefiners
  eventDefMemberAdders: EventDefMemberAdder[]
  eventSourceRefiners: GenericRefiners
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
  eventSourceDefs: EventSourceDef<any>[]
  cmdFormatter?: CmdFormatterFunc
  recurringTypes: RecurringType<any>[]
  namedTimeZonedImpl?: NamedTimeZoneImplClass
  initialView: string
  elementDraggingImpl?: ElementDraggingClass
  optionChangeHandlers: OptionChangeHandlerMap
  scrollGridImpl: ScrollGridImpl | null
  contentTypeHandlers: ContentTypeHandlers
  listenerRefiners: GenericListenerRefiners
  optionRefiners: GenericRefiners
}

export interface PluginDef extends PluginHooks {
  id: string
  deps: PluginDef[]
}

export type ViewPropsTransformerClass = new() => ViewPropsTransformer

export interface ViewPropsTransformer {
  transform(viewProps: ViewProps, viewSpec: ViewSpec, calendarProps: CalendarContentProps, allOptions: any): any
}

export type ViewContainerAppend = (context: CalendarContext) => ComponentChildren
