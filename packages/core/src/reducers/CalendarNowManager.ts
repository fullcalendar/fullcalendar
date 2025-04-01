import { DateEnv, DateInput } from '../datelib/env.js'
import { DateMarker } from '../datelib/marker.js'

/*
TODO: test switching timezones when NO timezone plugin
*/
export class CalendarNowManager {
  private dateEnv?: DateEnv
  private resetListeners = new Set<() => void>()
  // technique 1
  private nowAnchorDate?: Date
  private nowAnchorQueried?: number // epoch-nanoseconds when nowAnchor created
  // technique 2
  private nowFn?: () => DateInput

  handleInput(
    dateEnv: DateEnv, // will change if timezone setup changed
    nowInput: DateInput | (() => DateInput),
  ): void {
    const oldDateEnv = this.dateEnv

    if (dateEnv !== oldDateEnv) {
      if (typeof nowInput === 'function') {
        this.nowFn = nowInput
      } else if (!oldDateEnv) { // first time?
        this.nowAnchorDate = dateEnv.toDate(
          nowInput
            ? dateEnv.createMarker(nowInput)
            : dateEnv.createNowMarker()
        )
        this.nowAnchorQueried = Date.now()
      }

      this.dateEnv = dateEnv

      // not first time? fire reset handlers
      if (oldDateEnv) {
        for (const resetListener of this.resetListeners.values()) {
          resetListener()
        }
      }
    }
  }

  getDateMarker(): DateMarker {
    return this.nowAnchorDate
      ? this.dateEnv.timestampToMarker(
          this.nowAnchorDate.valueOf() +
          (Date.now() - this.nowAnchorQueried),
        )
      : this.dateEnv.createMarker(this.nowFn!())
  }

  addResetListener(handler: () => void): void {
    this.resetListeners.add(handler)
  }

  removeResetListener(handler: () => void): void {
    this.resetListeners.delete(handler)
  }
}
