import { reducerFunc } from './reducers/types'
import { eventDefParserFunc } from './structs/event'
import { eventDragMutationMassager } from './interactions/EventDragging'
import { eventDefMutationApplier } from './structs/event-mutation'

// TODO: easier way to add new hooks? need to update a million things

export interface PluginDefInput {
  deps?: PluginDef[]
  reducers?: reducerFunc[]
  eventDefParsers?: eventDefParserFunc[]
  eventDragMutationMassagers: eventDragMutationMassager[]
  eventDefMutationAppliers: eventDefMutationApplier[]
}

export interface PluginHooks {
  reducers: reducerFunc[]
  eventDefParsers: eventDefParserFunc[]
  eventDragMutationMassagers: eventDragMutationMassager[]
  eventDefMutationAppliers: eventDefMutationApplier[]
}

export interface PluginDef extends PluginHooks {
  id: string
  deps: PluginDef[]
}

let uid = 0

export function createPlugin(input: PluginDefInput): PluginDef {
  return {
    id: String(uid++),
    deps: input.deps || [],
    reducers: input.reducers || [],
    eventDefParsers: input.eventDefParsers || [],
    eventDragMutationMassagers: input.eventDragMutationMassagers || [],
    eventDefMutationAppliers: input.eventDefMutationAppliers || []
  }
}

export class PluginSystem {

  hooks: PluginHooks
  addedHash: { [pluginId: string]: true }

  constructor() {
    this.hooks = {
      reducers: [],
      eventDefParsers: [],
      eventDragMutationMassagers: [],
      eventDefMutationAppliers: []
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
    eventDragMutationMassagers: hooks0.eventDragMutationMassagers.concat(hooks1.eventDragMutationMassagers),
    eventDefMutationAppliers: hooks0.eventDefMutationAppliers.concat(hooks1.eventDefMutationAppliers)
  }
}
