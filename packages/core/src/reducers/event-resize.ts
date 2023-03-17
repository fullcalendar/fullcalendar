import { EventInteractionState } from '../interactions/event-interaction-state.js'
import { Action } from './Action.js'

export function reduceEventResize(currentResize: EventInteractionState | null, action: Action): EventInteractionState | null {
  let newResize: EventInteractionState

  switch (action.type) {
    case 'UNSET_EVENT_RESIZE':
      return null

    case 'SET_EVENT_RESIZE':
      newResize = action.state

      return {
        affectedEvents: newResize.affectedEvents,
        mutatedEvents: newResize.mutatedEvents,
        isEvent: newResize.isEvent,
      }

    default:
      return currentResize
  }
}
