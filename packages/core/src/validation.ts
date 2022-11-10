import { EventStore, filterEventStoreDefs } from './structs/event-store.js'
import { DateSpan } from './structs/date-span.js'
import { rangeContainsRange, rangesIntersect, DateRange, OpenDateRange } from './datelib/date-range.js'
import { EventImpl } from './api/EventImpl.js'
import { compileEventUis } from './component/event-rendering.js'
import { excludeInstances } from './reducers/eventStore.js'
import { EventInteractionState } from './interactions/event-interaction-state.js'
import { SplittableProps } from './component/event-splitting.js'
import { mapHash } from './util/object.js'
import { CalendarContext } from './CalendarContext.js'
import { buildDateSpanApiWithContext } from './calendar-utils.js'
import { Constraint } from './structs/constraint.js'
import { expandRecurring } from './structs/recurring-event.js'
import { DateProfile } from './DateProfileGenerator.js'

// high-level segmenting-aware tester functions
// ------------------------------------------------------------------------------------------------------------------------

export function isInteractionValid(
  interaction: EventInteractionState,
  dateProfile: DateProfile,
  context: CalendarContext,
) {
  let { instances } = interaction.mutatedEvents
  for (let instanceId in instances) {
    if (!rangeContainsRange(dateProfile.validRange, instances[instanceId].range)) {
      return false
    }
  }
  return isNewPropsValid({ eventDrag: interaction }, context) // HACK: the eventDrag props is used for ALL interactions
}

export function isDateSelectionValid(
  dateSelection: DateSpan,
  dateProfile: DateProfile,
  context: CalendarContext,
) {
  if (!rangeContainsRange(dateProfile.validRange, dateSelection.range)) {
    return false
  }
  return isNewPropsValid({ dateSelection }, context)
}

function isNewPropsValid(newProps, context: CalendarContext) {
  let calendarState = context.getCurrentData()

  let props = {
    businessHours: calendarState.businessHours,
    dateSelection: '',
    eventStore: calendarState.eventStore,
    eventUiBases: calendarState.eventUiBases,
    eventSelection: '',
    eventDrag: null,
    eventResize: null,
    ...newProps,
  }

  return (context.pluginHooks.isPropsValid || isPropsValid)(props, context)
}

export function isPropsValid(state: SplittableProps, context: CalendarContext, dateSpanMeta = {}, filterConfig?): boolean {
  if (state.eventDrag && !isInteractionPropsValid(state, context, dateSpanMeta, filterConfig)) {
    return false
  }

  if (state.dateSelection && !isDateSelectionPropsValid(state, context, dateSpanMeta, filterConfig)) {
    return false
  }

  return true
}

// Moving Event Validation
// ------------------------------------------------------------------------------------------------------------------------

function isInteractionPropsValid(state: SplittableProps, context: CalendarContext, dateSpanMeta: any, filterConfig): boolean {
  let currentState = context.getCurrentData()
  let interaction = state.eventDrag // HACK: the eventDrag props is used for ALL interactions

  let subjectEventStore = interaction.mutatedEvents
  let subjectDefs = subjectEventStore.defs
  let subjectInstances = subjectEventStore.instances
  let subjectConfigs = compileEventUis(
    subjectDefs,
    interaction.isEvent ?
      state.eventUiBases :
      { '': currentState.selectionConfig }, // if not a real event, validate as a selection
  )

  if (filterConfig) {
    subjectConfigs = mapHash(subjectConfigs, filterConfig)
  }

  // exclude the subject events. TODO: exclude defs too?
  let otherEventStore = excludeInstances(state.eventStore, interaction.affectedEvents.instances)

  let otherDefs = otherEventStore.defs
  let otherInstances = otherEventStore.instances
  let otherConfigs = compileEventUis(otherDefs, state.eventUiBases)

  for (let subjectInstanceId in subjectInstances) {
    let subjectInstance = subjectInstances[subjectInstanceId]
    let subjectRange = subjectInstance.range
    let subjectConfig = subjectConfigs[subjectInstance.defId]
    let subjectDef = subjectDefs[subjectInstance.defId]

    // constraint
    if (!allConstraintsPass(subjectConfig.constraints, subjectRange, otherEventStore, state.businessHours, context)) {
      return false
    }

    // overlap

    let { eventOverlap } = context.options
    let eventOverlapFunc = typeof eventOverlap === 'function' ? eventOverlap : null

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

        if (eventOverlapFunc && !eventOverlapFunc(
          new EventImpl(context, otherDefs[otherInstance.defId], otherInstance), // still event
          new EventImpl(context, subjectDef, subjectInstance), // moving event
        )) {
          return false
        }
      }
    }

    // allow (a function)

    let calendarEventStore = currentState.eventStore // need global-to-calendar, not local to component (splittable)state

    for (let subjectAllow of subjectConfig.allows) {
      let subjectDateSpan: DateSpan = {
        ...dateSpanMeta,
        range: subjectInstance.range,
        allDay: subjectDef.allDay,
      }

      let origDef = calendarEventStore.defs[subjectDef.defId]
      let origInstance = calendarEventStore.instances[subjectInstanceId]
      let eventApi

      if (origDef) { // was previously in the calendar
        eventApi = new EventImpl(context, origDef, origInstance)
      } else { // was an external event
        eventApi = new EventImpl(context, subjectDef) // no instance, because had no dates
      }

      if (!subjectAllow(
        buildDateSpanApiWithContext(subjectDateSpan, context),
        eventApi,
      )) {
        return false
      }
    }
  }

  return true
}

// Date Selection Validation
// ------------------------------------------------------------------------------------------------------------------------

function isDateSelectionPropsValid(state: SplittableProps, context: CalendarContext, dateSpanMeta: any, filterConfig): boolean {
  let relevantEventStore = state.eventStore
  let relevantDefs = relevantEventStore.defs
  let relevantInstances = relevantEventStore.instances

  let selection = state.dateSelection
  let selectionRange = selection.range
  let { selectionConfig } = context.getCurrentData()

  if (filterConfig) {
    selectionConfig = filterConfig(selectionConfig)
  }

  // constraint
  if (!allConstraintsPass(selectionConfig.constraints, selectionRange, relevantEventStore, state.businessHours, context)) {
    return false
  }

  // overlap

  let { selectOverlap } = context.options
  let selectOverlapFunc = typeof selectOverlap === 'function' ? selectOverlap : null

  for (let relevantInstanceId in relevantInstances) {
    let relevantInstance = relevantInstances[relevantInstanceId]

    // intersect! evaluate
    if (rangesIntersect(selectionRange, relevantInstance.range)) {
      if (selectionConfig.overlap === false) {
        return false
      }

      if (selectOverlapFunc && !selectOverlapFunc(
        new EventImpl(context, relevantDefs[relevantInstance.defId], relevantInstance),
        null,
      )) {
        return false
      }
    }
  }

  // allow (a function)
  for (let selectionAllow of selectionConfig.allows) {
    let fullDateSpan = { ...dateSpanMeta, ...selection }

    if (!selectionAllow(
      buildDateSpanApiWithContext(fullDateSpan, context),
      null,
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
  context: CalendarContext,
): boolean {
  for (let constraint of constraints) {
    if (!anyRangesContainRange(
      constraintToRanges(constraint, subjectRange, otherEventStore, businessHoursUnexpanded, context),
      subjectRange,
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
  context: CalendarContext, // for expanding businesshours
): OpenDateRange[] {
  if (constraint === 'businessHours') {
    return eventStoreToRanges(
      expandRecurring(businessHoursUnexpanded, subjectRange, context),
    )
  }

  if (typeof constraint === 'string') { // an group ID
    return eventStoreToRanges(
      filterEventStoreDefs(otherEventStore, (eventDef) => eventDef.groupId === constraint),
    )
  }

  if (typeof constraint === 'object' && constraint) { // non-null object
    return eventStoreToRanges(
      expandRecurring(constraint, subjectRange, context),
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
