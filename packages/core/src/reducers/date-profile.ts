import { DateProfile, DateProfileGenerator, DATE_PROFILE_OPTIONS } from '../DateProfileGenerator'
import { Action } from './types'
import { DateMarker } from '../datelib/marker'
import { rangeContainsMarker } from '../datelib/date-range'


export function reduceDateProfile(currentDateProfile: DateProfile | null, action: Action, currentDate: DateMarker, dateProfileGenerator: DateProfileGenerator): DateProfile {
  switch (action.type) {
    case 'INIT':
      return dateProfileGenerator.build(currentDate)

    case 'CHANGE_VIEW_TYPE':
      return dateProfileGenerator.build(action.dateMarker || currentDate)

    case 'CHANGE_DATE':
      if (
        !currentDateProfile.activeRange ||
        !rangeContainsMarker(currentDateProfile.currentRange, action.dateMarker) // don't move if date already in view
      ) {
        return dateProfileGenerator.build(action.dateMarker)
      }
      break

    case 'PREV':
      let dp0 = dateProfileGenerator.buildPrev(currentDateProfile, currentDate)
      if (dp0.isValid) {
        return dp0
      }
      break

    case 'NEXT':
      let dp1 = dateProfileGenerator.buildNext(currentDateProfile, currentDate)
      if (dp1.isValid) {
        return dp1
      }
      break

    case 'SET_OPTION':
      if (DATE_PROFILE_OPTIONS[action.optionName]) {
        return dateProfileGenerator.build(currentDate) // dateProfileGenerator will be newly-created
      }
      break
  }

  return currentDateProfile
}
