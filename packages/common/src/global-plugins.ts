import { PluginDef } from './plugin-system-struct'
import { createPlugin } from './plugin-system'
import { arrayEventSourcePlugin } from './event-sources/array-event-source'
import { funcEventSourcePlugin } from './event-sources/func-event-source'
import { jsonFeedEventSourcePlugin } from './event-sources/json-feed-event-source'
import { simpleRecurringEventsPlugin } from './structs/recurring-event-simple'
import { changeHandlerPlugin } from './option-change-handlers'
import { injectHtml, injectDomNodes } from './util/dom-manip'

/*
this array is exposed on the root namespace so that UMD plugins can add to it.
see the rollup-bundles script.
*/
export let globalPlugins: PluginDef[] = [ // TODO: make a const?
  arrayEventSourcePlugin,
  funcEventSourcePlugin,
  jsonFeedEventSourcePlugin,
  simpleRecurringEventsPlugin,
  changeHandlerPlugin,
  createPlugin({
    contentTypeHandlers: {
      html: () => injectHtml,
      domNodes: () => injectDomNodes
    }
  })
]
