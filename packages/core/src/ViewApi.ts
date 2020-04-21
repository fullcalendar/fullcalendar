import { DateEnv } from './datelib/env'
import { CalendarState } from './reducers/types'


export class ViewApi { // always represents the current view

  constructor(
    public type: string,
    private getCurrentState: () => CalendarState,
    private dateEnv: DateEnv
  ) {
  }


  get title() {
    return this.getCurrentState().viewTitle
  }


  get activeStart() {
    return this.dateEnv.toDate(this.getCurrentState().dateProfile.activeRange.start)
  }


  get activeEnd() {
    return this.dateEnv.toDate(this.getCurrentState().dateProfile.activeRange.end)
  }


  get currentStart() {
    return this.dateEnv.toDate(this.getCurrentState().dateProfile.currentRange.start)
  }


  get currentEnd() {
    return this.dateEnv.toDate(this.getCurrentState().dateProfile.currentRange.end)
  }


  getOption(name: string) {
    return this.getCurrentState().options[name] // are the view-specific options
  }

}
