import { PluginDef } from './plugin-system-struct'
import { createPlugin } from './plugin-system'
import { arrayEventSourcePlugin } from './event-sources/array-event-source'
import { funcEventSourcePlugin } from './event-sources/func-event-source'
import { jsonFeedEventSourcePlugin } from './event-sources/json-feed-event-source'
import { simpleRecurringEventsPlugin } from './structs/recurring-event-simple'
import { changeHandlerPlugin } from './option-change-handlers'
import { handleDateProfile } from './dates-set'
import { handleEventStore } from './event-crud'
import { isArraysEqual } from './util/array'
import { removeElement } from './util/dom-manip'
import { computeEventSourcesLoading } from './reducers/eventSources'
import { CalendarDataManagerState } from './reducers/data-types'

/*
this array is exposed on the root namespace so that UMD plugins can add to it.
see the rollup-bundles script.
*/
export const globalPlugins: PluginDef[] = [ // TODO: make a const?
  arrayEventSourcePlugin,
  funcEventSourcePlugin,
  jsonFeedEventSourcePlugin,
  simpleRecurringEventsPlugin,
  changeHandlerPlugin,
  createPlugin({ // misc...
    isLoadingFuncs: [
      (state: CalendarDataManagerState) => computeEventSourcesLoading(state.eventSources),
    ],
    contentTypeHandlers: {
      html: () => ({ render: injectHtml }),
      domNodes: () => ({ render: injectDomNodes }),
    },
    propSetHandlers: {
      dateProfile: handleDateProfile,
      eventStore: handleEventStore,
    },
  }),
]

export function injectHtml(el: HTMLElement, html: string) {
  el.innerHTML = html
}

export function injectDomNodes(el: HTMLElement, domNodes: Node[] | NodeList) {
  let oldNodes = Array.prototype.slice.call(el.childNodes) // TODO: use array util
  let newNodes = Array.prototype.slice.call(domNodes) // TODO: use array util

  if (!isArraysEqual(oldNodes, newNodes)) {
    for (let newNode of newNodes) {
      el.appendChild(newNode)
    }
    oldNodes.forEach(removeElement)
  }
}
