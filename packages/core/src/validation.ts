import { EventStore, expandRecurring, filterEventStoreDefs, parseEvents, createEmptyEventStore } from './structs/event-store'
import Calendar from './Calendar'
import { DateSpan, DateSpanApi } from './structs/date-span'
import { rangeContainsRange, rangesIntersect, DateRange, OpenDateRange } from './datelib/date-range'
import EventApi from './api/EventApi'
import { compileEventUis } from './component/event-rendering'
import { excludeInstances } from './reducers/eventStore'
import { EventInput } from './structs/event'
import { EventInteractionState } from './interactions/event-interaction-state'
import { SplittableProps } from './component/event-splitting'
import { mapHash } from './util/object'

// TODO: rename to "criteria" ?
export type ConstraintInput = 'businessHours' | string | EventInput | EventInput[]
export type Constraint = 'businessHours' | string | EventStore | false // false means won't pass at all
export type OverlapFunc = ((stillEvent: EventApi, movingEvent: EventApi | null) => boolean)
export type AllowFunc = (span: DateSpanApi, movingEvent: EventApi | null) => boolean
export type isPropsValidTester = (props: SplittableProps, calendar: Calendar) => boolean


// high-level segmenting-aware tester functions
// ------------------------------------------------------------------------------------------------------------------------

export function isInteractionValid(interaction: EventInteractionState, calendar: Calendar) {
  return isNewPropsValid({ eventDrag: interaction }, calendar) // HACK: the eventDrag props is used for ALL interactions
}

export function isDateSelectionValid(dateSelection: DateSpan, calendar: Calendar) {
  return isNewPropsValid({ dateSelection }, calendar)
}

function isNewPropsValid(newProps, calendar: Calendar) {
  let view = calendar.view

  let props = {
    businessHours: view ? view.props.businessHours : createEmptyEventStore(), // why? yuck
    dateSelection: '',
    eventStore: calendar.state.eventStore,
    eventUiBases: calendar.eventUiBases,
    eventSelection: '',
    eventDrag: null,
    eventResize: null,
    ...newProps
  }

  return (calendar.pluginSystem.hooks.isPropsValid || isPropsValid)(props, calendar)
}

export function isPropsValid(state: SplittableProps, calendar: Calendar, dateSpanMeta = {}, filterConfig?): boolean {

  if (state.eventDrag && !isInteractionPropsValid(state, calendar, dateSpanMeta, filterConfig)) {
    return false
  }

  if (state.dateSelection && !isDateSelectionPropsValid(state, calendar, dateSpanMeta, filterConfig)) {
    return false
  }

  return true
}


// Moving Event Validation
// ------------------------------------------------------------------------------------------------------------------------

function isInteractionPropsValid(state: SplittableProps, calendar: Calendar, dateSpanMeta: any, filterConfig): boolean {
  let interaction = state.eventDrag // HACK: the eventDrag props is used for ALL interactions

  let subjectEventStore = interaction.mutatedEvents
  let subjectDefs = subjectEventStore.defs
  let subjectInstances = subjectEventStore.instances
  let subjectConfigs = compileEventUis(
    subjectDefs,
    interaction.isEvent ?
      state.eventUiBases :
      { '': calendar.selectionConfig } // if not a real event, validate as a selection
  )

  if (filterConfig) {
    subjectConfigs = mapHash(subjectConfigs, filterConfig)
  }

  let otherEventStore = excludeInstances(state.eventStore, interaction.affectedEvents.instances) // exclude the subject events. TODO: exclude defs too?
  let otherDefs = otherEventStore.defs
  let otherInstances = otherEventStore.instances
  let otherConfigs = compileEventUis(otherDefs, state.eventUiBases)

  for (let subjectInstanceId in subjectInstances) {
    let subjectInstance = subjectInstances[subjectInstanceId]
    let subjectRange = subjectInstance.range
    let subjectConfig = subjectConfigs[subjectInstance.defId]
    let subjectDef = subjectDefs[subjectInstance.defId]

    // constraint
    if (!allConstraintsPass(subjectConfig.constraints, subjectRange, otherEventStore, state.businessHours, calendar)) {
      return false
    }

    // overlap

    let overlapFunc = calendar.opt('eventOverlap')
    if (typeof overlapFunc !== 'function') { overlapFunc = null }

    for (let otherInstanceId in otherInstances) {
      let otherInstance = otherInstances[otherInstanceId]

      // intersect! evaluate
      if (rangesIntersect(subjectRange, otherInstance.range)) {
        let otherOverlap = otherConfigs[otherInstance.defId].overlap

        // consider the other event's overlap. only do this if the subject event is a "real" event
        if (otherOverlap === false && interaction.isEvent) {
          return false
        }

        if (subjectConfig.overlap === false) {
          return false
        }

        if (overlapFunc && !overlapFunc(
          new EventApi(calendar, otherDefs[otherInstance.defId], otherInstance), // still event
          new EventApi(calendar, subjectDef, subjectInstance) // moving event
        )) {
          return false
        }
      }
    }

    // allow (a function)

    let calendarEventStore = calendar.state.eventStore // need global-to-calendar, not local to component (splittable)state

    for (let subjectAllow of subjectConfig.allows) {

      let subjectDateSpan: DateSpan = {
        ...dateSpanMeta,
        range: subjectInstance.range,
        allDay: subjectDef.allDay
      }

      let origDef = calendarEventStore.defs[subjectDef.defId]
      let origInstance = calendarEventStore.instances[subjectInstanceId]
      let eventApi

      if (origDef) { // was previously in the calendar
        eventApi = new EventApi(calendar, origDef, origInstance)
      } else { // was an external event
        eventApi = new EventApi(calendar, subjectDef) // no instance, because had no dates
      }

      if (!subjectAllow(
        calendar.buildDateSpanApi(subjectDateSpan),
        eventApi
      )) {
        return false
      }
    }

  }

  return true
}


// Date Selection Validation
// ------------------------------------------------------------------------------------------------------------------------

function isDateSelectionPropsValid(state: SplittableProps, calendar: Calendar, dateSpanMeta: any, filterConfig): boolean {
  let relevantEventStore = state.eventStore
  let relevantDefs = relevantEventStore.defs
  let relevantInstances = relevantEventStore.instances

  let selection = state.dateSelection
  let selectionRange = selection.range
  let { selectionConfig } = calendar

  if (filterConfig) {
    selectionConfig = filterConfig(selectionConfig)
  }

  // constraint
  if (!allConstraintsPass(selectionConfig.constraints, selectionRange, relevantEventStore, state.businessHours, calendar)) {
    return false
  }

  // overlap

  let overlapFunc = calendar.opt('selectOverlap')
  if (typeof overlapFunc !== 'function') { overlapFunc = null }

  for (let relevantInstanceId in relevantInstances) {
    let relevantInstance = relevantInstances[relevantInstanceId]

    // intersect! evaluate
    if (rangesIntersect(selectionRange, relevantInstance.range)) {

      if (selectionConfig.overlap === false) {
        return false
      }

      if (overlapFunc && !overlapFunc(
        new EventApi(calendar, relevantDefs[relevantInstance.defId], relevantInstance)
      )) {
        return false
      }
    }
  }

  // allow (a function)
  for (let selectionAllow of selectionConfig.allows) {

    let fullDateSpan = { ...dateSpanMeta, ...selection }

    if (!selectionAllow(
      calendar.buildDateSpanApi(fullDateSpan),
      null
    )) {
      return false
    }
  }

  return true
}


// Constraint Utils
// ------------------------------------------------------------------------------------------------------------------------

function allConstraintsPass(
  constraints: Constraint[],
  subjectRange: DateRange,
  otherEventStore: EventStore,
  businessHoursUnexpanded: EventStore,
  calendar: Calendar
): boolean {
  for (let constraint of constraints) {
    if (!anyRangesContainRange(
      constraintToRanges(constraint, subjectRange, otherEventStore, businessHoursUnexpanded, calendar),
      subjectRange
    )) {
      return false
    }
  }

  return true
}

function constraintToRanges(
  constraint: Constraint,
  subjectRange: DateRange, // for expanding a recurring constraint, or expanding business hours
  otherEventStore: EventStore, // for if constraint is an even group ID
  businessHoursUnexpanded: EventStore, // for if constraint is 'businessHours'
  calendar: Calendar // for expanding businesshours
): OpenDateRange[] {

  if (constraint === 'businessHours') {
    return eventStoreToRanges(
      expandRecurring(businessHoursUnexpanded, subjectRange, calendar)
    )

  } else if (typeof constraint === 'string') { // an group ID
    return eventStoreToRanges(
      filterEventStoreDefs(otherEventStore, function(eventDef) {
        return eventDef.groupId === constraint
      })
    )

  } else if (typeof constraint === 'object' && constraint) { // non-null object
    return eventStoreToRanges(
      expandRecurring(constraint, subjectRange, calendar)
    )
  }

  return [] // if it's false
}

// TODO: move to event-store file?
function eventStoreToRanges(eventStore: EventStore): DateRange[] {
  let { instances } = eventStore
  let ranges: DateRange[] = []

  for (let instanceId in instances) {
    ranges.push(instances[instanceId].range)
  }

  return ranges
}

// TODO: move to geom file?
function anyRangesContainRange(outerRanges: DateRange[], innerRange: DateRange): boolean {

  for (let outerRange of outerRanges) {
    if (rangeContainsRange(outerRange, innerRange)) {
      return true
    }
  }

  return false
}


// Parsing
// ------------------------------------------------------------------------------------------------------------------------

export function normalizeConstraint(input: ConstraintInput, calendar: Calendar): Constraint | null {
  if (Array.isArray(input)) {
    return parseEvents(input, '', calendar, true) // allowOpenRange=true

  } else if (typeof input === 'object' && input) { // non-null object
    return parseEvents([ input ], '', calendar, true) // allowOpenRange=true

  } else if (input != null) {
    return String(input)

  } else {
    return null
  }
}
