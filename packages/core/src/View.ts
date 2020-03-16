import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
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
  isHeightAuto: boolean
  forPrint: boolean
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

}

EmitterMixin.mixInto(View)

View.prototype.usesMinMaxTime = false
View.prototype.dateProfileGeneratorClass = DateProfileGenerator
