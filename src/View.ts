import { assignTo } from './util/object'
import { parseFieldSpecs } from './util/misc'
import DateProfileGenerator from './DateProfileGenerator'
import StandardDateComponent from './component/StandardDateComponent'
import { DateMarker, addMs } from './datelib/marker'
import { createDuration } from './datelib/duration'
import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import { ViewSpec } from './structs/view-spec'
import { createElement } from './util/dom-manip'
import { ComponentContext } from './component/Component'


/* An abstract class from which other views inherit from
----------------------------------------------------------------------------------------------------------------------*/

export default abstract class View extends StandardDateComponent {

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

  eventOrderSpecs: any // criteria for ordering events when they have same date/time

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


  // Skeleton Rendering
  // -----------------------------------------------------------------------------------------------------------------


  afterSkeletonRender() {
    this.publiclyTriggerAfterSizing('viewSkeletonRender', [
      {
        view: this,
        el: this.el
      }
    ])
  }


  beforeSkeletonUnrender() {
    this.publiclyTrigger('viewSkeletonDestroy', [
      {
        view: this,
        el: this.el
      }
    ])
  }


  // Date Rendering
  // -----------------------------------------------------------------------------------------------------------------


  afterDatesRender() {
    this.addScroll({ isDateInit: true })
    this.startNowIndicator() // shouldn't render yet because updateSize will be called soon

    this.publiclyTriggerAfterSizing('datesRender', [
      {
        view: this,
        el: this.el
      }
    ])
  }


  beforeDatesUnrender() {
    this.publiclyTrigger('datesDestroy', [
      {
        view: this,
        el: this.el
      }
    ])

    this.stopNowIndicator()
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


  /* Date Utils
  ------------------------------------------------------------------------------------------------------------------*/


  // For DateComponent::getDayClasses
  isDateInOtherMonth(date: DateMarker, dateProfile) {
    return false
  }

}

EmitterMixin.mixInto(View)

View.prototype.usesMinMaxTime = false
View.prototype.dateProfileGeneratorClass = DateProfileGenerator
