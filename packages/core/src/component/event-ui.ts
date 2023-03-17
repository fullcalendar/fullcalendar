import { Constraint, AllowFunc, normalizeConstraint } from '../structs/constraint.js'
import { parseClassNames } from '../util/html.js'
import { CalendarContext } from '../CalendarContext.js'
import { RawOptionsFromRefiners, RefinedOptionsFromRefiners, identity, Identity } from '../options.js'

// TODO: better called "EventSettings" or "EventConfig"
// TODO: move this file into structs
// TODO: separate constraint/overlap/allow, because selection uses only that, not other props

export const EVENT_UI_REFINERS = {
  display: String,
  editable: Boolean,
  startEditable: Boolean,
  durationEditable: Boolean,
  constraint: identity as Identity<any>, // Identity<ConstraintInput>, // circular reference. ts dies. event->constraint->event
  overlap: identity as Identity<boolean>,
  allow: identity as Identity<AllowFunc>,
  className: parseClassNames, // will both end up as array of strings
  classNames: parseClassNames, // "
  color: String,
  backgroundColor: String,
  borderColor: String,
  textColor: String,
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
  classNames: [],
}

type BuiltInEventUiRefiners = typeof EVENT_UI_REFINERS

interface EventUiRefiners extends BuiltInEventUiRefiners {
  // to prevent circular reference (and give is the option for ambient modification for later)
}

export type EventUiInput = RawOptionsFromRefiners<Required<EventUiRefiners>> // Required hack
export type EventUiRefined = RefinedOptionsFromRefiners<Required<EventUiRefiners>> // Required hack

export interface EventUi {
  display: string | null
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

export function createEventUi(refined: EventUiRefined, context: CalendarContext): EventUi {
  let constraint = normalizeConstraint(refined.constraint, context)

  return {
    display: refined.display || null,
    startEditable: refined.startEditable != null ? refined.startEditable : refined.editable,
    durationEditable: refined.durationEditable != null ? refined.durationEditable : refined.editable,
    constraints: constraint != null ? [constraint] : [],
    overlap: refined.overlap != null ? refined.overlap : null,
    allows: refined.allow != null ? [refined.allow] : [],
    backgroundColor: refined.backgroundColor || refined.color || '',
    borderColor: refined.borderColor || refined.color || '',
    textColor: refined.textColor || '',
    classNames: (refined.className || []).concat(refined.classNames || []), // join singular and plural
  }
}

// TODO: prevent against problems with <2 args!
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
    classNames: item0.classNames.concat(item1.classNames),
  }
}
