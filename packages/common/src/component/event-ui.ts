import { Constraint, AllowFunc, normalizeConstraint, ConstraintInput } from '../structs/constraint'
import { parseClassNames } from '../util/html'
import { refineProps } from '../util/misc'
import { CalendarContext } from '../CalendarContext'
import { identity } from '../options'

// TODO: better called "EventSettings" or "EventConfig"
// TODO: move this file into structs
// TODO: separate constraint/overlap/allow, because selection uses only that, not other props

export interface RawEventUi {
  display?: string
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  constraint?: ConstraintInput
  overlap?: boolean
  allow?: AllowFunc
  className?: string[] | string
  classNames?: string[] | string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  color?: string
}

export interface EventUi {
  display: string
  startEditable: boolean | null
  durationEditable: boolean | null
  constraints: Constraint[]
  overlap: boolean | null
  allows: AllowFunc[] // crappy name to indicate plural
  backgroundColor: string
  borderColor: string
  textColor: string,
  classNames: string[]
}

export type EventUiHash = { [defId: string]: EventUi }

export const UI_PROPS_REFINERS = {
  display: identity, // TODO: string?
  editable: Boolean,
  startEditable: Boolean,
  durationEditable: Boolean,
  constraint: identity,
  overlap: identity,
  allow: identity,
  classNames: parseClassNames,
  color: String,
  backgroundColor: String,
  borderColor: String,
  textColor: String
}

export const EVENT_SCOPED_RAW_UI_PROPS = {
  eventDisplay: true,
  editable: true,
  eventStartEditable: true,
  eventDurationEditable: true,
  eventConstraint: true,
  eventOverlap: true,
  eventAllow: true,
  eventBackgroundColor: true,
  eventBorderColor: true,
  eventTextColor: true,
  eventClassNames: true
}

const EMPTY_EVENT_UI: EventUi = {
  display: null,
  startEditable: null,
  durationEditable: null,
  constraints: [],
  overlap: null,
  allows: [],
  backgroundColor: '',
  borderColor: '',
  textColor: '',
  classNames: []
}


export function processUiProps(rawProps: RawEventUi, context: CalendarContext, leftovers?): EventUi {
  let props = refineProps(rawProps, UI_PROPS_REFINERS, {}, leftovers)
  let constraint = normalizeConstraint(props.constraint, context)

  return {
    display: props.display,
    startEditable: props.startEditable != null ? props.startEditable : props.editable,
    durationEditable: props.durationEditable != null ? props.durationEditable : props.editable,
    constraints: constraint != null ? [ constraint ] : [],
    overlap: props.overlap,
    allows: props.allow != null ? [ props.allow ] : [],
    backgroundColor: props.backgroundColor || props.color,
    borderColor: props.borderColor || props.color,
    textColor: props.textColor,
    classNames: props.classNames
  }
}


// prevent against problems with <2 args!
export function combineEventUis(uis: EventUi[]): EventUi {
  return uis.reduce(combineTwoEventUis, EMPTY_EVENT_UI)
}


function combineTwoEventUis(item0: EventUi, item1: EventUi): EventUi { // hash1 has higher precedence
  return {
    display: item1.display != null ? item1.display : item0.display,
    startEditable: item1.startEditable != null ? item1.startEditable : item0.startEditable,
    durationEditable: item1.durationEditable != null ? item1.durationEditable : item0.durationEditable,
    constraints: item0.constraints.concat(item1.constraints),
    overlap: typeof item1.overlap === 'boolean' ? item1.overlap : item0.overlap,
    allows: item0.allows.concat(item1.allows),
    backgroundColor: item1.backgroundColor || item0.backgroundColor,
    borderColor: item1.borderColor || item0.borderColor,
    textColor: item1.textColor || item0.textColor,
    classNames: item0.classNames.concat(item1.classNames)
  }
}
