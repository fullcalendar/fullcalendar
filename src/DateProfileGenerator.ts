import View from './View'
import UnzonedRange from './models/UnzonedRange'
import { DateMarker, startOfDay, addDays } from './datelib/marker'
import { Duration, createDuration, getWeeksFromInput, asRoughDays, greatestDurationDenominator } from './datelib/duration'


export interface DateProfile {
  validUnzonedRange: UnzonedRange
  currentUnzonedRange: UnzonedRange
  currentRangeUnit: string
  isRangeAllDay: boolean
  activeUnzonedRange: UnzonedRange
  renderUnzonedRange: UnzonedRange
  minTime: Duration
  maxTime: Duration
  isValid: boolean
  date: DateMarker
  dateIncrement: Duration
}


export default class DateProfileGenerator {

  _view: View // discourage


  constructor(_view) {
    this._view = _view
  }


  opt(name) {
    return this._view.opt(name)
  }


  trimHiddenDays(unzonedRange) {
    return this._view.trimHiddenDays(unzonedRange)
  }


  /* Date Range Computation
  ------------------------------------------------------------------------------------------------------------------*/


  // Builds a structure with info about what the dates/ranges will be for the "prev" view.
  buildPrev(currentDateProfile): DateProfile {
    const dateEnv = this._view.calendar.dateEnv

    let prevDate = dateEnv.subtract(
      dateEnv.startOf(currentDateProfile.date, currentDateProfile.currentRangeUnit),
      currentDateProfile.dateIncrement
    )

    return this.build(prevDate, -1)
  }


  // Builds a structure with info about what the dates/ranges will be for the "next" view.
  buildNext(currentDateProfile): DateProfile {
    const dateEnv = this._view.calendar.dateEnv

    let nextDate = dateEnv.add(
      dateEnv.startOf(currentDateProfile.date, currentDateProfile.currentRangeUnit),
      currentDateProfile.dateIncrement
    )

    return this.build(nextDate, 1)
  }


  // Builds a structure holding dates/ranges for rendering around the given date.
  // Optional direction param indicates whether the date is being incremented/decremented
  // from its previous value. decremented = -1, incremented = 1 (default).
  build(date: DateMarker, direction?, forceToValid = false): DateProfile {
    let validUnzonedRange
    let minTime = null
    let maxTime = null
    let currentInfo
    let isRangeAllDay
    let renderUnzonedRange
    let activeUnzonedRange
    let isValid

    validUnzonedRange = this.buildValidRange()
    validUnzonedRange = this.trimHiddenDays(validUnzonedRange)

    if (forceToValid) {
      date = validUnzonedRange.constrainDate(date)
    }

    currentInfo = this.buildCurrentRangeInfo(date, direction)
    isRangeAllDay = /^(year|month|week|day)$/.test(currentInfo.unit)
    renderUnzonedRange = this.buildRenderRange(
      this.trimHiddenDays(currentInfo.unzonedRange),
      currentInfo.unit,
      isRangeAllDay
    )
    renderUnzonedRange = this.trimHiddenDays(renderUnzonedRange)
    activeUnzonedRange = renderUnzonedRange.clone()

    if (!this.opt('showNonCurrentDates')) {
      activeUnzonedRange = activeUnzonedRange.intersect(currentInfo.unzonedRange)
    }

    minTime = createDuration(this.opt('minTime'))
    maxTime = createDuration(this.opt('maxTime'))
    activeUnzonedRange = this.adjustActiveRange(activeUnzonedRange, minTime, maxTime)
    activeUnzonedRange = activeUnzonedRange.intersect(validUnzonedRange) // might return null

    if (activeUnzonedRange) {
      date = activeUnzonedRange.constrainDate(date)
    }

    // it's invalid if the originally requested date is not contained,
    // or if the range is completely outside of the valid range.
    isValid = currentInfo.unzonedRange.intersectsWith(validUnzonedRange)

    return {
      // constraint for where prev/next operations can go and where events can be dragged/resized to.
      // an object with optional start and end properties.
      validUnzonedRange: validUnzonedRange,

      // range the view is formally responsible for.
      // for example, a month view might have 1st-31st, excluding padded dates
      currentUnzonedRange: currentInfo.unzonedRange,

      // name of largest unit being displayed, like "month" or "week"
      currentRangeUnit: currentInfo.unit,

      isRangeAllDay: isRangeAllDay,

      // dates that display events and accept drag-n-drop
      // will be `null` if no dates accept events
      activeUnzonedRange: activeUnzonedRange,

      // date range with a rendered skeleton
      // includes not-active days that need some sort of DOM
      renderUnzonedRange: renderUnzonedRange,

      // Duration object that denotes the first visible time of any given day
      minTime: minTime,

      // Duration object that denotes the exclusive visible end time of any given day
      maxTime: maxTime,

      isValid: isValid,

      date: date,

      // how far the current date will move for a prev/next operation
      dateIncrement: this.buildDateIncrement(currentInfo.duration)
        // pass a fallback (might be null) ^
    }
  }


  // Builds an object with optional start/end properties.
  // Indicates the minimum/maximum dates to display.
  // not responsible for trimming hidden days.
  buildValidRange() {
    return this._view.getUnzonedRangeOption('validRange', this._view.calendar.getNow()) ||
      new UnzonedRange() // completely open-ended
  }


  // Builds a structure with info about the "current" range, the range that is
  // highlighted as being the current month for example.
  // See build() for a description of `direction`.
  // Guaranteed to have `range` and `unit` properties. `duration` is optional.
  buildCurrentRangeInfo(date: DateMarker, direction) {
    const dateEnv = this._view.calendar.dateEnv
    let viewSpec = this._view.viewSpec
    let duration = null
    let unit = null
    let unzonedRange = null
    let dayCount

    if (viewSpec.duration) {
      duration = viewSpec.duration
      unit = viewSpec.durationUnit
      unzonedRange = this.buildRangeFromDuration(date, direction, duration, unit)
    } else if ((dayCount = this.opt('dayCount'))) {
      unit = 'day'
      unzonedRange = this.buildRangeFromDayCount(date, direction, dayCount)
    } else if ((unzonedRange = this.buildCustomVisibleRange(date))) {
      unit = dateEnv.greatestWholeUnit(unzonedRange.start, unzonedRange.end).unit
    } else {
      duration = this.getFallbackDuration()
      unit = greatestDurationDenominator(duration).unit
      unzonedRange = this.buildRangeFromDuration(date, direction, duration, unit)
    }

    return { duration: duration, unit: unit, unzonedRange: unzonedRange }
  }


  getFallbackDuration(): Duration {
    return createDuration({ day: 1 })
  }


  // Returns a new activeUnzonedRange to have time values (un-ambiguate)
  // minTime or maxTime causes the range to expand.
  adjustActiveRange(unzonedRange: UnzonedRange, minTime: Duration, maxTime: Duration) {
    const dateEnv = this._view.calendar.dateEnv
    let start = unzonedRange.start
    let end = unzonedRange.end

    if (this._view.usesMinMaxTime) {

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

    return new UnzonedRange(start, end)
  }


  // Builds the "current" range when it is specified as an explicit duration.
  // `unit` is the already-computed greatestDurationDenominator unit of duration.
  buildRangeFromDuration(date: DateMarker, direction, duration: Duration, unit) {
    const dateEnv = this._view.calendar.dateEnv
    let alignment = this.opt('dateAlignment')
    let dateIncrementInput
    let dateIncrementDuration
    let start: DateMarker
    let end: DateMarker
    let res

    // compute what the alignment should be
    if (!alignment) {
      dateIncrementInput = this.opt('dateIncrement')

      if (dateIncrementInput) {
        dateIncrementDuration = createDuration(dateIncrementInput)

        // use the smaller of the two units
        if (dateIncrementDuration < duration) {
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
      if (this._view.isHiddenDay(start)) {
        start = this._view.skipHiddenDays(start, direction)
        start = startOfDay(start)
      }
    }

    function computeRes() {
      start = dateEnv.startOf(date, alignment)
      end = dateEnv.add(date, duration)
      res = new UnzonedRange(start, end)
    }

    computeRes()

    // if range is completely enveloped by hidden days, go past the hidden days
    if (!this.trimHiddenDays(res)) {
      date = this._view.skipHiddenDays(date, direction)
      computeRes()
    }

    return res
  }


  // Builds the "current" range when a dayCount is specified.
  buildRangeFromDayCount(date: DateMarker, direction, dayCount) {
    const dateEnv = this._view.calendar.dateEnv
    let customAlignment = this.opt('dateAlignment')
    let runningCount = 0
    let start: DateMarker = date
    let end: DateMarker

    if (customAlignment) {
      start = dateEnv.startOf(start, customAlignment)
    }

    start = startOfDay(start)
    start = this._view.skipHiddenDays(start, direction)

    end = start
    do {
      end = addDays(end, 1)
      if (!this._view.isHiddenDay(end)) {
        runningCount++
      }
    } while (runningCount < dayCount)

    return new UnzonedRange(start, end)
  }


  // Builds a normalized range object for the "visible" range,
  // which is a way to define the currentUnzonedRange and activeUnzonedRange at the same time.
  buildCustomVisibleRange(date: DateMarker) {
    const dateEnv = this._view.calendar.dateEnv
    let visibleUnzonedRange = this._view.getUnzonedRangeOption('visibleRange', dateEnv.toDate(date))

    if (visibleUnzonedRange && (visibleUnzonedRange.start == null || visibleUnzonedRange.end == null)) {
      return null
    }

    return visibleUnzonedRange
  }


  // Computes the range that will represent the element/cells for *rendering*,
  // but which may have voided days/times.
  // not responsible for trimming hidden days.
  buildRenderRange(currentUnzonedRange: UnzonedRange, currentRangeUnit, isRangeAllDay) {
    return currentUnzonedRange.clone()
  }


  // Compute the duration value that should be added/substracted to the current date
  // when a prev/next operation happens.
  buildDateIncrement(fallback): Duration {
    let dateIncrementInput = this.opt('dateIncrement')
    let customAlignment

    if (dateIncrementInput) {
      return createDuration(dateIncrementInput)
    } else if ((customAlignment = this.opt('dateAlignment'))) {
      return createDuration(1, customAlignment)
    } else if (fallback) {
      return fallback
    } else {
      return createDuration({ days: 1 })
    }
  }

}
