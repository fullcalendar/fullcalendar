import { DateMarker, startOfDay, addDays, createDuration, DateRange, DateEnv } from '@full-ui/headless-calendar'
import { CalendarNowManager } from './reducers/CalendarNowManager'

export interface NowTimerRunnerInput {
  unit: string,
  unitValue: number
  nowIndicatorSnap: boolean | 'auto'
  nowManager: CalendarNowManager
  dateEnv: DateEnv
}

export interface NowTimerRunnerOutput {
  nowDate: DateMarker
  todayRange: DateRange
}

export class NowTimerRunner {
  // input
  private unit: string
  private unitValue: number
  private nowIndicatorSnap: boolean | 'auto'
  private nowManager: CalendarNowManager
  private dateEnv: DateEnv

  // output
  private nowDate: DateMarker
  private todayRange: DateRange

  // internal
  private timeoutId: any
  private isMounted = false

  constructor(
    private handleChange: () => void,
  ) {}

  update(input: NowTimerRunnerInput): NowTimerRunnerOutput {
    if (!this.isMounted) {
      this.isMounted = true

      // init inputs
      this.unit = input.unit
      this.unitValue = input.unitValue
      this.nowIndicatorSnap = input.nowIndicatorSnap
      this.nowManager = input.nowManager
      this.dateEnv = input.dateEnv

      // init outputs
      const timing = this.computeTiming()
      this.nowDate = timing.nowDate
      this.todayRange = timing.todayRange

      // init listeners
      this.setTimeout()
      this.nowManager.addResetListener(this.handleRefresh)

      // fired tab becomes visible after being hidden
      // SSR check. CalendarDataManager calls top-level sync :(
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this.handleVisibilityChange)
      }
    } else if (
      input.unit !== this.unit ||
      input.unitValue !== this.unitValue ||
      input.nowIndicatorSnap !== this.nowIndicatorSnap ||
      input.nowManager !== this.nowManager ||
      input.dateEnv !== this.dateEnv
    ) {
      // update inputs
      this.unit = input.unit
      this.unitValue = input.unitValue
      this.nowIndicatorSnap = input.nowIndicatorSnap
      this.nowManager = input.nowManager
      this.dateEnv = input.dateEnv

      this.clearTimeout()
      this.setTimeout()
    }

    return {
      nowDate: this.nowDate,
      todayRange: this.todayRange,
    }
  }

  destroy() {
    if (this.isMounted) {
      this.isMounted = false
      this.clearTimeout()
      this.nowManager.removeResetListener(this.handleRefresh)

      // SSR check. CalendarDataManager calls top-level sync :(
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange)
      }
    }
  }

  private computeTiming() {
    let unroundedNow = this.nowManager.getDateMarker()
    let { unit, unitValue, nowIndicatorSnap, dateEnv } = this

    if (nowIndicatorSnap === 'auto') {
      nowIndicatorSnap =
        // large unit?
        /year|month|week|day/.test(unit) ||
        // if slotDuration 30 mins for example, would NOT appear to snap (legacy behavior)
        (unitValue || 1) === 1
    }

    let nowDate: DateMarker
    let waitMs: number

    if (nowIndicatorSnap) {
      nowDate = dateEnv.startOf(unroundedNow, unit) // aka currentUnitStart
      let nextUnitStart = dateEnv.add(nowDate, createDuration(1, unit))
      waitMs = nextUnitStart.valueOf() - unroundedNow.valueOf()
    } else {
      nowDate = unroundedNow
      waitMs = 1000 * 60 // 1 minute
    }

    // there is a max setTimeout ms value (https://stackoverflow.com/a/3468650/96342)
    // ensure no longer than a day
    waitMs = Math.min(1000 * 60 * 60 * 24, waitMs)

    return {
      nowDate,
      todayRange: buildDayRange(nowDate),
      waitMs,
    }
  }

  private setTimeout(waitMs: number = this.computeTiming().waitMs) {
    // NOTE: timeout could take longer than expected if tab sleeps,
    // which is why we listen to 'visibilitychange'
    this.timeoutId = setTimeout(() => {
      // NOTE: timeout could also return *earlier* than expected, and we need to wait like 2 ms more
      // This is why use use same waitMs from computeTiming
      const timing = this.computeTiming()
      this.nowDate = timing.nowDate
      this.todayRange = timing.todayRange
      this.handleChange()
      this.setTimeout(timing.waitMs)
    }, waitMs)
  }

  private clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }

  private handleRefresh = () => {
    let timing = this.computeTiming()

    if (timing.nowDate.valueOf() !== this.nowDate.valueOf()) {
      this.nowDate = timing.nowDate
      this.todayRange = timing.todayRange
      this.handleChange()
    }

    this.clearTimeout()
    this.setTimeout(timing.waitMs)
  }

  private handleVisibilityChange = () => {
    if (!document.hidden) {
      this.handleRefresh()
    }
  }
}

function buildDayRange(date: DateMarker): DateRange { // TODO: make this a general util
  let start = startOfDay(date)
  let end = addDays(start, 1)

  return { start, end }
}
