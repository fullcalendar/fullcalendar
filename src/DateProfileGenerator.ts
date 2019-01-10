import * as moment from 'moment'
import { computeGreatestUnit, computeDurationGreatestUnit } from './util'
import UnzonedRange from './models/UnzonedRange'


export default class DateProfileGenerator {

  _view: any // discourage


  constructor(_view) {
    this._view = _view
  }


  opt(name) {
    return this._view.opt(name)
  }


  trimHiddenDays(unzonedRange) {
    return this._view.trimHiddenDays(unzonedRange)
  }


  msToUtcMoment(ms, forceAllDay) {
    return this._view.calendar.msToUtcMoment(ms, forceAllDay)
  }


  /* Date Range Computation
  ------------------------------------------------------------------------------------------------------------------*/


  // Builds a structure with info about what the dates/ranges will be for the "prev" view.
  buildPrev(currentDateProfile) {
    let prevDate = currentDateProfile.date.clone()
      .startOf(currentDateProfile.currentRangeUnit)
      .subtract(currentDateProfile.dateIncrement)

    return this.build(prevDate, -1)
  }


  // Builds a structure with info about what the dates/ranges will be for the "next" view.
  buildNext(currentDateProfile) {
    let nextDate = currentDateProfile.date.clone()
      .startOf(currentDateProfile.currentRangeUnit)
      .add(currentDateProfile.dateIncrement)

    return this.build(nextDate, 1)
  }


  // Builds a structure holding dates/ranges for rendering around the given date.
  // Optional direction param indicates whether the date is being incremented/decremented
  // from its previous value. decremented = -1, incremented = 1 (default).
  build(date, direction, forceToValid= false) {
    let isDateAllDay = !date.hasTime()
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
      date = this.msToUtcMoment(
        validUnzonedRange.constrainDate(date), // returns MS
        isDateAllDay
      )
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

    minTime = moment.duration(this.opt('minTime'))
    maxTime = moment.duration(this.opt('maxTime'))
    activeUnzonedRange = this.adjustActiveRange(activeUnzonedRange, minTime, maxTime)
    activeUnzonedRange = activeUnzonedRange.intersect(validUnzonedRange) // might return null

    if (activeUnzonedRange) {
      date = this.msToUtcMoment(
        activeUnzonedRange.constrainDate(date), // returns MS
        isDateAllDay
      )
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
  // TODO: accept a MS-time instead of a moment `date`?
  buildCurrentRangeInfo(date, direction) {
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
      unit = computeGreatestUnit(unzonedRange.getStart(), unzonedRange.getEnd())
    } else {
      duration = this.getFallbackDuration()
      unit = computeGreatestUnit(duration)
      unzonedRange = this.buildRangeFromDuration(date, direction, duration, unit)
    }

    return { duration: duration, unit: unit, unzonedRange: unzonedRange }
  }


  getFallbackDuration() {
    return moment.duration({ days: 1 })
  }


  // Returns a new activeUnzonedRange to have time values (un-ambiguate)
  // minTime or maxTime causes the range to expand.
  adjustActiveRange(unzonedRange, minTime, maxTime) {
    let start = unzonedRange.getStart()
    let end = unzonedRange.getEnd()

    if (this._view.usesMinMaxTime) {

      if (minTime < 0) {
        start.time(0).add(minTime)
      }

      if (maxTime > 24 * 60 * 60 * 1000) { // beyond 24 hours?
        end.time(maxTime - (24 * 60 * 60 * 1000))
      }
    }

    return new UnzonedRange(start, end)
  }


  // Builds the "current" range when it is specified as an explicit duration.
  // `unit` is the already-computed computeGreatestUnit value of duration.
  // TODO: accept a MS-time instead of a moment `date`?
  buildRangeFromDuration(date, direction, duration, unit) {
    let alignment = this.opt('dateAlignment')
    let dateIncrementInput
    let dateIncrementDuration
    let start
    let end
    let res

    // compute what the alignment should be
    if (!alignment) {
      dateIncrementInput = this.opt('dateIncrement')

      if (dateIncrementInput) {
        dateIncrementDuration = moment.duration(dateIncrementInput)

        // use the smaller of the two units
        if (dateIncrementDuration < duration) {
          alignment = computeDurationGreatestUnit(dateIncrementDuration, dateIncrementInput)
        } else {
          alignment = unit
        }
      } else {
        alignment = unit
      }
    }

    // if the view displays a single day or smaller
    if (duration.as('days') <= 1) {
      if (this._view.isHiddenDay(start)) {
        start = this._view.skipHiddenDays(start, direction)
        start.startOf('day')
      }
    }

    function computeRes() {
      start = date.clone().startOf(alignment)
      end = start.clone().add(duration)
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
  // TODO: accept a MS-time instead of a moment `date`?
  buildRangeFromDayCount(date, direction, dayCount) {
    let customAlignment = this.opt('dateAlignment')
    let runningCount = 0
    let start
    let end

    if (customAlignment || direction !== -1) {

      start = date.clone()

      if (customAlignment) {
        start.startOf(customAlignment)
      }

      start.startOf('day')
      start = this._view.skipHiddenDays(start)

      end = start.clone()
      do {
        end.add(1, 'day')
        if (!this._view.isHiddenDay(end)) {
          runningCount++
        }
      } while (runningCount < dayCount)

    } else {

      end = date.clone().startOf('day').add(1, 'day')
      end = this._view.skipHiddenDays(end, -1, true)

      start = end.clone()
      do {
        start.add(-1, 'day')
        if (!this._view.isHiddenDay(start)) {
          runningCount++
        }
      } while (runningCount < dayCount)

    }

    return new UnzonedRange(start, end)
  }


  // Builds a normalized range object for the "visible" range,
  // which is a way to define the currentUnzonedRange and activeUnzonedRange at the same time.
  // TODO: accept a MS-time instead of a moment `date`?
  buildCustomVisibleRange(date) {
    let visibleUnzonedRange = this._view.getUnzonedRangeOption(
      'visibleRange',
      this._view.calendar.applyTimezone(date) // correct zone. also generates new obj that avoids mutations
    )

    if (visibleUnzonedRange && (visibleUnzonedRange.startMs == null || visibleUnzonedRange.endMs == null)) {
      return null
    }

    return visibleUnzonedRange
  }


  // Computes the range that will represent the element/cells for *rendering*,
  // but which may have voided days/times.
  // not responsible for trimming hidden days.
  buildRenderRange(currentUnzonedRange, currentRangeUnit, isRangeAllDay) {
    return currentUnzonedRange.clone()
  }


  // Compute the duration value that should be added/substracted to the current date
  // when a prev/next operation happens.
  buildDateIncrement(fallback) {
    let dateIncrementInput = this.opt('dateIncrement')
    let customAlignment

    if (dateIncrementInput) {
      return moment.duration(dateIncrementInput)
    } else if ((customAlignment = this.opt('dateAlignment'))) {
      return moment.duration(1, customAlignment)
    } else if (fallback) {
      return fallback
    } else {
      return moment.duration({ days: 1 })
    }
  }

}
