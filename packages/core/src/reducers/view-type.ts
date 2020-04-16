import { Action } from './types'


export function reduceViewType(viewType: string, action: Action, availableViewHash): string {
  // for INIT, viewType will have already been set

  switch (action.type) {
    case 'SET_VIEW_TYPE':
      return viewType = action.viewType
  }

  if (!availableViewHash[viewType]) {
    throw new Error(`viewType "${viewType}" is not available. Please make sure you've loaded all neccessary plugins`)
  }

  return viewType
}
