import { PluginDef } from './plugin-system-struct.js'
import { createPlugin } from './plugin-system.js'
import { arrayEventSourcePlugin } from './event-sources/array-event-source.js'
import { funcEventSourcePlugin } from './event-sources/func-event-source.js'
import { jsonFeedEventSourcePlugin } from './event-sources/json-feed-event-source.js'
import { simpleRecurringEventsPlugin } from './structs/recurring-event-simple.js'
import { changeHandlerPlugin } from './option-change-handlers.js'
import { handleDateProfile } from './dates-set.js'
import { handleEventStore } from './event-crud.js'
import { isArraysEqual } from './util/array.js'
import { removeElement } from './util/dom-manip.js'
import { computeEventSourcesLoading } from './reducers/eventSources.js'
import { CalendarDataManagerState } from './reducers/data-types.js'

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
      html: buildHtmlRenderer,
      domNodes: buildDomNodeRenderer,
    },
    propSetHandlers: {
      dateProfile: handleDateProfile,
      eventStore: handleEventStore,
    },
  }),
]

function buildHtmlRenderer() {
  let currentEl: HTMLElement | null = null
  let currentHtml: string = ''

  function render(el: HTMLElement, html: string) {
    if (el !== currentEl || html !== currentHtml) {
      el.innerHTML = html
    }
    currentEl = el
    currentHtml = html
  }

  function destroy() {
    currentEl.innerHTML = ''
    currentEl = null
    currentHtml = ''
  }

  return { render, destroy }
}

function buildDomNodeRenderer() {
  let currentEl: HTMLElement | null = null
  let currentDomNodes: Node[] = []

  function render(el: HTMLElement, domNodes: Node[] | NodeList) {
    let newDomNodes = Array.prototype.slice.call(domNodes)

    if (el !== currentEl || !isArraysEqual(currentDomNodes, newDomNodes)) {
      // append first, remove second (for scroll resetting)
      for (let newNode of newDomNodes) {
        el.appendChild(newNode)
      }
      destroy()
    }

    currentEl = el
    currentDomNodes = newDomNodes
  }

  function destroy() {
    currentDomNodes.forEach(removeElement)
    currentDomNodes = []
    currentEl = null
  }

  return { render, destroy }
}
