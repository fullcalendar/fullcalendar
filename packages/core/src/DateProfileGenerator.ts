import { DateMarker, startOfDay, addDays } from './datelib/marker'
import { Duration, createDuration, getWeeksFromInput, asRoughDays, asRoughMs, greatestDurationDenominator, durationsEqual } from './datelib/duration'
import { DateRange, OpenDateRange, constrainMarkerToRange, intersectRanges, rangesIntersect, parseRange, rangesEqual } from './datelib/date-range'
import { ViewSpec } from './structs/view-spec'
import { DateEnv } from './datelib/env'
import Calendar from './Calendar'
import { computeVisibleDayRange } from './util/misc'


export interface DateProfile {
  currentRange: DateRange
  currentRangeUnit: string
  isRangeAllDay: boolean
  validRange: OpenDateRange
  activeRange: DateRange
  renderRange: DateRange
  minTime: Duration
  maxTime: Duration
  isValid: boolean
  dateIncrement: Duration
}


export default class DateProfileGenerator {

  viewSpec: ViewSpec
  options: any
  dateEnv: DateEnv
  calendar: Calendar // avoid
  isHiddenDayHash: boolean[]


  constructor(viewSpec: ViewSpec, calendar: Calendar) {
    this.viewSpec = viewSpec
    this.options = viewSpec.options
    this.dateEnv = calendar.dateEnv
    this.calendar = calendar

    this.initHiddenDays()
  }


  /* Date Range Computation
  ------------------------------------------------------------------------------------------------------------------*/


  // Builds a structure with info about what the dates/ranges will be for the "prev" view.
  buildPrev(currentDateProfile: DateProfile, currentDate: DateMarker): DateProfile {
    let { dateEnv } = this

    let prevDate = dateEnv.subtract(
      dateEnv.startOf(currentDate, currentDateProfile.currentRangeUnit), // important for start-of-month
      currentDateProfile.dateIncrement
    )

    return this.build(prevDate, -1)
  }


  // Builds a structure with info about what the dates/ranges will be for the "next" view.
  buildNext(currentDateProfile: DateProfile, currentDate: DateMarker): DateProfile {
    let { dateEnv } = this

    let nextDate = dateEnv.add(
      dateEnv.startOf(currentDate, currentDateProfile.currentRangeUnit), // important for start-of-month
      currentDateProfile.dateIncrement
    )

    return this.build(nextDate, 1)
  }


  // Builds a structure holding dates/ranges for rendering around the given date.
  // Optional direction param indicates whether the date is being incremented/decremented
  // from its previous value. decremented = -1, incremented = 1 (default).
  build(currentDate: DateMarker, direction?, forceToValid = false): DateProfile {
    let validRange: DateRange
    let minTime = null
    let maxTime = null
    let currentInfo
    let isRangeAllDay
    let renderRange: DateRange
    let activeRange: DateRange
    let isValid

    validRange = this.buildValidRange()
    validRange = this.trimHiddenDays(validRange)

    if (forceToValid) {
      currentDate = constrainMarkerToRange(currentDate, validRange)
    }

    currentInfo = this.buildCurrentRangeInfo(currentDate, direction)
    isRangeAllDay = /^(year|month|week|day)$/.test(currentInfo.unit)
    renderRange = this.buildRenderRange(
      this.trimHiddenDays(currentInfo.range),
      currentInfo.unit,
      isRangeAllDay
    )
    renderRange = this.trimHiddenDays(renderRange)
    activeRange = renderRange

    if (!this.options.showNonCurrentDates) {
      activeRange = intersectRanges(activeRange, currentInfo.range)
    }

    minTime = createDuration(this.options.minTime)
    maxTime = createDuration(this.options.maxTime)
    activeRange = this.adjustActiveRange(activeRange, minTime, maxTime)
    activeRange = intersectRanges(activeRange, validRange) // might return null

    // it's invalid if the originally requested date is not contained,
    // or if the range is completely outside of the valid range.
    isValid = rangesIntersect(currentInfo.range, validRange)

    return {
      // constraint for where prev/next operations can go and where events can be dragged/resized to.
      // an object with optional start and end properties.
      validRange: validRange,

      // range the view is formally responsible for.
      // for example, a month view might have 1st-31st, excluding padded dates
      currentRange: currentInfo.range,

      // name of largest unit being displayed, like "month" or "week"
      currentRangeUnit: currentInfo.unit,

      isRangeAllDay,

      // dates that display events and accept drag-n-drop
      // will be `null` if no dates accept events
      activeRange,

      // date range with a rendered skeleton
      // includes not-active days that need some sort of DOM
      renderRange,

      // Duration object that denotes the first visible time of any given day
      minTime,

      // Duration object that denotes the exclusive visible end time of any given day
      maxTime,

      isValid,

      // how far the current date will move for a prev/next operation
      dateIncrement: this.buildDateIncrement(currentInfo.duration)
        // pass a fallback (might be null) ^
    }
  }


  // Builds an object with optional start/end properties.
  // Indicates the minimum/maximum dates to display.
  // not responsible for trimming hidden days.
  buildValidRange(): OpenDateRange {
    return this.getRangeOption('validRange', this.calendar.getNow()) ||
      { start: null, end: null } // completely open-ended
  }


  // Builds a structure with info about the "current" range, the range that is
  // highlighted as being the current month for example.
  // See build() for a description of `direction`.
  // Guaranteed to have `range` and `unit` properties. `duration` is optional.
  buildCurrentRangeInfo(date: DateMarker, direction) {
    let { viewSpec, dateEnv } = this
    let duration = null
    let unit = null
    let range = null
    let dayCount

    if (viewSpec.duration) {
      duration = viewSpec.duration
      unit = viewSpec.durationUnit
      range = this.buildRangeFromDuration(date, direction, duration, unit)
    } else if ((dayCount = this.options.dayCount)) {
      unit = 'day'
      range = this.buildRangeFromDayCount(date, direction, dayCount)
    } else if ((range = this.buildCustomVisibleRange(date))) {
      unit = dateEnv.greatestWholeUnit(range.start, range.end).unit
    } else {
      duration = this.getFallbackDuration()
      unit = greatestDurationDenominator(duration).unit
      range = this.buildRangeFromDuration(date, direction, duration, unit)
    }

    return { duration: duration, unit: unit, range }
  }


  getFallbackDuration(): Duration {
    return createDuration({ day: 1 })
  }


  // Returns a new activeRange to have time values (un-ambiguate)
  // minTime or maxTime causes the range to expand.
  adjustActiveRange(range: DateRange, minTime: Duration, maxTime: Duration) {
    let { dateEnv } = this
    let start = range.start
    let end = range.end

    if ((this.viewSpec.class as any).prototype.usesMinMaxTime) {

      // expand active range if minTime is negative (why not when positive?)
      if (asRoughDays(minTime) < 0) {
        start = startOfDay(start) // necessary?
        start = dateEnv.add(start, minTime)
      }

      // expand active range if maxTime is beyond one day (why not when positive?)
      if (asRoughDays(maxTime) > 1) {
        end = startOfDay(end) // necessary?
        end = addDays(end, -1)
        end = dateEnv.add(end, maxTime)
      }
    }

    return { start, end }
  }


  // Builds the "current" range when it is specified as an explicit duration.
  // `unit` is the already-computed greatestDurationDenominator unit of duration.
  buildRangeFromDuration(date: DateMarker, direction, duration: Duration, unit) {
    let { dateEnv } = this
    let alignment = this.options.dateAlignment
    let dateIncrementInput
    let dateIncrementDuration
    let start: DateMarker
    let end: DateMarker
    let res

    // compute what the alignment should be
    if (!alignment) {
      dateIncrementInput = this.options.dateIncrement

      if (dateIncrementInput) {
        dateIncrementDuration = createDuration(dateIncrementInput)

        // use the smaller of the two units
        if (asRoughMs(dateIncrementDuration) < asRoughMs(duration)) {
          alignment = greatestDurationDenominator(
            dateIncrementDuration,
            !getWeeksFromInput(dateIncrementInput)
          ).unit
        } else {
          alignment = unit
        }
      } else {
        alignment = unit
      }
    }

    // if the view displays a single day or smaller
    if (asRoughDays(duration) <= 1) {
      if (this.isHiddenDay(start)) {
        start = this.skipHiddenDays(start, direction)
        start = startOfDay(start)
      }
    }

    function computeRes() {
      start = dateEnv.startOf(date, alignment)
      end = dateEnv.add(start, duration)
      res = { start, end }
    }

    computeRes()

    // if range is completely enveloped by hidden days, go past the hidden days
    if (!this.trimHiddenDays(res)) {
      date = this.skipHiddenDays(date, direction)
      computeRes()
    }

    return res
  }


  // Builds the "current" range when a dayCount is specified.
  buildRangeFromDayCount(date: DateMarker, direction, dayCount) {
    let { dateEnv } = this
    let customAlignment = this.options.dateAlignment
    let runningCount = 0
    let start: DateMarker = date
    let end: DateMarker

    if (customAlignment) {
      start = dateEnv.startOf(start, customAlignment)
    }

    start = startOfDay(start)
    start = this.skipHiddenDays(start, direction)

    end = start
    do {
      end = addDays(end, 1)
      if (!this.isHiddenDay(end)) {
        runningCount++
      }
    } while (runningCount < dayCount)

    return { start, end }
  }


  // Builds a normalized range object for the "visible" range,
  // which is a way to define the currentRange and activeRange at the same time.
  buildCustomVisibleRange(date: DateMarker) {
    let { dateEnv } = this
    let visibleRange = this.getRangeOption('visibleRange', dateEnv.toDate(date))

    if (visibleRange && (visibleRange.start == null || visibleRange.end == null)) {
      return null
    }

    return visibleRange
  }


  // Computes the range that will represent the element/cells for *rendering*,
  // but which may have voided days/times.
  // not responsible for trimming hidden days.
  buildRenderRange(currentRange: DateRange, currentRangeUnit, isRangeAllDay) {
    return currentRange
  }


  // Compute the duration value that should be added/substracted to the current date
  // when a prev/next operation happens.
  buildDateIncrement(fallback): Duration {
    let dateIncrementInput = this.options.dateIncrement
    let customAlignment

    if (dateIncrementInput) {
      return createDuration(dateIncrementInput)
    } else if ((customAlignment = this.options.dateAlignment)) {
      return createDuration(1, customAlignment)
    } else if (fallback) {
      return fallback
    } else {
      return createDuration({ days: 1 })
    }
  }


  // Arguments after name will be forwarded to a hypothetical function value
  // WARNING: passed-in arguments will be given to generator functions as-is and can cause side-effects.
  // Always clone your objects if you fear mutation.
  getRangeOption(name, ...otherArgs): OpenDateRange {
    let val = this.options[name]

    if (typeof val === 'function') {
      val = val.apply(null, otherArgs)
    }

    if (val) {
      val = parseRange(val, this.dateEnv)
    }

    if (val) {
      val = computeVisibleDayRange(val)
    }

    return val
  }


  /* Hidden Days
  ------------------------------------------------------------------------------------------------------------------*/


  // Initializes internal variables related to calculating hidden days-of-week
  initHiddenDays() {
    let hiddenDays = this.options.hiddenDays || [] // array of day-of-week indices that are hidden
    let isHiddenDayHash = [] // is the day-of-week hidden? (hash with day-of-week-index -> bool)
    let dayCnt = 0
    let i

    if (this.options.weekends === false) {
      hiddenDays.push(0, 6) // 0=sunday, 6=saturday
    }

    for (i = 0; i < 7; i++) {
      if (
        !(isHiddenDayHash[i] = hiddenDays.indexOf(i) !== -1)
      ) {
        dayCnt++
      }
    }

    if (!dayCnt) {
      throw new Error('invalid hiddenDays') // all days were hidden? bad.
    }

    this.isHiddenDayHash = isHiddenDayHash
  }


  // Remove days from the beginning and end of the range that are computed as hidden.
  // If the whole range is trimmed off, returns null
  trimHiddenDays(range: DateRange): DateRange | null {
    let start = range.start
    let end = range.end

    if (start) {
      start = this.skipHiddenDays(start)
    }

    if (end) {
      end = this.skipHiddenDays(end, -1, true)
    }

    if (start == null || end == null || start < end) {
      return { start, end }
    }

    return null
  }


  // Is the current day hidden?
  // `day` is a day-of-week index (0-6), or a Date (used for UTC)
  isHiddenDay(day) {
    if (day instanceof Date) {
      day = day.getUTCDay()
    }
    return this.isHiddenDayHash[day]
  }


  // Incrementing the current day until it is no longer a hidden day, returning a copy.
  // DOES NOT CONSIDER validRange!
  // If the initial value of `date` is not a hidden day, don't do anything.
  // Pass `isExclusive` as `true` if you are dealing with an end date.
  // `inc` defaults to `1` (increment one day forward each time)
  skipHiddenDays(date: DateMarker, inc = 1, isExclusive = false) {
    while (
      this.isHiddenDayHash[(date.getUTCDay() + (isExclusive ? inc : 0) + 7) % 7]
    ) {
      date = addDays(date, inc)
    }
    return date
  }

}


// TODO: find a way to avoid comparing DateProfiles. it's tedious
export function isDateProfilesEqual(p0: DateProfile, p1: DateProfile) {
  return rangesEqual(p0.validRange, p1.validRange) &&
    rangesEqual(p0.activeRange, p1.activeRange) &&
    rangesEqual(p0.renderRange, p1.renderRange) &&
    durationsEqual(p0.minTime, p1.minTime) &&
    durationsEqual(p0.maxTime, p1.maxTime)
  /*
  TODO: compare more?
    currentRange: DateRange
    currentRangeUnit: string
    isRangeAllDay: boolean
    isValid: boolean
    dateIncrement: Duration
  */
}
