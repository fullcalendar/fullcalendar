import { assignTo } from './util/object'
import { parseFieldSpecs } from './util/misc'
import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
import { DateMarker, addMs } from './datelib/marker'
import { createDuration, Duration } from './datelib/duration'
import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import { ViewSpec } from './structs/view-spec'
import { createElement } from './util/dom-manip'
import { ComponentContext } from './component/Component'
import DateComponent from './component/DateComponent'
import { EventStore } from './structs/event-store'
import { EventUiHash, sliceEventStore, EventRenderRange } from './component/event-rendering'
import { DateSpan } from './structs/date-span'
import { EventInteractionUiState } from './interactions/event-interaction-state'

export interface ViewProps {
  dateProfile: DateProfile
  businessHours: EventStore
  eventStore: EventStore
  eventUis: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionUiState | null
  eventResize: EventInteractionUiState | null
}

export default abstract class View extends DateComponent<ViewProps> {

  // config properties, initialized after class on prototype
  usesMinMaxTime: boolean // whether minTime/maxTime will affect the activeRange. Views must opt-in.
  dateProfileGeneratorClass: any // initialized after class. used by Calendar

  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']

  viewSpec: ViewSpec
  dateProfileGenerator: DateProfileGenerator
  type: string // subclass' view name (string). for the API
  title: string // the text that will be displayed in the header's title. SET BY CALLER for API

  queuedScroll: any

  isDateSizeDirty: boolean = false
  isEventSizeDirty: boolean = false

  eventOrderSpecs: any // criteria for ordering events when they have same date/time
  nextDayThreshold: Duration

  // now indicator
  isNowIndicatorRendered: boolean
  initialNowDate: DateMarker // result first getNow call
  initialNowQueriedMs: number // ms time the getNow was called
  nowIndicatorTimeoutID: any // for refresh timing of now indicator
  nowIndicatorIntervalID: any // "


  constructor(context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement) {
    super(
      {
        options: context.options,
        dateEnv: context.dateEnv,
        theme: context.theme,
        calendar: context.calendar
      },
      createElement('div', { className: 'fc-view fc-' + viewSpec.type + '-view' })
    )

    this.context.view = this // for when passing context to children

    this.viewSpec = viewSpec
    this.dateProfileGenerator = dateProfileGenerator
    this.type = viewSpec.type
    this.eventOrderSpecs = parseFieldSpecs(this.opt('eventOrder'))
    this.nextDayThreshold = createDuration(this.opt('nextDayThreshold'))

    parentEl.appendChild(this.el)
    this.initialize()
  }


  initialize() { // convenient for sublcasses
  }


  // Date Setting/Unsetting
  // -----------------------------------------------------------------------------------------------------------------


  get activeStart(): Date {
    return this.dateEnv.toDate(this.props.dateProfile.activeRange.start)
  }

  get activeEnd(): Date {
    return this.dateEnv.toDate(this.props.dateProfile.activeRange.end)
  }

  get currentStart(): Date {
    return this.dateEnv.toDate(this.props.dateProfile.currentRange.start)
  }

  get currentEnd(): Date {
    return this.dateEnv.toDate(this.props.dateProfile.currentRange.end)
  }


  // General Rendering
  // -----------------------------------------------------------------------------------------------------------------


  render(props: ViewProps) {
    let dateId = this.subrender('_renderDates', [ props.dateProfile ], '_unrenderDates')
    this.subrender('renderBusinessHours', [ props.businessHours, props.dateProfile, dateId ], 'unrenderBusinessHours')
    this.subrender('renderDateSelectionState', [ props.dateSelection, dateId ], 'unrenderDateSelection')
    let evId = this.subrender('_renderEvents', [ props.eventStore, props.eventUis, dateId ], 'unrenderEvents')
    this.subrender('renderEventSelection', [ props.eventSelection, evId ], 'unrenderEventSelection')
    this.subrender('renderEventDragState', [ props.eventDrag, dateId ], 'unrenderEventDragState')
    this.subrender('renderEventResizeState', [ props.eventResize, dateId ], 'unrenderEventResizeState')
  }


  // util for subclasses
  sliceEvents(eventStore: EventStore, eventUis: EventUiHash, allDay: boolean): EventRenderRange[] {
    return sliceEventStore(
      eventStore,
      eventUis,
      this.props.dateProfile.activeRange,
      allDay ? this.nextDayThreshold : null
    )
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------


  updateSize(viewHeight: number, isAuto: boolean, isResize: boolean) {
    let { fillRenderer, eventRenderer, mirrorRenderer } = this

    if (isResize || this.isDateSizeDirty || this.isEventSizeDirty) {
      // sort of the catch-all sizing
      // anything that might cause dimension changes
      this.updateBaseSize(viewHeight, isAuto, isResize)
    }

    this.isDateSizeDirty = false
    this.isEventSizeDirty = false

    fillRenderer && fillRenderer.computeSizes(isResize)
    eventRenderer && eventRenderer.computeSizes(isResize)
    mirrorRenderer && mirrorRenderer.computeSizes(isResize)

    fillRenderer && fillRenderer.assignSizes(isResize)
    eventRenderer && eventRenderer.assignSizes(isResize)
    mirrorRenderer && mirrorRenderer.assignSizes(isResize)
  }


  updateBaseSize(viewHeight: number, isAuto: boolean, isResize: boolean) {
  }


  // Date Rendering
  // -----------------------------------------------------------------------------------------------------------------


  _renderDates(dateProfile: DateProfile) {
    this.renderDates(dateProfile)
    this.addScroll({ isDateInit: true })
    this.startNowIndicator() // shouldn't render yet because updateSize will be called soon
    this.isDateSizeDirty = true
  }

  _unrenderDates() {
    this.stopNowIndicator()
    this.unrenderDates()
  }

  renderDates(dateProfile: DateProfile) {}
  unrenderDates() {}


  // Event Rendering
  // -----------------------------------------------------------------------------------------------------------------

  _renderEvents(eventStore: EventStore, eventUis: EventUiHash) {
    this.isEventSizeDirty = true
    this.renderEvents(eventStore, eventUis)
  }

  renderEvents(eventStore: EventStore, eventUis: EventUiHash) {}


  // Other Rendering (uses eventRenderer and fillRenderer)
  // -----------------------------------------------------------------------------------------------------------------


  renderBusinessHours(businessHours: EventStore) {}
  renderEventSelection(instanceId: string) {}

  renderEventDragState(state: EventInteractionUiState) {}
  unrenderEventDragState() {}

  renderEventResizeState(state: EventInteractionUiState) {}
  unrenderEventResizeState() {}

  renderDateSelectionState(selection: DateSpan) {
    if (selection) {
      this.renderDateSelection(selection)
    }
  }

  renderDateSelection(selection: DateSpan) {
  }


  /* Now Indicator
  ------------------------------------------------------------------------------------------------------------------*/


  // Immediately render the current time indicator and begins re-rendering it at an interval,
  // which is defined by this.getNowIndicatorUnit().
  // TODO: somehow do this for the current whole day's background too
  startNowIndicator() {
    let { dateEnv } = this
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
      this.props.dateProfile && // a way to determine if dates were rendered yet
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


  getNowIndicatorUnit() {
    // subclasses should implement
  }


  // Renders a current time indicator at the given datetime
  renderNowIndicator(date) {
    // SUBCLASSES MUST PASS TO CHILDREN!
  }


  // Undoes the rendering actions from renderNowIndicator
  unrenderNowIndicator() {
    // SUBCLASSES MUST PASS TO CHILDREN!
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
    this.applyScroll(this.queuedScroll || {})
  }


  queryScroll() {
    let scroll = {} as any

    if (this.props.dateProfile) { // dates rendered yet?
      assignTo(scroll, this.queryDateScroll())
    }

    return scroll
  }


  applyScroll(scroll) {

    if (scroll.isDateInit) {
      delete scroll.isDateInit

      if (this.props.dateProfile) { // dates rendered yet?
        assignTo(scroll, this.computeInitialDateScroll())
      }
    }

    if (this.props.dateProfile) { // dates rendered yet?
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

}

EmitterMixin.mixInto(View)

View.prototype.usesMinMaxTime = false
View.prototype.dateProfileGeneratorClass = DateProfileGenerator
