import { PluginDef } from './plugin-system'

import ArrayEventSourcePlugin from './event-sources/array-event-source'
import FuncEventSourcePlugin from './event-sources/func-event-source'
import JsonFeedEventSourcePlugin from './event-sources/json-feed-event-source'
import SimpleRecurrencePlugin from './structs/recurring-event-simple'
import DefaultOptionChangeHandlers from './option-change-handlers'


export let defaultPlugins: PluginDef[] = [
  ArrayEventSourcePlugin,
  FuncEventSourcePlugin,
  JsonFeedEventSourcePlugin,
  SimpleRecurrencePlugin,
  DefaultOptionChangeHandlers
]


export function addDefaultPlugins(pluginDefs: PluginDef[]) {
  defaultPlugins.push(...pluginDefs)
}


export function addDefaultPluginIfGlobal(pluginDef: PluginDef) {
  if (isGlobal()) {
    defaultPlugins.push(pluginDef)
  }
}


function isGlobal() {
  let globalNs = window['FullCalendar']
  return globalNs && globalNs.addDefaultPluginIfGlobal === addDefaultPluginIfGlobal
}
