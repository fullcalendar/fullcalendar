import { assignTo } from './util/object'
import { parseFieldSpecs } from './util/misc'
import Calendar from './Calendar'
import { default as DateProfileGenerator, DateProfile } from './DateProfileGenerator'
import DateComponent from './component/DateComponent'
import { DateMarker, addDays, addMs, diffWholeDays } from './datelib/marker'
import { createDuration } from './datelib/duration'
import { createFormatter } from './datelib/formatting'
import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import { OpenDateRange, parseRange, DateRange, rangesEqual } from './datelib/date-range'


/* An abstract class from which other views inherit from
----------------------------------------------------------------------------------------------------------------------*/

export default abstract class View extends DateComponent {

  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']

  type: string // subclass' view name (string)
  name: string // deprecated. use `type` instead
  title: string // the text that will be displayed in the header's title

  calendar: Calendar // owner Calendar object
  viewSpec: any
  options: any // hash containing all options. already merged with view-specific-options

  queuedScroll: any

  eventOrderSpecs: any // criteria for ordering events when they have same date/time

  // for date utils, computed from options
  isHiddenDayHash: boolean[]

  // now indicator
  isNowIndicatorRendered: boolean
  initialNowDate: DateMarker // result first getNow call
  initialNowQueriedMs: number // ms time the getNow was called
  nowIndicatorTimeoutID: any // for refresh timing of now indicator
  nowIndicatorIntervalID: any // "

  dateProfileGeneratorClass: any // initialized after class
  dateProfileGenerator: DateProfileGenerator

  // whether minTime/maxTime will affect the activeRange. Views must opt-in.
  // initialized after class
  usesMinMaxTime: boolean


  constructor(calendar, viewSpec) {
    super(null, viewSpec.options)

    this.calendar = calendar
    this.viewSpec = viewSpec

    // shortcuts
    this.type = viewSpec.type

    // .name is deprecated
    this.name = this.type

    this.initHiddenDays()
    this.dateProfileGenerator = new this.dateProfileGeneratorClass(this)

    this.eventOrderSpecs = parseFieldSpecs(this.opt('eventOrder'))

    this.initialize()
  }


  initialize() { // convenient for sublcasses
  }


  // Retrieves an option with the given name
  opt(name) {
    return this.options[name]
  }


  /* Title and Date Formatting
  ------------------------------------------------------------------------------------------------------------------*/


  // Computes what the title at the top of the calendar should be for this view
  computeTitle(dateProfile) {
    let dateEnv = this.getDateEnv()
    let range: DateRange

    // for views that span a large unit of time, show the proper interval, ignoring stray days before and after
    if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) {
      range = dateProfile.currentRange
    } else { // for day units or smaller, use the actual day range
      range = dateProfile.activeRange
    }

    // TODO: precompute
    // TODO: how will moment plugin deal with this?
    let rawTitleFormat = this.opt('titleFormat') || this.computeTitleFormat(dateProfile)
    if (typeof rawTitleFormat === 'object') {
      rawTitleFormat = assignTo(
        { separator: this.opt('titleRangeSeparator') },
        rawTitleFormat
      )
    }

    return dateEnv.formatRange(
      range.start,
      range.end,
      createFormatter(rawTitleFormat),
      { isEndExclusive: dateProfile.isRangeAllDay }
    )
  }


  // Generates the format string that should be used to generate the title for the current date range.
  // Attempts to compute the most appropriate format if not explicitly specified with `titleFormat`.
  computeTitleFormat(dateProfile) {
    let currentRangeUnit = dateProfile.currentRangeUnit

    if (currentRangeUnit === 'year') {
      return { year: 'numeric' }
    } else if (currentRangeUnit === 'month') {
      return { year: 'numeric', month: 'long' } // like "September 2014"
    } else {
      let days = diffWholeDays(
        dateProfile.currentRange.start,
        dateProfile.currentRange.end
      )
      if (days !== null && days > 1) {
        // multi-day range. shorter, like "Sep 9 - 10 2014"
        return { year: 'numeric', month: 'short', day: 'numeric' }
      } else {
        // one day. longer, like "September 9 2014"
        return { year: 'numeric', month: 'long', day: 'numeric' }
      }
    }
  }


  // Date Setting/Unsetting
  // -----------------------------------------------------------------------------------------------------------------


  computeDateProfile(date: DateMarker): DateProfile {
    let dateProfile = this.dateProfileGenerator.build(date, undefined, true) // forceToValid=true

    if ( // reuse current reference if possible, for rendering optimization
      this.dateProfile &&
      rangesEqual(this.dateProfile.activeRange, dateProfile.activeRange)
    ) {
      return this.dateProfile
    }

    return dateProfile
  }


  get activeStart(): Date {
    return this.getDateEnv().toDate(this.dateProfile.activeRange.start)
  }

  get activeEnd(): Date {
    return this.getDateEnv().toDate(this.dateProfile.activeRange.end)
  }

  get currentStart(): Date {
    return this.getDateEnv().toDate(this.dateProfile.currentRange.start)
  }

  get currentEnd(): Date {
    return this.getDateEnv().toDate(this.dateProfile.currentRange.end)
  }


  // Date Rendering
  // -----------------------------------------------------------------------------------------------------------------


  // if dateProfile not specified, uses current
  renderDates(dateProfile: DateProfile) {
    super.renderDates(dateProfile)

    this.title = this.computeTitle(dateProfile)
    this.addScroll({ isDateInit: true })
    this.startNowIndicator() // shouldn't render yet because updateSize will be called soon
    this.triggerRenderedDates()
  }


  unrenderDates() {
    this.triggerWillRemoveDates()
    this.stopNowIndicator()
    super.unrenderDates()
  }


  triggerRenderedDates() {
    this.publiclyTriggerAfterSizing('datesRender', [
      {
        view: this,
        el: this.el
      }
    ])
  }


  triggerWillRemoveDates() {
    this.publiclyTrigger('datesDestroy', [
      {
        view: this,
        el: this.el
      }
    ])
  }


  /* Now Indicator
  ------------------------------------------------------------------------------------------------------------------*/


  // Immediately render the current time indicator and begins re-rendering it at an interval,
  // which is defined by this.getNowIndicatorUnit().
  // TODO: somehow do this for the current whole day's background too
  startNowIndicator() {
    let dateEnv = this.getDateEnv()
    let unit
    let update
    let delay // ms wait value

    if (this.opt('nowIndicator')) {
      unit = this.getNowIndicatorUnit()
      if (unit) {
        update = this.updateNowIndicator.bind(this)

        this.initialNowDate = this.calendar.getNow()
        this.initialNowQueriedMs = new Date().valueOf()

        // wait until the beginning of the next interval
        delay = dateEnv.add(
          dateEnv.startOf(this.initialNowDate, unit),
          createDuration(1, unit)
        ).valueOf() - this.initialNowDate.valueOf()

        // TODO: maybe always use setTimeout, waiting until start of next unit
        this.nowIndicatorTimeoutID = setTimeout(() => {
          this.nowIndicatorTimeoutID = null
          update()

          if (unit === 'second') {
            delay = 1000 // every second
          } else {
            delay = 1000 * 60 // otherwise, every minute
          }

          this.nowIndicatorIntervalID = setInterval(update, delay) // update every interval
        }, delay)
      }

      // rendering will be initiated in updateSize
    }
  }


  // rerenders the now indicator, computing the new current time from the amount of time that has passed
  // since the initial getNow call.
  updateNowIndicator() {
    if (
      this.renderedFlags.dates &&
      this.initialNowDate // activated before?
    ) {
      this.unrenderNowIndicator() // won't unrender if unnecessary
      this.renderNowIndicator(
        addMs(this.initialNowDate, new Date().valueOf() - this.initialNowQueriedMs)
      )
      this.isNowIndicatorRendered = true
    }
  }


  // Immediately unrenders the view's current time indicator and stops any re-rendering timers.
  // Won't cause side effects if indicator isn't rendered.
  stopNowIndicator() {
    if (this.isNowIndicatorRendered) {

      if (this.nowIndicatorTimeoutID) {
        clearTimeout(this.nowIndicatorTimeoutID)
        this.nowIndicatorTimeoutID = null
      }
      if (this.nowIndicatorIntervalID) {
        clearInterval(this.nowIndicatorIntervalID)
        this.nowIndicatorIntervalID = null
      }

      this.unrenderNowIndicator()
      this.isNowIndicatorRendered = false
    }
  }


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  updateSize(totalHeight, isAuto, force) {
    super.updateSize(totalHeight, isAuto, force)
    this.updateNowIndicator()
  }


  /* Scroller
  ------------------------------------------------------------------------------------------------------------------*/


  addScroll(scroll) {
    let queuedScroll = this.queuedScroll || (this.queuedScroll = {})

    if (!queuedScroll.isLocked) {
      assignTo(queuedScroll, scroll)
    }
  }


  popScroll() {
    this.applyQueuedScroll()
    this.queuedScroll = null
  }


  applyQueuedScroll() {
    this.applyScroll(this.queuedScroll || {})
  }


  queryScroll() {
    let scroll = {} as any

    if (this.renderedFlags.dates) {
      assignTo(scroll, this.queryDateScroll())
    }

    return scroll
  }


  applyScroll(scroll) {

    if (scroll.isLocked) {
      delete scroll.isLocked
    }

    if (scroll.isDateInit) {
      delete scroll.isDateInit

      if (this.renderedFlags.dates) {
        assignTo(scroll, this.computeInitialDateScroll())
      }
    }

    if (this.renderedFlags.dates) {
      this.applyDateScroll(scroll)
    }
  }


  computeInitialDateScroll() {
    return {} // subclasses must implement
  }


  queryDateScroll() {
    return {} // subclasses must implement
  }


  applyDateScroll(scroll) {
     // subclasses must implement
  }


  /* Date Utils
  ------------------------------------------------------------------------------------------------------------------*/


  // For DateComponent::getDayClasses
  isDateInOtherMonth(date: DateMarker, dateProfile) {
    return false
  }


  // Arguments after name will be forwarded to a hypothetical function value
  // WARNING: passed-in arguments will be given to generator functions as-is and can cause side-effects.
  // Always clone your objects if you fear mutation.
  getRangeOption(name, ...otherArgs): OpenDateRange {
    let val = this.opt(name)

    if (typeof val === 'function') {
      val = val.apply(null, otherArgs)
    }

    if (val) {
      return parseRange(val, this.calendar.dateEnv)
    }
  }


  /* Hidden Days
  ------------------------------------------------------------------------------------------------------------------*/


  // Initializes internal variables related to calculating hidden days-of-week
  initHiddenDays() {
    let hiddenDays = this.opt('hiddenDays') || [] // array of day-of-week indices that are hidden
    let isHiddenDayHash = [] // is the day-of-week hidden? (hash with day-of-week-index -> bool)
    let dayCnt = 0
    let i

    if (this.opt('weekends') === false) {
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

EmitterMixin.mixInto(View)

View.prototype.usesMinMaxTime = false
View.prototype.dateProfileGeneratorClass = DateProfileGenerator
