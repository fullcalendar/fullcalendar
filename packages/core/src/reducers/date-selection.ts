import { DateSpan } from '../structs/date-span'
import { Action } from './Action'

export function reduceDateSelection(currentSelection: DateSpan | null, action: Action) {
  switch (action.type) {
    case 'UNSELECT_DATES':
      return null

    case 'SELECT_DATES':
      return action.selection

    default:
      return currentSelection
  }
}
