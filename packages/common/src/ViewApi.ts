import { DateEnv } from './datelib/env'
import { CalendarData } from './reducers/data-types'

// no public types yet. when there are, export from:
// import {} from './api-type-deps'

export class ViewApi { // always represents the current view. otherwise, it'd need to change value every time date changes
  constructor(
    public type: string,
    private getCurrentData: () => CalendarData,
    private dateEnv: DateEnv,
  ) {
  }

  get calendar() {
    return this.getCurrentData().calendarApi
  }

  get title() {
    return this.getCurrentData().viewTitle
  }

  get activeStart() {
    return this.dateEnv.toDate(this.getCurrentData().dateProfile.activeRange.start)
  }

  get activeEnd() {
    return this.dateEnv.toDate(this.getCurrentData().dateProfile.activeRange.end)
  }

  get currentStart() {
    return this.dateEnv.toDate(this.getCurrentData().dateProfile.currentRange.start)
  }

  get currentEnd() {
    return this.dateEnv.toDate(this.getCurrentData().dateProfile.currentRange.end)
  }

  getOption(name: string) {
    return this.getCurrentData().options[name] // are the view-specific options
  }
}
