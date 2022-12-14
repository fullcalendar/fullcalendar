import { DateEnv } from '../datelib/env.js'
import { CalendarData } from '../reducers/data-types.js'
import { CalendarApi } from './CalendarApi.js'
import { ViewApi } from './ViewApi.js'

// always represents the current view. otherwise, it'd need to change value every time date changes
export class ViewImpl implements ViewApi {
  constructor(
    public type: string,
    private getCurrentData: () => CalendarData,
    private dateEnv: DateEnv,
  ) {
  }

  get calendar(): CalendarApi {
    return this.getCurrentData().calendarApi
  }

  get title(): string {
    return this.getCurrentData().viewTitle
  }

  get activeStart(): Date {
    return this.dateEnv.toDate(this.getCurrentData().dateProfile.activeRange.start)
  }

  get activeEnd(): Date {
    return this.dateEnv.toDate(this.getCurrentData().dateProfile.activeRange.end)
  }

  get currentStart(): Date {
    return this.dateEnv.toDate(this.getCurrentData().dateProfile.currentRange.start)
  }

  get currentEnd(): Date {
    return this.dateEnv.toDate(this.getCurrentData().dateProfile.currentRange.end)
  }

  getOption(name: string): any {
    return this.getCurrentData().options[name] // are the view-specific options
  }
}
