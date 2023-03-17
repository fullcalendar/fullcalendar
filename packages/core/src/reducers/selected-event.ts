import { Action } from './Action.js'

export function reduceSelectedEvent(currentInstanceId: string, action: Action): string {
  switch (action.type) {
    case 'UNSELECT_EVENT':
      return ''

    case 'SELECT_EVENT':
      return action.eventInstanceId

    default:
      return currentInstanceId
  }
}
