import { DateEnv } from '@full-ui/headless-calendar'
import { CalendarData } from '../reducers/data-types'
import { CalendarApi } from './CalendarApi'
import { ViewApi } from './ViewApi'

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
    const { dateProfile } = this.getCurrentData()
    return this.dateEnv.toDate((dateProfile.activeRange || dateProfile.currentRange).start)
  }

  get activeEnd(): Date {
    const { dateProfile } = this.getCurrentData()
    return this.dateEnv.toDate((dateProfile.activeRange || dateProfile.currentRange).end)
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
