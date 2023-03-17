import { ReducerFunc } from './reducers/CalendarDataManager.js'
import { EventDefMemberAdder } from './structs/event-parse.js'
import { eventDefMutationApplier } from './structs/event-mutation.js'
import { DatePointTransform, DateSpanTransform, CalendarInteractionClass, OptionChangeHandlerMap } from './calendar-utils.js'
import { ViewConfigInputHash } from './structs/view-config.js'
import { ViewProps } from './View.js'
import { CalendarContentProps } from './CalendarContent.js'
import { CalendarContext } from './CalendarContext.js'
import { isPropsValidTester } from './structs/constraint.js'
import { eventDragMutationMassager, eventIsDraggableTransformer, EventDropTransformers } from './interactions/event-dragging.js'
import { dateSelectionJoinTransformer } from './interactions/date-selecting.js'
import { ExternalDefTransform } from './interactions/external-element-dragging.js'
import { InteractionClass } from './interactions/interaction.js'
import { ThemeClass } from './theme/Theme.js'
import { EventSourceDef } from './structs/event-source-def.js'
import { CmdFormatterFunc } from './datelib/DateFormatter.js'
import { RecurringType } from './structs/recurring-event.js'
import { NamedTimeZoneImplClass } from './datelib/timezone.js'
import { ElementDraggingClass } from './interactions/ElementDragging.js'
import { ComponentChildren } from './preact.js'
import { ScrollGridImpl } from './scrollgrid/ScrollGridImpl.js'
import { GenericRefiners, GenericListenerRefiners, Dictionary } from './options.js'
import { CalendarData } from './reducers/data-types.js'

// TODO: easier way to add new hooks? need to update a million things

export interface PluginDefInput {
  name: string
  premiumReleaseDate?: string
  deps?: PluginDef[]
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
  themeClasses?: { [themeSystemName: string]: ThemeClass }
  eventSourceDefs?: EventSourceDef<any>[]
  cmdFormatter?: CmdFormatterFunc
  recurringTypes?: RecurringType<any>[]
  namedTimeZonedImpl?: NamedTimeZoneImplClass
  initialView?: string
  elementDraggingImpl?: ElementDraggingClass
  optionChangeHandlers?: OptionChangeHandlerMap
  scrollGridImpl?: ScrollGridImpl
  listenerRefiners?: GenericListenerRefiners
  optionRefiners?: GenericRefiners
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
  themeClasses: { [themeSystemName: string]: ThemeClass }
  eventSourceDefs: EventSourceDef<any>[]
  cmdFormatter?: CmdFormatterFunc
  recurringTypes: RecurringType<any>[]
  namedTimeZonedImpl?: NamedTimeZoneImplClass
  initialView: string
  elementDraggingImpl?: ElementDraggingClass
  optionChangeHandlers: OptionChangeHandlerMap
  scrollGridImpl: ScrollGridImpl | null
  listenerRefiners: GenericListenerRefiners
  optionRefiners: GenericRefiners
  propSetHandlers: { [propName: string]: (val: any, context: CalendarData) => void }
}

export interface PluginDef extends PluginHooks {
  id: string
  name: string
  deps: PluginDef[]
}

export type ViewPropsTransformerClass = new() => ViewPropsTransformer

export interface ViewPropsTransformer {
  transform(viewProps: ViewProps, calendarProps: CalendarContentProps): any
}

export type ViewContainerAppend = (context: CalendarContext) => ComponentChildren
