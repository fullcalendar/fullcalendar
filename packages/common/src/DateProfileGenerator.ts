import { DateMarker, startOfDay, addDays } from './datelib/marker'
import { Duration, createDuration, asRoughDays, asRoughMs, greatestDurationDenominator } from './datelib/duration'
import {
  DateRange,
  OpenDateRange,
  constrainMarkerToRange,
  intersectRanges,
  rangesIntersect,
  parseRange,
  DateRangeInput,
} from './datelib/date-range'
import { DateEnv, DateInput } from './datelib/env'
import { computeVisibleDayRange } from './util/date'
import { getNow } from './reducers/current-date'
import { CalendarApi } from './CalendarApi'

export interface DateProfile {
  currentRange: DateRange // TODO: does this include slotMinTime/slotMaxTime?
  currentRangeUnit: string
  isRangeAllDay: boolean
  validRange: OpenDateRange
  activeRange: DateRange | null
  renderRange: DateRange
  slotMinTime: Duration
  slotMaxTime: Duration
  isValid: boolean
  dateIncrement: Duration
}

export interface DateProfileGeneratorProps extends DateProfileOptions {
  dateProfileGeneratorClass: DateProfileGeneratorClass // not used by DateProfileGenerator itself
  duration: Duration
  durationUnit: string
  usesMinMaxTime: boolean
  dateEnv: DateEnv
  calendarApi: CalendarApi
}

export interface DateProfileOptions {
  slotMinTime: Duration
  slotMaxTime: Duration
  showNonCurrentDates?: boolean
  dayCount?: number
  dateAlignment?: string
  dateIncrement?: Duration
  hiddenDays?: number[]
  weekends?: boolean
  nowInput?: DateInput | (() => DateInput)
  validRangeInput?: DateRangeInput | ((this: CalendarApi, nowDate: Date) => DateRangeInput)
  visibleRangeInput?: DateRangeInput | ((this: CalendarApi, nowDate: Date) => DateRangeInput)
  monthMode?: boolean
  fixedWeekCount?: boolean
}

export type DateProfileGeneratorClass = {
  new(props: DateProfileGeneratorProps): DateProfileGenerator
}

export class DateProfileGenerator { // only publicly used for isHiddenDay :(
  nowDate: DateMarker

  isHiddenDayHash: boolean[]

  constructor(protected props: DateProfileGeneratorProps) {
    this.nowDate = getNow(props.nowInput, props.dateEnv)
    this.initHiddenDays()
  }

  /* Date Range Computation
  ------------------------------------------------------------------------------------------------------------------*/

  // Builds a structure with info about what the dates/ranges will be for the "prev" view.
  buildPrev(currentDateProfile: DateProfile, currentDate: DateMarker, forceToValid?: boolean): DateProfile {
    let { dateEnv } = this.props

    let prevDate = dateEnv.subtract(
      dateEnv.startOf(currentDate, currentDateProfile.currentRangeUnit), // important for start-of-month
      currentDateProfile.dateIncrement,
    )

    return this.build(prevDate, -1, forceToValid)
  }

  // Builds a structure with info about what the dates/ranges will be for the "next" view.
  buildNext(currentDateProfile: DateProfile, currentDate: DateMarker, forceToValid?: boolean): DateProfile {
    let { dateEnv } = this.props

    let nextDate = dateEnv.add(
      dateEnv.startOf(currentDate, currentDateProfile.currentRangeUnit), // important for start-of-month
      currentDateProfile.dateIncrement,
    )

    return this.build(nextDate, 1, forceToValid)
  }

  // Builds a structure holding dates/ranges for rendering around the given date.
  // Optional direction param indicates whether the date is being incremented/decremented
  // from its previous value. decremented = -1, incremented = 1 (default).
  build(currentDate: DateMarker, direction?, forceToValid = true): DateProfile {
    let { props } = this
    let validRange: DateRange
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
      isRangeAllDay,
    )
    renderRange = this.trimHiddenDays(renderRange)
    activeRange = renderRange

    if (!props.showNonCurrentDates) {
      activeRange = intersectRanges(activeRange, currentInfo.range)
    }

    activeRange = this.adjustActiveRange(activeRange)
    activeRange = intersectRanges(activeRange, validRange) // might return null

    // it's invalid if the originally requested date is not contained,
    // or if the range is completely outside of the valid range.
    isValid = rangesIntersect(currentInfo.range, validRange)

    return {
      // constraint for where prev/next operations can go and where events can be dragged/resized to.
      // an object with optional start and end properties.
      validRange,

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
      slotMinTime: props.slotMinTime,

      // Duration object that denotes the exclusive visible end time of any given day
      slotMaxTime: props.slotMaxTime,

      isValid,

      // how far the current date will move for a prev/next operation
      dateIncrement: this.buildDateIncrement(currentInfo.duration),
      // pass a fallback (might be null) ^
    }
  }

  // Builds an object with optional start/end properties.
  // Indicates the minimum/maximum dates to display.
  // not responsible for trimming hidden days.
  buildValidRange(): OpenDateRange {
    let input = this.props.validRangeInput
    let simpleInput = typeof input === 'function'
      ? input.call(this.props.calendarApi, this.nowDate)
      : input

    return this.refineRange(simpleInput) ||
      { start: null, end: null } // completely open-ended
  }

  // Builds a structure with info about the "current" range, the range that is
  // highlighted as being the current month for example.
  // See build() for a description of `direction`.
  // Guaranteed to have `range` and `unit` properties. `duration` is optional.
  buildCurrentRangeInfo(date: DateMarker, direction) {
    let { props } = this
    let duration = null
    let unit = null
    let range = null
    let dayCount

    if (props.duration) {
      duration = props.duration
      unit = props.durationUnit
      range = this.buildRangeFromDuration(date, direction, duration, unit)
    } else if ((dayCount = this.props.dayCount)) {
      unit = 'day'
      range = this.buildRangeFromDayCount(date, direction, dayCount)
    } else if ((range = this.buildCustomVisibleRange(date))) {
      unit = props.dateEnv.greatestWholeUnit(range.start, range.end).unit
    } else {
      duration = this.getFallbackDuration()
      unit = greatestDurationDenominator(duration).unit
      range = this.buildRangeFromDuration(date, direction, duration, unit)
    }

    return { duration, unit, range }
  }

  getFallbackDuration(): Duration {
    return createDuration({ day: 1 })
  }

  // Returns a new activeRange to have time values (un-ambiguate)
  // slotMinTime or slotMaxTime causes the range to expand.
  adjustActiveRange(range: DateRange) {
    let { dateEnv, usesMinMaxTime, slotMinTime, slotMaxTime } = this.props
    let { start, end } = range

    if (usesMinMaxTime) {
      // expand active range if slotMinTime is negative (why not when positive?)
      if (asRoughDays(slotMinTime) < 0) {
        start = startOfDay(start) // necessary?
        start = dateEnv.add(start, slotMinTime)
      }

      // expand active range if slotMaxTime is beyond one day (why not when negative?)
      if (asRoughDays(slotMaxTime) > 1) {
        end = startOfDay(end) // necessary?
        end = addDays(end, -1)
        end = dateEnv.add(end, slotMaxTime)
      }
    }

    return { start, end }
  }

  // Builds the "current" range when it is specified as an explicit duration.
  // `unit` is the already-computed greatestDurationDenominator unit of duration.
  buildRangeFromDuration(date: DateMarker, direction, duration: Duration, unit) {
    let { dateEnv, dateAlignment } = this.props
    let start: DateMarker
    let end: DateMarker
    let res

    // compute what the alignment should be
    if (!dateAlignment) {
      let { dateIncrement } = this.props

      if (dateIncrement) {
        // use the smaller of the two units
        if (asRoughMs(dateIncrement) < asRoughMs(duration)) {
          dateAlignment = greatestDurationDenominator(dateIncrement).unit
        } else {
          dateAlignment = unit
        }
      } else {
        dateAlignment = unit
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
      start = dateEnv.startOf(date, dateAlignment)
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
    let { dateEnv, dateAlignment } = this.props
    let runningCount = 0
    let start: DateMarker = date
    let end: DateMarker

    if (dateAlignment) {
      start = dateEnv.startOf(start, dateAlignment)
    }

    start = startOfDay(start)
    start = this.skipHiddenDays(start, direction)

    end = start
    do {
      end = addDays(end, 1)
      if (!this.isHiddenDay(end)) {
        runningCount += 1
      }
    } while (runningCount < dayCount)

    return { start, end }
  }

  // Builds a normalized range object for the "visible" range,
  // which is a way to define the currentRange and activeRange at the same time.
  buildCustomVisibleRange(date: DateMarker) {
    let { props } = this
    let input = props.visibleRangeInput
    let simpleInput = typeof input === 'function'
      ? input.call(props.calendarApi, props.dateEnv.toDate(date))
      : input

    let range = this.refineRange(simpleInput)

    if (range && (range.start == null || range.end == null)) {
      return null
    }

    return range
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
    let { dateIncrement } = this.props
    let customAlignment

    if (dateIncrement) {
      return dateIncrement
    }

    if ((customAlignment = this.props.dateAlignment)) {
      return createDuration(1, customAlignment)
    }

    if (fallback) {
      return fallback
    }

    return createDuration({ days: 1 })
  }

  refineRange(rangeInput: DateRangeInput | undefined): DateRange | null {
    if (rangeInput) {
      let range = parseRange(rangeInput, this.props.dateEnv)

      if (range) {
        range = computeVisibleDayRange(range)
      }

      return range
    }

    return null
  }

  /* Hidden Days
  ------------------------------------------------------------------------------------------------------------------*/

  // Initializes internal variables related to calculating hidden days-of-week
  initHiddenDays() {
    let hiddenDays = this.props.hiddenDays || [] // array of day-of-week indices that are hidden
    let isHiddenDayHash = [] // is the day-of-week hidden? (hash with day-of-week-index -> bool)
    let dayCnt = 0
    let i

    if (this.props.weekends === false) {
      hiddenDays.push(0, 6) // 0=sunday, 6=saturday
    }

    for (i = 0; i < 7; i += 1) {
      if (
        !(isHiddenDayHash[i] = hiddenDays.indexOf(i) !== -1)
      ) {
        dayCnt += 1
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
    let { start, end } = range

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
