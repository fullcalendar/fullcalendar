import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
import { DateMarker, addMs } from './datelib/marker'
import { createDuration, Duration } from './datelib/duration'
import { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
import { ViewSpec } from './structs/view-spec'
import DateComponent from './component/DateComponent'
import { EventStore } from './structs/event-store'
import { EventUiHash } from './component/event-ui'
import { sliceEventStore, EventRenderRange } from './component/event-rendering'
import { DateSpan } from './structs/date-span'
import { EventInteractionState } from './interactions/event-interaction-state'
import { __assign } from 'tslib'


export interface ViewProps {
  viewSpec: ViewSpec
  dateProfileGenerator: DateProfileGenerator
  dateProfile: DateProfile
  businessHours: EventStore
  eventStore: EventStore
  eventUiBases: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionState | null
  eventResize: EventInteractionState | null
}

export default abstract class View<State={}> extends DateComponent<ViewProps, State> {

  // config properties, initialized after class on prototype
  usesMinMaxTime: boolean // whether minTime/maxTime will affect the activeRange. Views must opt-in.
  dateProfileGeneratorClass: any // initialized after class. used by Calendar

  on: EmitterInterface['on']
  one: EmitterInterface['one']
  off: EmitterInterface['off']
  trigger: EmitterInterface['trigger']
  triggerWith: EmitterInterface['triggerWith']
  hasHandlers: EmitterInterface['hasHandlers']

  // now indicator
  isNowIndicatorRendered: boolean
  initialNowDate: DateMarker // result first getNow call
  initialNowQueriedMs: number // ms time the getNow was called
  nowIndicatorTimeoutID: any // for refresh timing of now indicator
  nowIndicatorIntervalID: any // "

  abstract getRootEl(): HTMLElement


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------


  updateSize(isResize: boolean, viewHeight: number, isAuto: boolean) {
  }


  isLayoutSizeDirty() {
    let { calendar } = this.context

    return calendar.isViewUpdated ||
      calendar.isDatesUpdated ||
      calendar.isEventsUpdated
  }


  // Event Rendering
  // -----------------------------------------------------------------------------------------------------------------


  // util for subclasses
  sliceEvents(eventStore: EventStore, allDay: boolean): EventRenderRange[] {
    let { props } = this

    return sliceEventStore(
      eventStore,
      props.eventUiBases,
      props.dateProfile.activeRange,
      allDay ? this.context.nextDayThreshold : null
    ).fg
  }


  // Now Indicator
  // -----------------------------------------------------------------------------------------------------------------


  // Immediately render the current time indicator and begins re-rendering it at an interval,
  // which is defined by this.getNowIndicatorUnit().
  // TODO: somehow do this for the current whole day's background too
  // USAGE: must be called manually from subclasses' render methods! don't need to call stopNowIndicator tho
  startNowIndicator() {
    let { calendar, dateEnv, options } = this.context
    let unit
    let update
    let delay // ms wait value

    if (options.nowIndicator && !this.initialNowDate) {
      unit = this.getNowIndicatorUnit()

      if (unit) {
        update = this.updateNowIndicator.bind(this)

        this.initialNowDate = calendar.getNow()
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

    if (this.nowIndicatorTimeoutID) {
      clearTimeout(this.nowIndicatorTimeoutID)
      this.nowIndicatorTimeoutID = null
    }

    if (this.nowIndicatorIntervalID) {
      clearInterval(this.nowIndicatorIntervalID)
      this.nowIndicatorIntervalID = null
    }

    if (this.isNowIndicatorRendered) {
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


  // Scroller
  // -----------------------------------------------------------------------------------------------------------------


  scrollToInitialTime() {
    let duration = createDuration(this.context.options.scrollTime)

    this.scrollToTime(duration)
  }


  scrollToTime(duration: Duration) {
    // subclasses can implement
  }


  // HACKs
  // -----------------------------------------------------------------------------------------------------------------


  afterSizing(callback) {
    this.context.calendar.afterSizing(callback)
  }

}

EmitterMixin.mixInto(View)

View.prototype.usesMinMaxTime = false
View.prototype.dateProfileGeneratorClass = DateProfileGenerator


export function getViewClassNames(viewSpec: ViewSpec) {
  return [
    'fc-view',
    'fc-' + viewSpec.type + '-view'
  ]
}
