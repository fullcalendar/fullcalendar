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
  nowMs: number // exact instant of nowDate. unambiguous during DST transitions
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
  private nowMs: number
  private todayRange: DateRange

  // internal
  private timeoutId: any
  private nextChangeMs: number // when the outputs are next due to change, as epoch ms
  private isStarted = false

  constructor(
    private handleChange: () => void,
  ) {}

  /*
  Computes the outputs. Called during render, so it never arms the timer or adds listeners itself:
  a render that never mounts (a discarded Suspense render) or that runs while hidden in a React
  <Activity> would leave them with nothing to clean them up (#8112, #8092). start() does that.
  */
  update(input: NowTimerRunnerInput): NowTimerRunnerOutput {
    if (!this.nowManager) {
      // init inputs
      this.unit = input.unit
      this.unitValue = input.unitValue
      this.nowIndicatorSnap = input.nowIndicatorSnap
      this.nowManager = input.nowManager
      this.dateEnv = input.dateEnv

      // init outputs
      const timing = this.computeTiming()
      this.nowDate = timing.nowDate
      this.nowMs = timing.nowMs
      this.todayRange = timing.todayRange
      this.nextChangeMs = timing.nextChangeMs
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

      // recompute outputs — a dateEnv (timezone) change re-projects the same exact "now"
      // to a different civil time. (the nowManager reset listener can't do this: it fires
      // before this runner receives the new dateEnv, so it recomputes with the old one)
      const timing = this.computeTiming()
      this.nowDate = timing.nowDate
      this.nowMs = timing.nowMs
      this.todayRange = timing.todayRange
      this.nextChangeMs = timing.nextChangeMs

      if (this.isStarted) {
        this.clearTimeout()
        this.setTimeout(timing.waitMs)
      }
    }

    return {
      nowDate: this.nowDate,
      nowMs: this.nowMs,
      todayRange: this.todayRange,
    }
  }

  /*
  Arms the timer and adds the listeners. Call on mount, after the first update(). Idempotent, and
  callable again after stop(), for remounts (React Strict Mode, a shown <Activity>).
  Refreshes the outputs only if their change came due while stopped, so mounting alone never
  causes a re-render. Otherwise waits out the remainder.
  */
  start() {
    if (!this.isStarted && this.nowManager) {
      this.isStarted = true
      this.nowManager.addResetListener(this.handleRefresh)

      // fired tab becomes visible after being hidden
      // SSR check. the vanilla Calendar starts in its constructor
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this.handleVisibilityChange)
      }

      const remainingMs = this.nextChangeMs - this.nowManager.getEpochMs()

      if (remainingMs > 0) {
        this.setTimeout(remainingMs)
      } else {
        this.handleRefresh()
      }
    }
  }

  stop() {
    if (this.isStarted) {
      this.isStarted = false
      this.clearTimeout()
      this.nowManager.removeResetListener(this.handleRefresh)

      // SSR check. the vanilla Calendar starts in its constructor
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange)
      }
    }
  }

  private computeTiming() {
    let { unit, unitValue, nowIndicatorSnap, dateEnv } = this
    let unroundedNowMs = this.nowManager.getEpochMs()
    let unroundedNow = dateEnv.timestampToMarker(unroundedNowMs)

    if (nowIndicatorSnap === 'auto') {
      nowIndicatorSnap =
        // large unit?
        /year|month|week|day/.test(unit) ||
        // if slotDuration 30 mins for example, would NOT appear to snap (legacy behavior)
        (unitValue || 1) === 1
    }

    let nowDate: DateMarker
    let nowMs: number
    let waitMs: number

    if (nowIndicatorSnap) {
      nowDate = dateEnv.startOf(unroundedNow, unit) // aka currentUnitStart
      nowMs = resolveSnappedInstant(nowDate, unroundedNowMs, dateEnv)
      let nextUnitStart = dateEnv.add(nowDate, createDuration(1, unit))
      waitMs = resolveNextSnappedInstant(nextUnitStart, unroundedNowMs, dateEnv) - unroundedNowMs
    } else {
      nowDate = unroundedNow
      nowMs = unroundedNowMs
      waitMs = 1000 * 60 // 1 minute
    }

    // there is a max setTimeout ms value (https://stackoverflow.com/a/3468650/96342)
    // ensure no longer than a day
    waitMs = Math.min(1000 * 60 * 60 * 24, waitMs)

    return {
      nowDate,
      nowMs,
      todayRange: buildDayRange(nowDate),
      waitMs,
      nextChangeMs: unroundedNowMs + waitMs,
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
      this.nowMs = timing.nowMs
      this.todayRange = timing.todayRange
      this.nextChangeMs = timing.nextChangeMs
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
    this.nextChangeMs = timing.nextChangeMs

    if (
      timing.nowDate.valueOf() !== this.nowDate.valueOf() ||
      timing.nowMs !== this.nowMs // marker alone can't detect fold-hour changes
    ) {
      this.nowDate = timing.nowDate
      this.nowMs = timing.nowMs
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

/*
The instant of `snappedMarker` (a civil rounding of the time at `rawMs`), choosing the
occurrence on the same side of any DST transition as `rawMs` — during a fall-back fold, a
snapped civil time exists twice. Falls back to deterministic first-occurrence resolution
when the same-offset guess doesn't round-trip (e.g. snapping crossed the transition).
*/
function resolveSnappedInstant(snappedMarker: DateMarker, rawMs: number, dateEnv: DateEnv): number {
  const offsetMs = dateEnv.timestampToMarker(rawMs).valueOf() - rawMs
  const candidateMs = snappedMarker.valueOf() - offsetMs

  if (dateEnv.timestampToMarker(candidateMs).valueOf() === snappedMarker.valueOf()) {
    return candidateMs
  }

  return dateEnv.toDate(snappedMarker).valueOf()
}

/*
The instant of the next change to the snapped display: the next civil unit boundary, or any
DST transition before it — at a fall-back transition the clock jumps backward onto an earlier
unit start (no civil boundary is crossed), and waking there recomputes with fresh offsets, so
boundaries beyond a transition never need resolving here. Scenarios (NY fall-back, hour unit):
first fold pass (05:30Z): guess for 02:00 fails round-trip → falls back to 07:00Z; transition
06:00Z wins. Second pass (06:30Z): guess 07:00Z round-trips; no transition ahead. Spring
forward: the nonexistent next unit normalizes past the gap; the transition candidate fires at
the jump itself.
*/
function resolveNextSnappedInstant(
  nextUnitStart: DateMarker,
  rawMs: number,
  dateEnv: DateEnv,
): number {
  const nextSnappedMs = resolveSnappedInstant(nextUnitStart, rawMs, dateEnv)
  const transitionMs = findNextOffsetTransitionMs(
    rawMs,
    dateEnv,
    Math.min(nextSnappedMs - rawMs, 48 * 60 * 60 * 1000),
  )

  return transitionMs != null ? Math.min(nextSnappedMs, transitionMs) : nextSnappedMs
}

// Finds the first instant whose UTC offset differs from rawMs within a short search horizon.
function findNextOffsetTransitionMs(rawMs: number, dateEnv: DateEnv, horizonMs: number): number | undefined {
  if (horizonMs <= 0) {
    return undefined
  }

  const startOffsetMs = offsetAt(rawMs, dateEnv)
  let lowerMs = rawMs
  let upperMs = rawMs + horizonMs

  if (offsetAt(upperMs, dateEnv) === startOffsetMs) {
    return undefined
  }

  while (upperMs - lowerMs > 1) {
    const middleMs = Math.floor((lowerMs + upperMs) / 2)

    if (offsetAt(middleMs, dateEnv) === startOffsetMs) {
      lowerMs = middleMs
    } else {
      upperMs = middleMs
    }
  }

  return upperMs > rawMs ? upperMs : undefined
}

function offsetAt(instantMs: number, dateEnv: DateEnv): number {
  return dateEnv.timestampToMarker(instantMs).valueOf() - instantMs
}

function buildDayRange(date: DateMarker): DateRange { // TODO: make this a general util
  let start = startOfDay(date)
  let end = addDays(start, 1)

  return { start, end }
}
