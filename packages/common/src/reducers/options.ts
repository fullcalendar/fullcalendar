import { Action } from './Action'

export function reduceDynamicOptionOverrides(dynamicOptionOverrides, action: Action) {
  switch (action.type) {
    case 'SET_OPTION':
      return { ...dynamicOptionOverrides, [action.optionName]: action.rawOptionValue }
    default:
      return dynamicOptionOverrides
  }
}
