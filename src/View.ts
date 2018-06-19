import { assignTo } from './util/object'
import { elementClosest } from './util/dom-manip'
import { isPrimaryMouseButton } from './util/dom-event'
import { parseFieldSpecs } from './util/misc'
import RenderQueue from './common/RenderQueue'
import Calendar from './Calendar'
import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
import InteractiveDateComponent from './component/InteractiveDateComponent'
import GlobalEmitter from './common/GlobalEmitter'
import UnzonedRange from './models/UnzonedRange'
import { DateMarker, addDays, addMs, diffWholeDays } from './datelib/marker'
import { createDuration } from './datelib/duration'
import { createFormatter } from './datelib/formatting'
import { EventInstance } from './reducers/event-store'
import { Selection } from './reducers/selection'


/* An abstract class from which other views inherit from
----------------------------------------------------------------------------------------------------------------------*/

export default abstract class View extends InteractiveDateComponent {

  type: string // subclass' view name (string)
  name: string // deprecated. use `type` instead
  title: string // the text that will be displayed in the header's title

  calendar: Calendar // owner Calendar object
  viewSpec: any
  options: any // hash containing all options. already merged with view-specific-options
  dateProfile: DateProfile

  renderQueue: RenderQueue
  batchRenderDepth: number = 0
  queuedScroll: object

  isSelected: boolean = false // boolean whether a range of time is user-selected or not
  selectedEventInstance: EventInstance

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

  // whether minTime/maxTime will affect the activeUnzonedRange. Views must opt-in.
  // initialized after class
  usesMinMaxTime: boolean

  // DEPRECATED
  start: Date // use activeUnzonedRange
  end: Date // use activeUnzonedRange
  intervalStart: Date // use currentUnzonedRange
  intervalEnd: Date // use currentUnzonedRange


  constructor(calendar, viewSpec) {
    super(null, viewSpec.options)

    this.calendar = calendar
    this.viewSpec = viewSpec

    // shortcuts
    this.type = viewSpec.type

    // .name is deprecated
    this.name = this.type

    this.initRenderQueue()
    this.initHiddenDays()
    this.dateProfileGenerator = new this.dateProfileGeneratorClass(this)
    this.bindBaseRenderHandlers()
    this.eventOrderSpecs = parseFieldSpecs(this.opt('eventOrder'))

    // legacy
    if (this['initialize']) {
      this['initialize']()
    }
  }


  // Retrieves an option with the given name
  opt(name) {
    return this.options[name]
  }


  /* Render Queue
  ------------------------------------------------------------------------------------------------------------------*/


  initRenderQueue() {
    this.renderQueue = new RenderQueue(this.opt('eventRenderWait'))

    this.renderQueue.on('start', this.onRenderQueueStart.bind(this))
    this.renderQueue.on('stop', this.onRenderQueueStop.bind(this))

    this.on('before:change', this.startBatchRender)
    this.on('change', this.stopBatchRender)
  }


  onRenderQueueStart() {
    this.calendar.freezeContentHeight()
    this.addScroll(this.queryScroll())
  }


  onRenderQueueStop() {
    if (this.calendar.updateViewSize()) { // success?
      this.popScroll()
    }
    this.calendar.thawContentHeight()
  }


  startBatchRender() {
    if (!(this.batchRenderDepth++)) {
      this.renderQueue.pause()
    }
  }


  stopBatchRender() {
    if (!(--this.batchRenderDepth)) {
      this.renderQueue.resume()
    }
  }


  requestRender(func) {
    this.renderQueue.queue(func)
  }


  // given func will auto-bind to `this`
  whenSizeUpdated(func) {
    if (this.renderQueue.isRunning) {
      this.renderQueue.one('stop', func.bind(this))
    } else {
      func.call(this)
    }
  }


  /* Title and Date Formatting
  ------------------------------------------------------------------------------------------------------------------*/


  // Computes what the title at the top of the calendar should be for this view
  computeTitle(dateProfile) {
    let dateEnv = this.getDateEnv()
    let unzonedRange

    // for views that span a large unit of time, show the proper interval, ignoring stray days before and after
    if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) {
      unzonedRange = dateProfile.currentUnzonedRange
    } else { // for day units or smaller, use the actual day range
      unzonedRange = dateProfile.activeUnzonedRange
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
      unzonedRange.start,
      unzonedRange.end,
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
        dateProfile.currentUnzonedRange.start,
        dateProfile.currentUnzonedRange.end
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


  computeNewDateProfile(date: DateMarker) {
    let currentDateProfile = this.dateProfile
    let newDateProfile = this.dateProfileGenerator.build(date, undefined, true) // forceToValid=true

    if (
      !currentDateProfile ||
      !currentDateProfile.activeUnzonedRange.equals(newDateProfile.activeUnzonedRange)
    ) {
      return newDateProfile
    }
  }


  setDateProfile(dateProfile) {
    let dateEnv = this.getDateEnv()

    this.title = this.computeTitle(dateProfile)
    // DEPRECATED, but we need to keep it updated...
    this.start = dateEnv.toDate(dateProfile.activeUnzonedRange.start)
    this.end = dateEnv.toDate(dateProfile.activeUnzonedRange.end)
    this.intervalStart = dateEnv.toDate(dateProfile.currentUnzonedRange.start)
    this.intervalEnd = dateEnv.toDate(dateProfile.currentUnzonedRange.end)

    this.dateProfile = dateProfile
    this.set('dateProfile', dateProfile) // for rendering watchers
  }


  // Date High-level Rendering
  // -----------------------------------------------------------------------------------------------------------------


  requestDateRender() {
    this.requestRender(() => {
      this.executeDateRender()
    })
  }


  requestDateUnrender() {
    this.requestRender(() => {
      this.executeDateUnrender()
    })
  }


  // if dateProfile not specified, uses current
  executeDateRender() {
    super.executeDateRender()

    if (this['render']) {
      this['render']() // TODO: deprecate
    }

    this.trigger('datesRendered')
    this.addScroll({ isDateInit: true })
    this.startNowIndicator() // shouldn't render yet because updateSize will be called soon
  }


  executeDateUnrender() {
    this.unselect()
    this.stopNowIndicator()
    this.trigger('before:datesUnrendered')

    if (this['destroy']) {
      this['destroy']() // TODO: deprecate
    }

    super.executeDateUnrender()
  }


  // "Base" rendering
  // -----------------------------------------------------------------------------------------------------------------


  bindBaseRenderHandlers() {
    this.on('datesRendered', () => {
      this.whenSizeUpdated(
        this.triggerViewRender
      )
    })

    this.on('before:datesUnrendered', () => {
      this.triggerViewDestroy()
    })
  }


  triggerViewRender() {
    this.publiclyTrigger('viewRender', [
      {
        view: this,
        el: this.el
      }
    ])
  }


  triggerViewDestroy() {
    this.publiclyTrigger('viewDestroy', [
      {
        view: this,
        el: this.el
      }
    ])
  }


  // Event High-level Rendering
  // -----------------------------------------------------------------------------------------------------------------


  requestRenderEvents(eventStore) {
    this.requestRender(() => {
      this.renderEvents(eventStore)
      this.whenSizeUpdated(
        this.triggerAfterEventsRendered
      )
    })
  }


  requestUnrenderEvents() {
    this.requestRender(() => {
      this.triggerBeforeEventsDestroyed()
      this.unrenderEvents()
    })
  }


  // Business Hour High-level Rendering
  // -----------------------------------------------------------------------------------------------------------------


  requestBusinessHoursRender() {
    this.requestRender(() => {
      this.renderBusinessHours(this.opt('businessHours'))
    })
  }

  requestBusinessHoursUnrender() {
    this.requestRender(() => {
      this.unrenderBusinessHours()
    })
  }


  // Misc view rendering utils
  // -----------------------------------------------------------------------------------------------------------------


  // Binds DOM handlers to elements that reside outside the view container, such as the document
  bindGlobalHandlers() {
    super.bindGlobalHandlers()

    this.listenTo(GlobalEmitter.get(), {
      touchstart: this.processUnselect,
      mousedown: this.handleDocumentMousedown
    })
  }


  // Unbinds DOM handlers from elements that reside outside the view container
  unbindGlobalHandlers() {
    super.unbindGlobalHandlers()

    this.stopListeningTo(GlobalEmitter.get())
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
      this.isDatesRendered &&
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


  updateSize(totalHeight, isAuto, isResize) {

    if (this['setHeight']) { // for legacy API
      this['setHeight'](totalHeight, isAuto)
    } else {
      super.updateSize(totalHeight, isAuto, isResize)
    }

    this.updateNowIndicator()
  }


  /* Scroller
  ------------------------------------------------------------------------------------------------------------------*/


  addScroll(scroll) {
    let queuedScroll = this.queuedScroll || (this.queuedScroll = {})

    assignTo(queuedScroll, scroll)
  }


  popScroll() {
    this.applyQueuedScroll()
    this.queuedScroll = null
  }


  applyQueuedScroll() {
    if (this.queuedScroll) {
      this.applyScroll(this.queuedScroll)
    }
  }


  queryScroll() {
    let scroll = {}

    if (this.isDatesRendered) {
      assignTo(scroll, this.queryDateScroll())
    }

    return scroll
  }


  applyScroll(scroll) {
    if (scroll.isDateInit && this.isDatesRendered) {
      assignTo(scroll, this.computeInitialDateScroll())
    }

    if (this.isDatesRendered) {
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


  /* Selection (time range)
  ------------------------------------------------------------------------------------------------------------------*/


  // Selects a date span on the view. `start` and `end` are both Moments.
  // `ev` is the native mouse event that begin the interaction.
  select(selection: Selection, ev?) {
    this.unselect(ev)
    this.renderSelection(selection)
    this.reportSelection(selection, ev)
  }


  // Called when a new selection is made. Updates internal state and triggers handlers.
  reportSelection(selection: Selection, ev?) {
    this.isSelected = true
    this.triggerSelect(selection, ev)
  }


  // Triggers handlers to 'select'
  triggerSelect(selection: Selection, ev?) {
    let dateEnv = this.getDateEnv()

    this.publiclyTrigger('select', [
      {
        start: dateEnv.toDate(selection.range.start),
        end: dateEnv.toDate(selection.range.end),
        isAllDay: selection.isAllDay,
        jsEvent: ev,
        view: this
      }
    ])
  }


  // Undoes a selection. updates in the internal state and triggers handlers.
  // `ev` is the native mouse event that began the interaction.
  unselect(ev?) {
    if (this.isSelected) {
      this.isSelected = false
      if (this['destroySelection']) {
        this['destroySelection']() // TODO: deprecate
      }
      this.unrenderSelection()
      this.publiclyTrigger('unselect', [
        {
          jsEvent: ev,
          view: this
        }
      ])
    }
  }


  /* Event Selection
  ------------------------------------------------------------------------------------------------------------------*/


  selectEventInstance(eventInstance) {
    if (
      !this.selectedEventInstance ||
      this.selectedEventInstance.instanceId !== eventInstance.instanceId
    ) {
      this.unselectEventInstance()

      this.getEventSegs().forEach(function(seg) {
        if (
          seg.eventRange.eventInstance.instanceId === eventInstance.instanceId &&
          seg.el // necessary?
        ) {
          seg.el.classList.add('fc-selected')
        }
      })

      this.selectedEventInstance = eventInstance
    }
  }


  unselectEventInstance() {
    if (this.selectedEventInstance) {

      this.getEventSegs().forEach(function(seg) {
        if (seg.el) { // necessary?
          seg.el.classList.remove('fc-selected')
        }
      })

      this.selectedEventInstance = null
    }
  }


  isEventDefSelected(eventDef) {
    // event references might change on refetchEvents(), while selectedEventInstance doesn't,
    // so compare IDs
    return this.selectedEventInstance && this.selectedEventInstance.defId === eventDef.defId
  }


  /* Mouse / Touch Unselecting (time range & event unselection)
  ------------------------------------------------------------------------------------------------------------------*/
  // TODO: move consistently to down/start or up/end?
  // TODO: don't kill previous selection if touch scrolling


  handleDocumentMousedown(ev) {
    if (isPrimaryMouseButton(ev)) {
      this.processUnselect(ev)
    }
  }


  processUnselect(ev) {
    this.processRangeUnselect(ev)
    this.processEventUnselect(ev)
  }


  processRangeUnselect(ev) {
    let ignore

    // is there a time-range selection?
    if (this.isSelected && this.opt('unselectAuto')) {
      // only unselect if the clicked element is not identical to or inside of an 'unselectCancel' element
      ignore = this.opt('unselectCancel')
      if (!ignore || !elementClosest(ev.target, ignore)) {
        this.unselect(ev)
      }
    }
  }


  processEventUnselect(ev) {
    if (this.selectedEventInstance) {
      if (!elementClosest(ev.target, '.fc-selected')) {
        this.unselectEventInstance()
      }
    }
  }


  /* Triggers
  ------------------------------------------------------------------------------------------------------------------*/


  triggerBaseRendered() {
    this.publiclyTrigger('viewRender', [
      {
        view: this,
        el: this.el
      }
    ])
  }


  triggerBaseUnrendered() {
    this.publiclyTrigger('viewDestroy', [
      {
        view: this,
        el: this.el
      }
    ])
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
  getUnzonedRangeOption(name, ...otherArgs) {
    let val = this.opt(name)

    if (typeof val === 'function') {
      val = val.apply(null, otherArgs)
    }

    if (val) {
      return this.calendar.parseUnzonedRange(val)
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
  trimHiddenDays(inputUnzonedRange) {
    let start = inputUnzonedRange.start
    let end = inputUnzonedRange.end

    if (start) {
      start = this.skipHiddenDays(start)
    }

    if (end) {
      end = this.skipHiddenDays(end, -1, true)
    }

    if (start == null || end == null || start < end) {
      return new UnzonedRange(start, end)
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
  // DOES NOT CONSIDER validUnzonedRange!
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

View.prototype.usesMinMaxTime = false
View.prototype.dateProfileGeneratorClass = DateProfileGenerator


View.watch('displayingDates', [ 'isInDom', 'dateProfile' ], function(deps) {
  this.requestDateRender()
}, function() {
  this.requestDateUnrender()
})


View.watch('displayingBusinessHours', [ 'displayingDates' ], function() {
  this.requestBusinessHoursRender()
}, function() {
  this.requestBusinessHoursUnrender()
})


View.watch('displayingEvents', [ 'displayingDates', 'eventStore' ], function(deps) {
  this.requestRenderEvents(deps.eventStore)
}, function() {
  this.requestUnrenderEvents()
})
