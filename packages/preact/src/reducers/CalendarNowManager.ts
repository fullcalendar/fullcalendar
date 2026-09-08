import { DateEnv, DateMarker, DateInput } from '@full-ui/headless-calendar'

/*
TODO: test switching timezones when NO timezone plugin
*/
export class CalendarNowManager {
  private dateEnv?: DateEnv
  private resetListeners = new Set<() => void>()
  // technique 1
  private nowAnchorDate?: Date
  private nowAnchorQueried?: number // epoch-milliseconds when nowAnchor created
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
        // inputs that express an exact instant (ISO with offset, Date, epoch ms) keep their
        // exact epoch (marker round-trips are ambiguous during DST folds). civil inputs
        // resolve deterministically to the first occurrence.
        this.nowAnchorDate = nowInput
          ? resolveInputToDate(nowInput, dateEnv)
          : new Date()
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
    return this.dateEnv.timestampToMarker(this.getEpochMs())
  }

  /*
  The exact instant of "now". Unlike a DateMarker, unambiguous during DST transitions.
  When `now` was supplied as a function returning a civil time, resolves deterministically.
  */
  getEpochMs(): number {
    return this.nowAnchorDate
      ? this.nowAnchorDate.valueOf() + (Date.now() - this.nowAnchorQueried)
      : resolveInputToDate(this.nowFn!(), this.dateEnv).valueOf()
  }

  addResetListener(handler: () => void): void {
    this.resetListeners.add(handler)
  }

  removeResetListener(handler: () => void): void {
    this.resetListeners.delete(handler)
  }
}

/*
Resolves a date input to an exact-instant Date. Prefers the instant the input itself
expressed (unambiguous during DST folds); falls back to first-occurrence resolution.
*/
function resolveInputToDate(input: DateInput, dateEnv: DateEnv): Date {
  const meta = dateEnv.createMarkerMeta(input)

  return meta.instantMs != null
    ? new Date(meta.instantMs)
    : dateEnv.toDate(meta.marker)
}
