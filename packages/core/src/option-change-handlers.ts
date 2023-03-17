import { createPlugin } from './plugin-system.js'
import { hashValuesToArray } from './util/object.js'
import { EventSource } from './structs/event-source.js'
import { CalendarContext } from './CalendarContext.js'

export const changeHandlerPlugin = createPlugin({
  name: 'change-handler',
  optionChangeHandlers: {
    events(events, context) {
      handleEventSources([events], context)
    },
    eventSources: handleEventSources,
  },
})

/*
BUG: if `event` was supplied, all previously-given `eventSources` will be wiped out
*/
function handleEventSources(inputs, context: CalendarContext) {
  let unfoundSources: EventSource<any>[] = hashValuesToArray(context.getCurrentData().eventSources)

  if (
    unfoundSources.length === 1 &&
    inputs.length === 1 &&
    Array.isArray(unfoundSources[0]._raw) &&
    Array.isArray(inputs[0])
  ) {
    context.dispatch({
      type: 'RESET_RAW_EVENTS',
      sourceId: unfoundSources[0].sourceId,
      rawEvents: inputs[0],
    })
    return
  }

  let newInputs = []

  for (let input of inputs) {
    let inputFound = false

    for (let i = 0; i < unfoundSources.length; i += 1) {
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
      sourceId: unfoundSource.sourceId,
    })
  }

  for (let newInput of newInputs) {
    context.calendarApi.addEventSource(newInput)
  }
}
