import { DateProfile, DateProfileGenerator, isDateProfilesEqual } from '../DateProfileGenerator'
import { Action } from './types'
import { DateMarker } from '../datelib/marker'
import { rangeContainsMarker } from '../datelib/date-range'


export function reduceDateProfile(currentDateProfile: DateProfile | null, action: Action, currentDate: DateMarker, dateProfileGenerator: DateProfileGenerator): DateProfile {
  let newDateProfile: DateProfile

  switch (action.type) {
    case 'INIT':
      newDateProfile = dateProfileGenerator.build(
        currentDate,
        undefined,
        true // forceToValid
      )
      break

    case 'CHANGE_DATE':
    case 'CHANGE_VIEW_TYPE':
      if (
        !currentDateProfile.activeRange ||
        !rangeContainsMarker(currentDateProfile.currentRange, (action as any).dateMarker)
      ) {
        newDateProfile = dateProfileGenerator.build(
          action.dateMarker || currentDate,
          undefined,
          true // forceToValid
        )
      }
      break

    case 'PREV':
      newDateProfile = dateProfileGenerator.buildPrev(currentDateProfile, currentDate)
      break

    case 'NEXT':
      newDateProfile = dateProfileGenerator.buildNext(currentDateProfile, currentDate)
      break
  }

  if (
    newDateProfile &&
    newDateProfile.isValid &&
    !(currentDateProfile && isDateProfilesEqual(currentDateProfile, newDateProfile))
  ) {
    return newDateProfile
  } else {
    return currentDateProfile
  }
}
