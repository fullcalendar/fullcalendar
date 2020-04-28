import { DateProfile, DateProfileGenerator } from '../DateProfileGenerator'
import { Action } from './Action'
import { DateMarker } from '../datelib/marker'
import { rangeContainsMarker } from '../datelib/date-range'


export function reduceDateProfile(currentDateProfile: DateProfile | null, action: Action, currentDate: DateMarker, dateProfileGenerator: DateProfileGenerator): DateProfile {
  switch (action.type) {

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
  }

  return currentDateProfile
}
