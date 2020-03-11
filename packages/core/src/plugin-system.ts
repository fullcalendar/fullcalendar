import { reducerFunc } from './reducers/types'
import { eventDefParserFunc } from './structs/event'
import { eventDefMutationApplier } from './structs/event-mutation'
import Calendar, { DatePointTransform, DateSpanTransform, CalendarInteractionClass, OptionChangeHandlerMap } from './Calendar'
import { ViewConfigInputHash } from './structs/view-config'
import { ViewSpec } from './structs/view-spec'
import { ViewProps } from './View'
import { CalendarComponentProps } from './CalendarComponent'
import { isPropsValidTester } from './validation'
import { eventDragMutationMassager, eventIsDraggableTransformer, EventDropTransformers } from './interactions/event-dragging'
import { dateSelectionJoinTransformer } from './interactions/date-selecting'
import { EventResizeJoinTransforms } from './interactions/event-resizing'
import { ExternalDefTransform } from './interactions/external-element-dragging'
import { InteractionClass } from './interactions/interaction'
import { ThemeClass } from './theme/Theme'
import { EventSourceDef } from './structs/event-source'
import { CmdFormatterFunc } from './datelib/formatting-cmd'
import { RecurringType } from './structs/recurring-event'
import { NamedTimeZoneImplClass } from './datelib/timezone'
import { ElementDraggingClass } from './interactions/ElementDragging'
import { guid } from './util/misc'
import { ComponentChildren } from './vdom'
import { ScrollGridImpl } from './scrollgrid/ScrollGridImpl'

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
  defaultView?: string
  elementDraggingImpl?: ElementDraggingClass
  optionChangeHandlers?: OptionChangeHandlerMap
  scrollGridImpl?: ScrollGridImpl
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
  defaultView: string
  elementDraggingImpl?: ElementDraggingClass
  optionChangeHandlers: OptionChangeHandlerMap
  scrollGridImpl: ScrollGridImpl | null
}

export interface PluginDef extends PluginHooks {
  id: string
  deps: PluginDef[]
}

export type ViewPropsTransformerClass = new() => ViewPropsTransformer

export interface ViewPropsTransformer {
  transform(viewProps: ViewProps, viewSpec: ViewSpec, calendarProps: CalendarComponentProps, allOptions: any): any
}

export type ViewContainerAppend = (calendar: Calendar) => ComponentChildren


export function createPlugin(input: PluginDefInput): PluginDef {
  return {
    id: guid(),
    deps: input.deps || [],
    reducers: input.reducers || [],
    eventDefParsers: input.eventDefParsers || [],
    isDraggableTransformers: input.isDraggableTransformers || [],
    eventDragMutationMassagers: input.eventDragMutationMassagers || [],
    eventDefMutationAppliers: input.eventDefMutationAppliers || [],
    dateSelectionTransformers: input.dateSelectionTransformers || [],
    datePointTransforms: input.datePointTransforms || [],
    dateSpanTransforms: input.dateSpanTransforms || [],
    views: input.views || {},
    viewPropsTransformers: input.viewPropsTransformers || [],
    isPropsValid: input.isPropsValid || null,
    externalDefTransforms: input.externalDefTransforms || [],
    eventResizeJoinTransforms: input.eventResizeJoinTransforms || [],
    viewContainerAppends: input.viewContainerAppends || [],
    eventDropTransformers: input.eventDropTransformers || [],
    componentInteractions: input.componentInteractions || [],
    calendarInteractions: input.calendarInteractions || [],
    themeClasses: input.themeClasses || {},
    eventSourceDefs: input.eventSourceDefs || [],
    cmdFormatter: input.cmdFormatter,
    recurringTypes: input.recurringTypes || [],
    namedTimeZonedImpl: input.namedTimeZonedImpl,
    defaultView: input.defaultView || '',
    elementDraggingImpl: input.elementDraggingImpl,
    optionChangeHandlers: input.optionChangeHandlers || {},
    scrollGridImpl: input.scrollGridImpl || null
  }
}

export class PluginSystem {

  hooks: PluginHooks
  addedHash: { [pluginId: string]: true }

  constructor() {
    this.hooks = {
      reducers: [],
      eventDefParsers: [],
      isDraggableTransformers: [],
      eventDragMutationMassagers: [],
      eventDefMutationAppliers: [],
      dateSelectionTransformers: [],
      datePointTransforms: [],
      dateSpanTransforms: [],
      views: {},
      viewPropsTransformers: [],
      isPropsValid: null,
      externalDefTransforms: [],
      eventResizeJoinTransforms: [],
      viewContainerAppends: [],
      eventDropTransformers: [],
      componentInteractions: [],
      calendarInteractions: [],
      themeClasses: {},
      eventSourceDefs: [],
      cmdFormatter: null,
      recurringTypes: [],
      namedTimeZonedImpl: null,
      defaultView: '',
      elementDraggingImpl: null,
      optionChangeHandlers: {},
      scrollGridImpl: null
    }
    this.addedHash = {}
  }

  add(plugin: PluginDef) {
    if (!this.addedHash[plugin.id]) {
      this.addedHash[plugin.id] = true

      for (let dep of plugin.deps) {
        this.add(dep)
      }

      this.hooks = combineHooks(this.hooks, plugin)
    }
  }

}

function combineHooks(hooks0: PluginHooks, hooks1: PluginHooks): PluginHooks {
  return {
    reducers: hooks0.reducers.concat(hooks1.reducers),
    eventDefParsers: hooks0.eventDefParsers.concat(hooks1.eventDefParsers),
    isDraggableTransformers: hooks0.isDraggableTransformers.concat(hooks1.isDraggableTransformers),
    eventDragMutationMassagers: hooks0.eventDragMutationMassagers.concat(hooks1.eventDragMutationMassagers),
    eventDefMutationAppliers: hooks0.eventDefMutationAppliers.concat(hooks1.eventDefMutationAppliers),
    dateSelectionTransformers: hooks0.dateSelectionTransformers.concat(hooks1.dateSelectionTransformers),
    datePointTransforms: hooks0.datePointTransforms.concat(hooks1.datePointTransforms),
    dateSpanTransforms: hooks0.dateSpanTransforms.concat(hooks1.dateSpanTransforms),
    views: { ...hooks0.views, ...hooks1.views },
    viewPropsTransformers: hooks0.viewPropsTransformers.concat(hooks1.viewPropsTransformers),
    isPropsValid: hooks1.isPropsValid || hooks0.isPropsValid,
    externalDefTransforms: hooks0.externalDefTransforms.concat(hooks1.externalDefTransforms),
    eventResizeJoinTransforms: hooks0.eventResizeJoinTransforms.concat(hooks1.eventResizeJoinTransforms),
    viewContainerAppends: hooks0.viewContainerAppends.concat(hooks1.viewContainerAppends),
    eventDropTransformers: hooks0.eventDropTransformers.concat(hooks1.eventDropTransformers),
    calendarInteractions: hooks0.calendarInteractions.concat(hooks1.calendarInteractions),
    componentInteractions: hooks0.componentInteractions.concat(hooks1.componentInteractions),
    themeClasses: { ...hooks0.themeClasses, ...hooks1.themeClasses },
    eventSourceDefs: hooks0.eventSourceDefs.concat(hooks1.eventSourceDefs),
    cmdFormatter: hooks1.cmdFormatter || hooks0.cmdFormatter,
    recurringTypes: hooks0.recurringTypes.concat(hooks1.recurringTypes),
    namedTimeZonedImpl: hooks1.namedTimeZonedImpl || hooks0.namedTimeZonedImpl,
    defaultView: hooks0.defaultView || hooks1.defaultView, // put earlier plugins FIRST
    elementDraggingImpl: hooks0.elementDraggingImpl || hooks1.elementDraggingImpl, // "
    optionChangeHandlers: { ...hooks0.optionChangeHandlers, ...hooks1.optionChangeHandlers },
    scrollGridImpl: hooks1.scrollGridImpl || hooks0.scrollGridImpl
  }
}
