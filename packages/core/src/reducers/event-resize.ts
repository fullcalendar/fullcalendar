import { EventInteractionState } from '../interactions/event-interaction-state'
import { Action } from './types'


export function reduceEventResize(currentResize: EventInteractionState | null, action: Action): EventInteractionState | null {
  switch (action.type) {
    case 'INIT':
    case 'UNSET_EVENT_RESIZE':
      return null

    case 'SET_EVENT_RESIZE':
      let newResize = action.state

      return {
        affectedEvents: newResize.affectedEvents,
        mutatedEvents: newResize.mutatedEvents,
        isEvent: newResize.isEvent
      }

    default:
      return currentResize
  }
}
