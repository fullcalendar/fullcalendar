import { guid } from './util/misc'
import { PluginDefInput, PluginDef, PluginHooks } from './plugin-system-struct'
import { isArraysEqual } from './util/array'

// TODO: easier way to add new hooks? need to update a million things

export function createPlugin(input: PluginDefInput): PluginDef {
  return {
    id: guid(),
    deps: input.deps || [],
    reducers: input.reducers || [],
    isLoadingFuncs: input.isLoadingFuncs || [],
    contextInit: [].concat(input.contextInit || []),
    eventRefiners: input.eventRefiners || {},
    eventDefMemberAdders: input.eventDefMemberAdders || [],
    eventSourceRefiners: input.eventSourceRefiners || {},
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
    viewContainerAppends: input.viewContainerAppends || [],
    eventDropTransformers: input.eventDropTransformers || [],
    componentInteractions: input.componentInteractions || [],
    calendarInteractions: input.calendarInteractions || [],
    themeClasses: input.themeClasses || {},
    eventSourceDefs: input.eventSourceDefs || [],
    cmdFormatter: input.cmdFormatter,
    recurringTypes: input.recurringTypes || [],
    namedTimeZonedImpl: input.namedTimeZonedImpl,
    initialView: input.initialView || '',
    elementDraggingImpl: input.elementDraggingImpl,
    optionChangeHandlers: input.optionChangeHandlers || {},
    scrollGridImpl: input.scrollGridImpl || null,
    contentTypeHandlers: input.contentTypeHandlers || {},
    listenerRefiners: input.listenerRefiners || {},
    optionRefiners: input.optionRefiners || {},
    propSetHandlers: input.propSetHandlers || {},
  }
}

function buildPluginHooks(pluginDefs: PluginDef[], globalDefs: PluginDef[]): PluginHooks {
  let isAdded: { [pluginId: string]: boolean } = {}
  let hooks: PluginHooks = {
    reducers: [],
    isLoadingFuncs: [],
    contextInit: [],
    eventRefiners: {},
    eventDefMemberAdders: [],
    eventSourceRefiners: {},
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
    viewContainerAppends: [],
    eventDropTransformers: [],
    componentInteractions: [],
    calendarInteractions: [],
    themeClasses: {},
    eventSourceDefs: [],
    cmdFormatter: null,
    recurringTypes: [],
    namedTimeZonedImpl: null,
    initialView: '',
    elementDraggingImpl: null,
    optionChangeHandlers: {},
    scrollGridImpl: null,
    contentTypeHandlers: {},
    listenerRefiners: {},
    optionRefiners: {},
    propSetHandlers: {},
  }

  function addDefs(defs: PluginDef[]) {
    for (let def of defs) {
      if (!isAdded[def.id]) {
        isAdded[def.id] = true
        addDefs(def.deps)
        hooks = combineHooks(hooks, def)
      }
    }
  }

  if (pluginDefs) {
    addDefs(pluginDefs)
  }

  addDefs(globalDefs)

  return hooks
}

export function buildBuildPluginHooks() { // memoizes
  let currentOverrideDefs: PluginDef[] = []
  let currentGlobalDefs: PluginDef[] = []
  let currentHooks: PluginHooks

  return (overrideDefs: PluginDef[], globalDefs: PluginDef[]) => {
    if (!currentHooks || !isArraysEqual(overrideDefs, currentOverrideDefs) || !isArraysEqual(globalDefs, currentGlobalDefs)) {
      currentHooks = buildPluginHooks(overrideDefs, globalDefs)
    }
    currentOverrideDefs = overrideDefs
    currentGlobalDefs = globalDefs
    return currentHooks
  }
}

function combineHooks(hooks0: PluginHooks, hooks1: PluginHooks): PluginHooks {
  return {
    reducers: hooks0.reducers.concat(hooks1.reducers),
    isLoadingFuncs: hooks0.isLoadingFuncs.concat(hooks1.isLoadingFuncs),
    contextInit: hooks0.contextInit.concat(hooks1.contextInit),
    eventRefiners: { ...hooks0.eventRefiners, ...hooks1.eventRefiners },
    eventDefMemberAdders: hooks0.eventDefMemberAdders.concat(hooks1.eventDefMemberAdders),
    eventSourceRefiners: { ...hooks0.eventSourceRefiners, ...hooks1.eventSourceRefiners },
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
    viewContainerAppends: hooks0.viewContainerAppends.concat(hooks1.viewContainerAppends),
    eventDropTransformers: hooks0.eventDropTransformers.concat(hooks1.eventDropTransformers),
    calendarInteractions: hooks0.calendarInteractions.concat(hooks1.calendarInteractions),
    componentInteractions: hooks0.componentInteractions.concat(hooks1.componentInteractions),
    themeClasses: { ...hooks0.themeClasses, ...hooks1.themeClasses },
    eventSourceDefs: hooks0.eventSourceDefs.concat(hooks1.eventSourceDefs),
    cmdFormatter: hooks1.cmdFormatter || hooks0.cmdFormatter,
    recurringTypes: hooks0.recurringTypes.concat(hooks1.recurringTypes),
    namedTimeZonedImpl: hooks1.namedTimeZonedImpl || hooks0.namedTimeZonedImpl,
    initialView: hooks0.initialView || hooks1.initialView, // put earlier plugins FIRST
    elementDraggingImpl: hooks0.elementDraggingImpl || hooks1.elementDraggingImpl, // "
    optionChangeHandlers: { ...hooks0.optionChangeHandlers, ...hooks1.optionChangeHandlers },
    scrollGridImpl: hooks1.scrollGridImpl || hooks0.scrollGridImpl,
    contentTypeHandlers: { ...hooks0.contentTypeHandlers, ...hooks1.contentTypeHandlers },
    listenerRefiners: { ...hooks0.listenerRefiners, ...hooks1.listenerRefiners },
    optionRefiners: { ...hooks0.optionRefiners, ...hooks1.optionRefiners },
    propSetHandlers: { ...hooks0.propSetHandlers, ...hooks1.propSetHandlers },
  }
}
