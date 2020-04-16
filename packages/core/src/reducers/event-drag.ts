import { Action } from './types'
import { EventInteractionState } from '../interactions/event-interaction-state'


export function reduceEventDrag(currentDrag: EventInteractionState | null, action: Action): EventInteractionState | null {
  switch (action.type) {
    case 'INIT':
    case 'UNSET_EVENT_DRAG':
      return null

    case 'SET_EVENT_DRAG':
      let newDrag = action.state

      return {
        affectedEvents: newDrag.affectedEvents,
        mutatedEvents: newDrag.mutatedEvents,
        isEvent: newDrag.isEvent
      }

    default:
      return currentDrag
  }
}
