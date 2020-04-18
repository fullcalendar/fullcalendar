import { DateEnv } from './datelib/env';
import { DateProfile } from './DateProfileGenerator';

export interface ViewApi {
  type: string
  title: string
  activeStart: Date
  activeEnd: Date
  currentStart: Date
  currentEnd: Date
}

export class ViewApi {

  constructor(
    public type: string,
    dateProfile: DateProfile,
    public title: string,
    private options: any,
    dateEnv: DateEnv
  ) {
    this.activeStart = dateEnv.toDate(dateProfile.activeRange.start)
    this.activeEnd = dateEnv.toDate(dateProfile.activeRange.end)
    this.currentStart = dateEnv.toDate(dateProfile.currentRange.start)
    this.currentEnd = dateEnv.toDate(dateProfile.currentRange.end)
  }

  getOption(name: string) {
    return this.options[name]
  }

}
