import { Action } from './Action.js'
import { EventInteractionState } from '../interactions/event-interaction-state.js'

export function reduceEventDrag(currentDrag: EventInteractionState | null, action: Action): EventInteractionState | null {
  let newDrag: EventInteractionState

  switch (action.type) {
    case 'UNSET_EVENT_DRAG':
      return null

    case 'SET_EVENT_DRAG':
      newDrag = action.state

      return {
        affectedEvents: newDrag.affectedEvents,
        mutatedEvents: newDrag.mutatedEvents,
        isEvent: newDrag.isEvent,
      }

    default:
      return currentDrag
  }
}
