import { Constraint, Allow, normalizeConstraint, ConstraintInput, Overlap } from '../validation'
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
  overlap?: Overlap
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
  eventOverlap?: Overlap
  eventAllow?: Allow
  eventRendering?: string
  eventClassName?: string[] | string
  eventClassNames?: string[] | string
  eventBackgroundColor?: string
  eventBorderColor?: string
  eventTextColor?: string
  eventColor?: string
}

export interface EventUiPart {
  startEditable: boolean | null
  durationEditable: boolean | null
  constraint: Constraint | null
  overlap: Overlap | null
  allow: Allow | null
  rendering: string
  backgroundColor: string
  borderColor: string
  textColor: string,
  classNames: string[]
}

export interface EventUi {
  startEditable: boolean
  durationEditable: boolean
  constraints: Constraint[]
  overlaps: Overlap[]
  allows: Allow[]
  rendering: string
  backgroundColor: string
  borderColor: string
  textColor: string,
  classNames: string[]
}

export type EventUiHash = { [defId: string]: EventUi }

export const UNSCOPED_EVENT_UI_PROPS = {
  editable: Boolean,
  startEditable: Boolean,
  durationEditable: Boolean,
  constraint: null,
  overlap: null,
  allow: null,
  rendering: String,
  className: parseClassName,
  classNames: parseClassName,
  color: String,
  backgroundColor: String,
  borderColor: String,
  textColor: String
}

const SCOPED_EVENT_UI_PROPS = { // TODO: not very DRY. instead, map to UNSCOPED_EVENT_UI_PROPS
  editable: Boolean, // only one not scoped
  eventStartEditable: Boolean,
  eventDurationEditable: Boolean,
  eventConstraint: null,
  eventOverlap: null,
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

export function processUnscopedUiProps(rawProps: UnscopedEventUiInput, calendar: Calendar, leftovers?): EventUiPart {
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

export function processScopedUiProps(rawProps: ScopedEventUiInput, calendar: Calendar, leftovers?): EventUiPart {
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

export function combineEventUis(uis: EventUiPart[]): EventUi {
  return uis.reduce(mergeEventUiPart, INITIAL_EVENT_UI)
}

const INITIAL_EVENT_UI: EventUi = {
  startEditable: false,
  durationEditable: false,
  constraints: [],
  overlaps: [],
  allows: [],
  rendering: '',
  backgroundColor: '',
  borderColor: '',
  textColor: '',
  classNames: []
}

function mergeEventUiPart(accum: EventUi, part: EventUiPart): EventUi { // hash1 has higher precedence
  return {
    startEditable: part.startEditable != null ? part.startEditable : accum.startEditable,
    durationEditable: part.durationEditable != null ? part.durationEditable : accum.durationEditable,
    constraints: part.constraint != null ? accum.constraints.concat([ part.constraint ]) : accum.constraints,
    overlaps: part.overlap != null ? accum.overlaps.concat([ part.overlap ]) : accum.overlaps,
    allows: part.allow != null ? accum.allows.concat([ part.allow ]) : accum.allows,
    rendering: part.rendering || accum.rendering,
    backgroundColor: part.backgroundColor || accum.backgroundColor,
    borderColor: part.borderColor || accum.borderColor,
    textColor: part.textColor || accum.textColor,
    classNames: part.classNames.concat(accum.classNames)
  }
}
