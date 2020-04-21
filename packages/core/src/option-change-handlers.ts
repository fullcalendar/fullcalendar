import { createPlugin } from './plugin-system'
import { hashValuesToArray } from './util/object'
import { EventSource } from './structs/event-source'
import { ReducerContext } from './reducers/ReducerContext'

export const changeHandlerPlugin = createPlugin({
  optionChangeHandlers: {
    events(events, context) {
      handleEventSources([ events ], context)
    },
    eventSources: handleEventSources
  }
})

/*
BUG: if `event` was supplied, all previously-given `eventSources` will be wiped out
*/
function handleEventSources(inputs, context: ReducerContext) {
  let unfoundSources: EventSource[] = hashValuesToArray(context.getCurrentState().eventSources)
  let newInputs = []

  for (let input of inputs) {
    let inputFound = false

    for (let i = 0; i < unfoundSources.length; i++) {
      if (unfoundSources[i]._raw === input) {
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
    context.dispatch({
      type: 'REMOVE_EVENT_SOURCE',
      sourceId: unfoundSource.sourceId
    })
  }

  for (let newInput of newInputs) {
    context.calendarApi.addEventSource(newInput)
  }
}
