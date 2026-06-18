import { PluginInput, PluginDef, PluginHooks } from './plugin-system-struct'
import { isArraysEqual } from './util/array'
import { mergeViewOptionsMap } from './options-manip'

// TODO: easier way to add new hooks? need to update a million things

function refinePluginDef(input: PluginInput): PluginDef {
  return {
    name: input.name,
    premiumReleaseDate: input.premiumReleaseDate ? new Date(input.premiumReleaseDate): undefined,
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
    eventSourceDefs: input.eventSourceDefs || [],
    cmdFormatter: input.cmdFormatter,
    recurringTypes: input.recurringTypes || [],
    initialView: input.initialView || '',
    elementDraggingImpl: input.elementDraggingImpl,
    optionChangeHandlers: input.optionChangeHandlers || {},
    scrollerSyncerClass: input.scrollerSyncerClass || null,
    listenerRefiners: input.listenerRefiners || {},
    optionRefiners: input.optionRefiners || {},
    optionDefaults: input.optionDefaults ? [input.optionDefaults] : [],
    propSetHandlers: input.propSetHandlers || {},
  }
}

function buildPluginHooks(pluginDefs: PluginInput[], globalDefs: PluginInput[]): PluginHooks {
  let pluginsByName: { [pluginName: string]: PluginDef } = {}
  let hooks: PluginHooks = {
    premiumReleaseDate: undefined,
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
    eventSourceDefs: [],
    cmdFormatter: null,
    recurringTypes: [],
    initialView: '',
    elementDraggingImpl: null,
    optionChangeHandlers: {},
    scrollerSyncerClass: null,
    listenerRefiners: {},
    optionRefiners: {},
    optionDefaults: [],
    propSetHandlers: {},
  }

  /*
  IDs/names, etc
  */
  function addDefs(defs: PluginInput[]) {
    for (let unrefinedDef of defs) {
      const { name } = unrefinedDef
      if (!name) {
        throw new Error('Plugin must specify a name')
      }

      if (!pluginsByName[name]) {
        const def = pluginsByName[name] = refinePluginDef(unrefinedDef)
        hooks = combineHooks(hooks, def)
        addDefs(unrefinedDef.deps || [])
      }
    }
  }

  if (pluginDefs) { // how could this be undefined?
    addDefs(pluginDefs)
  }

  addDefs(globalDefs) // GLOBAL plugins

  return hooks
}

export function buildBuildPluginHooks() { // memoizes
  let currentOverrideDefs: PluginInput[] = []
  let currentGlobalDefs: PluginInput[] = []
  let currentHooks: PluginHooks

  return (overrideDefs: PluginInput[], globalDefs: PluginInput[]) => {
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
    premiumReleaseDate: compareOptionalDates(hooks0.premiumReleaseDate, hooks1.premiumReleaseDate),
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
    views: mergeViewOptionsMap(hooks0.views as any, hooks1.views as any),
    viewPropsTransformers: hooks0.viewPropsTransformers.concat(hooks1.viewPropsTransformers),
    isPropsValid: hooks1.isPropsValid || hooks0.isPropsValid,
    externalDefTransforms: hooks0.externalDefTransforms.concat(hooks1.externalDefTransforms),
    viewContainerAppends: hooks0.viewContainerAppends.concat(hooks1.viewContainerAppends),
    eventDropTransformers: hooks0.eventDropTransformers.concat(hooks1.eventDropTransformers),
    calendarInteractions: hooks0.calendarInteractions.concat(hooks1.calendarInteractions),
    componentInteractions: hooks0.componentInteractions.concat(hooks1.componentInteractions),
    eventSourceDefs: hooks0.eventSourceDefs.concat(hooks1.eventSourceDefs),
    cmdFormatter: hooks1.cmdFormatter || hooks0.cmdFormatter,
    recurringTypes: hooks0.recurringTypes.concat(hooks1.recurringTypes),
    initialView: hooks0.initialView || hooks1.initialView, // put earlier plugins FIRST
    elementDraggingImpl: hooks0.elementDraggingImpl || hooks1.elementDraggingImpl, // "
    optionChangeHandlers: { ...hooks0.optionChangeHandlers, ...hooks1.optionChangeHandlers },
    scrollerSyncerClass: hooks0.scrollerSyncerClass || hooks1.scrollerSyncerClass,
    listenerRefiners: { ...hooks0.listenerRefiners, ...hooks1.listenerRefiners },
    optionRefiners: { ...hooks0.optionRefiners, ...hooks1.optionRefiners },
    optionDefaults: hooks0.optionDefaults.concat(hooks1.optionDefaults),
    propSetHandlers: { ...hooks0.propSetHandlers, ...hooks1.propSetHandlers },
  }
}

function compareOptionalDates(
  date0: Date | undefined,
  date1: Date | undefined,
): Date | undefined {
  if (date0 === undefined) {
    return date1
  }
  if (date1 === undefined) {
    return date0
  }
  return new Date(Math.max(date0.valueOf(), date1.valueOf()))
}
