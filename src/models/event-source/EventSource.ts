import * as $ from 'jquery'
import {
  default as ParsableModelMixin,
  ParsableModelInterface
} from '../../common/ParsableModelMixin'
import Class from '../../common/Class'
import Calendar from '../../Calendar'
import EventDefParser from '../event/EventDefParser'


export default class EventSource extends Class {

  static uuid: number = 0
  static defineStandardProps = ParsableModelMixin.defineStandardProps
  static copyVerbatimStandardProps = ParsableModelMixin.copyVerbatimStandardProps

  applyProps: ParsableModelInterface['applyProps']
  isStandardProp: ParsableModelInterface['isStandardProp']

  calendar: Calendar

  id: string // can stay null
  uid: string
  color: string
  backgroundColor: string
  borderColor: string
  textColor: string
  className: string[]
  editable: boolean
  startEditable: boolean
  durationEditable: boolean
  rendering: string | null
  overlap: boolean
  constraint: any
  allDayDefault: boolean
  eventDataTransform: any // optional function


  // can we do away with calendar? at least for the abstract?
  // useful for buildEventDef
  constructor(calendar) {
    super()
    this.calendar = calendar
    this.className = []
    this.uid = String(EventSource.uuid++)
  }


  /*
  rawInput can be any data type!
  */
  static parse(rawInput, calendar) {
    let source = new this(calendar)

    if (typeof rawInput === 'object') {
      if (source.applyProps(rawInput)) {
        return source
      }
    }

    return false
  }


  static normalizeId(id) { // TODO: converge with EventDef
    if (id) {
      return String(id)
    }

    return null
  }


  fetch(start, end, timezone) {
    // subclasses must implement. must return a promise.
  }


  removeEventDefsById(eventDefId) {
    // optional for subclasses to implement
  }


  removeAllEventDefs() {
    // optional for subclasses to implement
  }


  /*
  For compairing/matching
  */
  getPrimitive(otherSource) {
    // subclasses must implement
  }


  parseEventDefs(rawEventDefs) {
    let i
    let eventDef
    let eventDefs = []

    for (i = 0; i < rawEventDefs.length; i++) {
      eventDef = this.parseEventDef(rawEventDefs[i])

      if (eventDef) {
        eventDefs.push(eventDef)
      }
    }

    return eventDefs
  }


  parseEventDef(rawInput) {
    let calendarTransform = this.calendar.opt('eventDataTransform')
    let sourceTransform = this.eventDataTransform

    if (calendarTransform) {
      rawInput = calendarTransform(rawInput, this.calendar)
    }
    if (sourceTransform) {
      rawInput = sourceTransform(rawInput, this.calendar)
    }

    return EventDefParser.parse(rawInput, this)
  }


  applyManualStandardProps(rawProps) {

    if (rawProps.id != null) {
      this.id = EventSource.normalizeId(rawProps.id)
    }

    // TODO: converge with EventDef
    if ($.isArray(rawProps.className)) {
      this.className = rawProps.className
    } else if (typeof rawProps.className === 'string') {
      this.className = rawProps.className.split(/\s+/)
    }

    return true
  }

}

ParsableModelMixin.mixInto(EventSource)


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


EventSource.defineStandardProps({
  // manually process...
  id: false,
  className: false,

  // automatically transfer...
  color: true,
  backgroundColor: true,
  borderColor: true,
  textColor: true,
  editable: true,
  startEditable: true,
  durationEditable: true,
  rendering: true,
  overlap: true,
  constraint: true,
  allDayDefault: true,
  eventDataTransform: true
})
