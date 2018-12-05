import { Constraint, Allow, normalizeConstraint, ConstraintInput, Overlap } from '../validation'
import { parseClassName } from '../util/html'
import { refineProps } from '../util/misc'
import Calendar from '../Calendar'

// TODO: better called "EventSettings" or "EventConfig"

export interface UnscopedEventUiInput {
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  constraint?: ConstraintInput
  overlap?: Overlap
  allow?: Allow
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
  constraints: Constraint[]
  overlaps: Overlap[]
  allows: Allow[]
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
  eventClassName: parseClassName,
  eventClassNames: parseClassName,
  eventColor: String,
  eventBackgroundColor: String,
  eventBorderColor: String,
  eventTextColor: String
}

export function processUnscopedUiProps(rawProps: UnscopedEventUiInput, calendar: Calendar, leftovers?): EventUi {
  let props = refineProps(rawProps, UNSCOPED_EVENT_UI_PROPS, {}, leftovers)
  let constraint = normalizeConstraint(props.constraint, calendar)

  return {
    startEditable: props.startEditable != null ? props.startEditable : props.editable,
    durationEditable: props.durationEditable != null ? props.durationEditable : props.editable,
    constraints: constraint != null ? [ constraint ] : [],
    overlaps: props.overlap != null ? [ props.overlap ] : [],
    allows: props.allow != null ? [ props.allow ] : [],
    backgroundColor: props.backgroundColor || props.color,
    borderColor: props.borderColor || props.color,
    textColor: props.textColor,
    classNames: props.classNames.concat(props.className)
  }
}

export function processScopedUiProps(rawProps: ScopedEventUiInput, calendar: Calendar, leftovers?): EventUi {
  let props = refineProps(rawProps, SCOPED_EVENT_UI_PROPS, {}, leftovers)
  let constraint = normalizeConstraint(props.eventConstraint, calendar)

  return {
    startEditable: props.eventStartEditable != null ? props.eventStartEditable : props.editable,
    durationEditable: props.eventDurationEditable != null ? props.eventDurationEditable : props.editable,
    constraints: constraint != null ? [ constraint ] : [],
    overlaps: props.eventOverlap != null ? [ props.eventOverlap ] : [],
    allows: props.eventAllow != null ? [ props.eventAllow ] : [],
    backgroundColor: props.eventBackgroundColor || props.eventColor,
    borderColor: props.eventBorderColor || props.eventColor,
    textColor: props.eventTextColor,
    classNames: props.eventClassNames.concat(props.eventClassName)
  }
}

export function combineEventUis(uis: EventUi[]): EventUi {
  return uis.reduce(mergeEventUis)
}

function mergeEventUis(item0: EventUi, item1: EventUi): EventUi { // hash1 has higher precedence
  return {
    startEditable: item1.startEditable != null ? item1.startEditable : item0.startEditable,
    durationEditable: item1.durationEditable != null ? item1.durationEditable : item0.durationEditable,
    constraints: item0.constraints.concat(item1.constraints),
    overlaps: item0.overlaps.concat(item1.overlaps),
    allows: item0.allows.concat(item1.allows),
    backgroundColor: item1.backgroundColor || item0.backgroundColor,
    borderColor: item1.borderColor || item0.borderColor,
    textColor: item1.textColor || item0.textColor,
    classNames: item0.classNames.concat(item1.classNames)
  }
}
