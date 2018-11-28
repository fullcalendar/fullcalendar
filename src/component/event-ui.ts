import { Constraint, Allow, normalizeConstraint, ConstraintInput } from '../validation'
import { parseClassName } from '../util/html'
import { refineProps } from '../util/misc'
import Calendar from '../Calendar'
import { EventDefHash, EventDef } from '../structs/event'
import { EventSourceHash } from '../structs/event-source'
import { mapHash } from '../util/object'

export interface UnscopedEventUiInput {
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  constraint?: ConstraintInput
  overlap?: boolean // does not allow full Overlap data type
  allow?: Allow
  rendering?: string
  className?: string[] | string
  classNames?: string[] | string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  color?: string
}

export interface ScopedEventUiInput {
  editable?: boolean // only one not scoped
  eventStartEditable?: boolean
  eventDurationEditable?: boolean
  eventConstraint?: ConstraintInput
  eventOverlap?: boolean // does not allow full Overlap data type
  eventAllow?: Allow
  eventRendering?: string
  eventClassName?: string[] | string
  eventClassNames?: string[] | string
  eventBackgroundColor?: string
  eventBorderColor?: string
  eventTextColor?: string
  eventColor?: string
}

export interface EventUi {
  startEditable: boolean | null
  durationEditable: boolean | null
  constraint: Constraint | null
  overlap: boolean | null
  allow: Allow | null
  rendering: string
  backgroundColor: string
  borderColor: string
  textColor: string,
  classNames: string[]
}

export type EventUiHash = { [defId: string]: EventUi }

const UNSCOPED_EVENT_UI_PROPS = {
  editable: Boolean,
  startEditable: Boolean,
  durationEditable: Boolean,
  constraint: null,
  overlap: Boolean,
  allow: null,
  rendering: String,
  className: parseClassName,
  classNames: parseClassName,
  color: String,
  backgroundColor: String,
  borderColor: String,
  textColor: String
}

const SCOPED_EVENT_UI_PROPS = {
  editable: Boolean, // only one not scoped
  eventStartEditable: Boolean,
  eventDurationEditable: Boolean,
  eventConstraint: null,
  eventOverlap: Boolean,
  eventAllow: null,
  eventRendering: String,
  eventClassName: parseClassName,
  eventClassNames: parseClassName,
  eventColor: String,
  eventBackgroundColor: String,
  eventBorderColor: String,
  eventTextColor: String
}

export function computeEventDefUis(eventDefs: EventDefHash, eventSources: EventSourceHash, calendar: Calendar): EventUiHash {
  return mapHash(eventDefs, function(eventDef) {
    return computeEventDefUi(eventDef, eventSources, calendar)
  })
}

export function computeEventDefUi(eventDef: EventDef, eventSources: EventSourceHash, calendar: Calendar): EventUi {
  let uis = [ calendar.baseEventUi ]

  if (eventDef.sourceId && eventSources[eventDef.sourceId]) {
    uis.push(eventSources[eventDef.sourceId].ui)
  }

  uis.push(eventDef.ui)

  return combineEventUis(uis)
}

export function processUnscopedUiProps(rawProps: UnscopedEventUiInput, calendar: Calendar, leftovers?): EventUi {
  let props = refineProps(rawProps, UNSCOPED_EVENT_UI_PROPS, {}, leftovers)

  return {
    startEditable: props.startEditable != null ? props.startEditable : props.editable,
    durationEditable: props.durationEditable != null ? props.durationEditable : props.editable,
    constraint: normalizeConstraint(props.constraint, calendar),
    overlap: props.overlap,
    allow: props.allow,
    rendering: props.rendering,
    backgroundColor: props.backgroundColor || props.color,
    borderColor: props.borderColor || props.color,
    textColor: props.textColor,
    classNames: props.classNames.concat(props.className)
  }
}

export function processScopedUiProps(rawProps: ScopedEventUiInput, calendar: Calendar, leftovers?): EventUi {
  let props = refineProps(rawProps, SCOPED_EVENT_UI_PROPS, {}, leftovers)

  return {
    startEditable: props.eventStartEditable != null ? props.eventStartEditable : props.editable,
    durationEditable: props.eventDurationEditable != null ? props.eventDurationEditable : props.editable,
    constraint: normalizeConstraint(props.eventConstraint, calendar),
    overlap: props.eventOverlap,
    allow: props.eventAllow,
    rendering: props.eventRendering,
    backgroundColor: props.eventBackgroundColor || props.eventColor,
    borderColor: props.eventBorderColor || props.eventColor,
    textColor: props.eventTextColor,
    classNames: props.eventClassNames.concat(props.eventClassName)
  }
}

export function combineEventUis(uis: EventUi[]): EventUi {
  return uis.reduce(combineTwoEventUis)
}

function combineTwoEventUis(hash0: EventUi, hash1: EventUi): EventUi { // hash1 has higher precedence
  return {
    startEditable: hash1.startEditable != null ? hash1.startEditable : hash0.startEditable,
    durationEditable: hash1.durationEditable != null ? hash1.durationEditable : hash0.durationEditable,
    constraint: hash1.constraint || hash0.constraint,
    overlap: hash1.overlap != null ? hash1.overlap : hash0.overlap,
    allow: hash1.allow || hash0.allow,
    rendering: hash1.rendering || hash0.rendering,
    backgroundColor: hash1.backgroundColor || hash0.backgroundColor,
    borderColor: hash1.borderColor || hash0.borderColor,
    textColor: hash1.textColor || hash0.textColor,
    classNames: hash0.classNames.concat(hash1.classNames)
  }
}
