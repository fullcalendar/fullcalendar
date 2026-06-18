import { ReducerFunc } from './reducers/CalendarDataManager'
import { EventDefMemberAdder } from './structs/event-parse'
import { eventDefMutationApplier } from './structs/event-mutation'
import { DatePointTransform, DateSpanTransform, CalendarInteractionClass, OptionChangeHandlerMap } from './calendar-utils'
import { ViewConfigInputHash } from './structs/view-config'
import { ViewProps } from './component-util/View'
import { CalendarContentProps } from './CalendarInner'
import { CalendarContext } from './CalendarContext'
import { isPropsValidTester } from './structs/constraint'
import { eventDragMutationMassager, eventIsDraggableTransformer, EventDropTransformers } from './interactions/event-dragging'
import { dateSelectionJoinTransformer } from './interactions/date-selecting'
import { ExternalDefTransform } from './interactions/external-element-dragging'
import { InteractionClass } from './interactions/interaction'
import { EventSourceDef } from './structs/event-source-def'
import { CmdDateFormatterFunc } from '@full-ui/headless-calendar'
import { RecurringType } from './structs/recurring-event'
import { ElementDraggingClass } from './interactions/ElementDragging'
import type { ReactNode } from 'react'
import { GenericRefiners, GenericListenerRefiners, Dictionary, CalendarOptions } from './options'
import { CalendarData } from './reducers/data-types'
import { ScrollerSyncerClass } from './scrollgrid/ScrollerSyncerInterface'

// TODO: easier way to add new hooks? need to update a million things

export interface PluginInput {
  name: string
  premiumReleaseDate?: string
  deps?: PluginInput[]
  reducers?: ReducerFunc[]
  isLoadingFuncs?: ((state: Dictionary) => boolean)[]
  contextInit?: (context: CalendarContext) => void
  eventRefiners?: GenericRefiners // why not an array like others?
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
  viewContainerAppends?: ViewContainerAppend[]
  eventDropTransformers?: EventDropTransformers[]
  componentInteractions?: InteractionClass[]
  calendarInteractions?: CalendarInteractionClass[]
  eventSourceDefs?: EventSourceDef<any>[]
  cmdFormatter?: CmdDateFormatterFunc
  recurringTypes?: RecurringType<any>[]
  initialView?: string
  elementDraggingImpl?: ElementDraggingClass
  optionChangeHandlers?: OptionChangeHandlerMap
  scrollerSyncerClass?: ScrollerSyncerClass
  listenerRefiners?: GenericListenerRefiners
  optionRefiners?: GenericRefiners
  optionDefaults?: CalendarOptions
  propSetHandlers?: { [propName: string]: (val: any, context: CalendarData) => void } // TODO: make better types
}

export interface PluginHooks {
  premiumReleaseDate: Date | undefined
  reducers: ReducerFunc[]
  isLoadingFuncs: ((state: Dictionary) => boolean)[]
  contextInit: ((context: CalendarContext) => void)[]
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
  viewContainerAppends: ViewContainerAppend[]
  eventDropTransformers: EventDropTransformers[]
  componentInteractions: InteractionClass[]
  calendarInteractions: CalendarInteractionClass[]
  eventSourceDefs: EventSourceDef<any>[]
  cmdFormatter?: CmdDateFormatterFunc
  recurringTypes: RecurringType<any>[]
  initialView: string
  elementDraggingImpl?: ElementDraggingClass
  optionChangeHandlers: OptionChangeHandlerMap
  scrollerSyncerClass: ScrollerSyncerClass | null
  listenerRefiners: GenericListenerRefiners
  optionRefiners: GenericRefiners
  optionDefaults: CalendarOptions[]
  propSetHandlers: { [propName: string]: (val: any, context: CalendarData) => void }
}

export interface PluginDef extends PluginHooks {
  name: string
}

export type ViewPropsTransformerClass = new() => ViewPropsTransformer

export interface ViewPropsTransformer {
  transform(viewProps: ViewProps, calendarProps: CalendarContentProps): any
}

export type ViewContainerAppend = (context: CalendarContext) => ReactNode
