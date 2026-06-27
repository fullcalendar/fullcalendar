import { CalendarApi } from './api/CalendarApi'
import { ViewApi} from './api/ViewApi'
import { ButtonStateMap, NavButtonState } from './structs/button-state'
import { DateInput, DurationInput } from '@full-ui/headless-calendar'
import { CalendarApiImpl } from './api/CalendarApiImpl'

const blankButtonState: NavButtonState = {
  text: '', hint: '', isDisabled: false,
}

export class CalendarController {
  private calendarApi?: CalendarApi

  constructor(
    private handleDateChange?: () => void, // HACK for "nominal" vue3 ts types
  ) {}

  today(): void {
    this.calendarApi?.today()
  }

  prev(): void {
    this.calendarApi?.prev()
  }

  next(): void {
    this.calendarApi?.next()
  }

  prevYear(): void {
    this.calendarApi?.prevYear()
  }

  nextYear(): void {
    this.calendarApi?.nextYear()
  }

  gotoDate(zonedDateInput: DateInput): void {
    this.calendarApi?.gotoDate(zonedDateInput)
  }

  incrementDate(duration: DurationInput): void {
    this.calendarApi?.incrementDate(duration)
  }

  changeView(viewType: string): void {
    this.calendarApi?.changeView(viewType)
  }

  get view(): ViewApi | undefined {
    return this.calendarApi?.view
  }

  getDate(): Date | undefined {
    return this.calendarApi?.getDate()
  }

  getButtonState(): ButtonStateMap {
    const { calendarApi } = this

    return (calendarApi && (calendarApi as CalendarApiImpl).getButtonState()) || {
      today: blankButtonState,
      prev: blankButtonState,
      next: blankButtonState,
      prevYear: blankButtonState,
      nextYear: blankButtonState,
    }
  }

  _setApi(calendarApi: CalendarApi | undefined): void {
    if (this.calendarApi !== calendarApi) {
      if (this.calendarApi) {
        this.calendarApi.off('datesSet', this.handleDateChange)
        this.calendarApi = undefined
      }
      if (calendarApi) {
        this.calendarApi = calendarApi
        calendarApi.on('datesSet', this.handleDateChange)
      }
    }
  }
}
