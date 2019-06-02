import { createPlugin } from './plugin-system'
import { Calendar } from './main'
import { hashValuesToArray } from './util/object'
import { EventSource } from './structs/event-source'

export default createPlugin({
  optionChangeHandlers: {
    events(events, calendar, deepEqual) {
      handleEventSources([ events ], calendar, deepEqual)
    },
    eventSources: handleEventSources,
    plugins: handlePlugins
  }
})

function handleEventSources(inputs, calendar: Calendar, deepEqual) {
  let unfoundSources: EventSource[] = hashValuesToArray(calendar.state.eventSources)
  let newInputs = []

  for (let input of inputs) {
    let inputFound = false

    for (let i = 0; i < unfoundSources.length; i++) {
      if (deepEqual(unfoundSources[i]._raw, input)) {
        unfoundSources.splice(i, 1) // delete
        inputFound = true
        break
      }
    }

    if (!inputFound) {
      newInputs.push(input)
    }
  }

  for (let unfoundSource of unfoundSources) {
    calendar.dispatch({
      type: 'REMOVE_EVENT_SOURCE',
      sourceId: unfoundSource.sourceId
    })
  }

  for (let newInput of newInputs) {
    calendar.addEventSource(newInput)
  }
}

// shortcoming: won't remove plugins
function handlePlugins(inputs, calendar: Calendar) {
  calendar.addPluginInputs(inputs) // will gracefully handle duplicates
}
