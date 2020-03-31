import { PluginDef, createPlugin } from './plugin-system'
import ArrayEventSourcePlugin from './event-sources/array-event-source'
import FuncEventSourcePlugin from './event-sources/func-event-source'
import JsonFeedEventSourcePlugin from './event-sources/json-feed-event-source'
import SimpleRecurrencePlugin from './structs/recurring-event-simple'
import DefaultOptionChangeHandlers from './option-change-handlers'
import { injectHtml, injectDomNodes } from './util/dom-manip'

/*
this array is exposed on the root namespace so that UMD plugins can add to it.
see the rollup-bundles script.
*/
export let globalPlugins: PluginDef[] = [
  ArrayEventSourcePlugin,
  FuncEventSourcePlugin,
  JsonFeedEventSourcePlugin,
  SimpleRecurrencePlugin,
  DefaultOptionChangeHandlers,
  createPlugin({
    contentTypeHandlers: {
      html: () => injectHtml,
      domNodes: () => injectDomNodes
    }
  })
]
