import { DateProfile } from './DateProfileGenerator'
import { DateEnv } from './datelib/env'

export default class ViewApi {

  activeStart: Date
  activeEnd: Date
  currentStart: Date
  currentEnd: Date

  constructor(
    public type: string,
    public title: string,
    dateProfile: DateProfile,
    dateEnv: DateEnv
  ) {
    this.activeStart = dateEnv.toDate(dateProfile.activeRange.start)
    this.activeEnd = dateEnv.toDate(dateProfile.activeRange.end)
    this.currentStart = dateEnv.toDate(dateProfile.currentRange.start)
    this.currentEnd = dateEnv.toDate(dateProfile.currentRange.end)
  }

}
