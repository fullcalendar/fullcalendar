import { Constraint, AllowFunc, normalizeConstraint, ConstraintInput } from '../validation'
import { parseClassName } from '../util/html'
import { refineProps, capitaliseFirstLetter } from '../util/misc'
import Calendar from '../Calendar'

// TODO: better called "EventSettings" or "EventConfig"
// TODO: move this file into structs
// TODO: separate constraint/overlap/allow, because selection uses only that, not other props

export interface UnscopedEventUiInput {
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
  startEditable: boolean | null
  durationEditable: boolean | null
  constraints: Constraint[]
  overlap: boolean | null
  allows: AllowFunc[]
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

export function processUnscopedUiProps(rawProps: UnscopedEventUiInput, calendar: Calendar, leftovers?): EventUi {
  let props = refineProps(rawProps, UNSCOPED_EVENT_UI_PROPS, {}, leftovers)
  let constraint = normalizeConstraint(props.constraint, calendar)

  return {
    startEditable: props.startEditable != null ? props.startEditable : props.editable,
    durationEditable: props.durationEditable != null ? props.durationEditable : props.editable,
    constraints: constraint != null ? [ constraint ] : [],
    overlap: props.overlap,
    allows: props.allow != null ? [ props.allow ] : [],
    backgroundColor: props.backgroundColor || props.color,
    borderColor: props.borderColor || props.color,
    textColor: props.textColor,
    classNames: props.classNames.concat(props.className)
  }
}

export function processScopedUiProps(prefix: string, rawScoped: any, calendar: Calendar, leftovers?): EventUi {
  let rawUnscoped = {} as any
  let wasFound = {} as any

  for (let key in UNSCOPED_EVENT_UI_PROPS) {
    let scopedKey = prefix + capitaliseFirstLetter(key)
    rawUnscoped[key] = rawScoped[scopedKey]
    wasFound[scopedKey] = true
  }

  if (prefix === 'event') {
    rawUnscoped.editable = rawScoped.editable // special case. there is no 'eventEditable', just 'editable'
  }

  if (leftovers) {
    for (let key in rawScoped) {
      if (!wasFound[key]) {
        leftovers[key] = rawScoped[key]
      }
    }
  }

  return processUnscopedUiProps(rawUnscoped, calendar)
}

const EMPTY_EVENT_UI: EventUi = {
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

// prevent against problems with <2 args!
export function combineEventUis(uis: EventUi[]): EventUi {
  return uis.reduce(combineTwoEventUis, EMPTY_EVENT_UI)
}

function combineTwoEventUis(item0: EventUi, item1: EventUi): EventUi { // hash1 has higher precedence
  return {
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
