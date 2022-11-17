import { PluginDef } from './plugin-system-struct.js'
import { createPlugin } from './plugin-system.js'
import { arrayEventSourcePlugin } from './event-sources/array-event-source.js'
import { funcEventSourcePlugin } from './event-sources/func-event-source.js'
import { jsonFeedEventSourcePlugin } from './event-sources/json-feed-event-source.js'
import { simpleRecurringEventsPlugin } from './structs/recurring-event-simple.js'
import { changeHandlerPlugin } from './option-change-handlers.js'
import { handleDateProfile } from './dates-set.js'
import { handleEventStore } from './event-crud.js'
import { computeEventSourcesLoading } from './reducers/eventSources.js'
import { CalendarDataManagerState } from './reducers/data-types.js'

/*
this array is exposed on the root namespace so that UMD plugins can add to it.
see the rollup-bundles script.
*/
export const globalPlugins: PluginDef[] = [
  arrayEventSourcePlugin,
  funcEventSourcePlugin,
  jsonFeedEventSourcePlugin,
  simpleRecurringEventsPlugin,
  changeHandlerPlugin,
  createPlugin({
    name: 'misc',
    isLoadingFuncs: [
      (state: CalendarDataManagerState) => computeEventSourcesLoading(state.eventSources),
    ],
    propSetHandlers: {
      dateProfile: handleDateProfile,
      eventStore: handleEventStore,
    },
  }),
]
