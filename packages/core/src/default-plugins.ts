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


export function addDefaultPlugins(pluginDefs: PluginDef[]) { // TODO: redo
  defaultPlugins.push(...pluginDefs)
}
