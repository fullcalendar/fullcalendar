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

    case 'PREV':
      newDateProfile = dateProfileGenerator.buildPrev(currentDateProfile, currentDate)
      break

    case 'NEXT':
      newDateProfile = dateProfileGenerator.buildNext(currentDateProfile, currentDate)
      break

    case 'SET_DATE':
      if (
        !currentDateProfile.activeRange ||
        !rangeContainsMarker(currentDateProfile.currentRange, action.dateMarker)
      ) {
        newDateProfile = dateProfileGenerator.build(
          action.dateMarker,
          undefined,
          true // forceToValid
        )
      }
      break

    case 'SET_VIEW_TYPE':
      newDateProfile = dateProfileGenerator.build(
        action.dateMarker || currentDate,
        undefined,
        true // forceToValid
      )
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
