import { EventStore, expandRecurring, eventTupleToStore, filterEventStoreDefs, createEmptyEventStore } from './structs/event-store'
import Calendar from './Calendar'
import { DateSpan, parseOpenDateSpan, OpenDateSpanInput, OpenDateSpan, buildDateSpanApi, DateSpanApi } from './structs/date-span'
import { EventInstance, EventDef, EventTuple, parseEvent } from './structs/event'
import { rangeContainsRange, rangesIntersect, DateRange, OpenDateRange } from './datelib/date-range'
import EventApi from './api/EventApi'
import { EventUiHash } from './component/event-ui'
import { compileEventUis } from './component/event-rendering'
import { ValidationSplitterMeta } from './plugin-system'
import { excludeInstances } from './reducers/eventStore'

// TODO: rename to "criteria" ?
export type ConstraintInput = 'businessHours' | string | OpenDateSpanInput | { [timeOrRecurringProp: string]: any }
export type Constraint = 'businessHours' | string | OpenDateSpan | EventTuple
export type Overlap = boolean | ((stillEvent: EventApi, movingEvent: EventApi | null) => boolean)
export type Allow = (span: DateSpanApi, movingEvent: EventApi | null) => boolean


// high-level segmenting-aware tester functions
// ------------------------------------------------------------------------------------------------------------------------

export function isEventsValid(subjectEventStore: EventStore, calendar: Calendar, isntEvent?: boolean): boolean {
  let splitterMeta = calendar.pluginSystem.hooks.validationSplitter
  let relevantSegmentedProps = getRelevantSegmentedProps(calendar, splitterMeta)
  let subjectSegmentedProps = splitMinimalProps({
    eventStore: subjectEventStore,
    eventUiBases: isntEvent ? { '': calendar.selectionConfig } : calendar.eventUiBases,
  }, splitterMeta)

  for (let key in subjectSegmentedProps) {
    let subjectProps = subjectSegmentedProps[key]
    let relevantProps = relevantSegmentedProps[key]

    if (!isSegmentedEventsValid(
      subjectProps.eventStore,
      subjectProps.eventUiBases,
      relevantProps.eventStore,
      relevantProps.eventUiBases,
      relevantProps.businessHours,
      calendar,
      splitterMeta,
      key,
      isntEvent
    )) {
      return false
    }
  }

  return true
}

export function isSelectionValid(selection: DateSpan, calendar: Calendar): boolean {
  let splitterMeta = calendar.pluginSystem.hooks.validationSplitter
  let relevantSegmentedProps = getRelevantSegmentedProps(calendar, splitterMeta)
  let subjectSegmentedProps = splitMinimalProps({
    dateSelection: selection
  }, splitterMeta)

  for (let key in subjectSegmentedProps) {
    let subjectProps = subjectSegmentedProps[key]
    let relevantProps = relevantSegmentedProps[key]

    if (!isSegmentedSelectionValid(
      subjectProps.dateSelection,
      relevantProps.eventStore,
      relevantProps.businessHours,
      calendar,
      splitterMeta,
      key,
    )) {
      return false
    }
  }

  return true
}

// we have a different meaning of "relevant" here than other places of codebase
function getRelevantSegmentedProps(calendar: Calendar, splitterMeta: ValidationSplitterMeta) {
  let view = calendar.view // yuck

  return splitMinimalProps({
    eventStore: calendar.state.eventStore,
    eventUiBases: calendar.eventUiBases,
    businessHours: view ? view.props.businessHours : createEmptyEventStore() // yuck
  }, splitterMeta)
}


// insular tester functions
// ------------------------------------------------------------------------------------------------------------------------

function isSegmentedEventsValid(
  subjectEventStore: EventStore,
  subjectConfigBase: EventUiHash,
  relevantEventStore: EventStore, // include the original subject events
  relevantEventConfigBase: EventUiHash,
  businessHoursUnexpanded: EventStore,
  calendar: Calendar,
  splitterMeta: ValidationSplitterMeta | null,
  currentSegmentKey: string,
  isntEvent: boolean
): boolean {
  let subjectDefs = subjectEventStore.defs
  let subjectInstances = subjectEventStore.instances
  let subjectConfigs = compileEventUis(subjectDefs, subjectConfigBase)
  let otherEventStore = excludeInstances(relevantEventStore, subjectInstances) // exclude the subject events. TODO: exclude defs too?
  let otherDefs = otherEventStore.defs
  let otherInstances = otherEventStore.instances
  let otherConfigs = compileEventUis(otherDefs, relevantEventConfigBase)

  for (let subjectInstanceId in subjectInstances) {
    let subjectInstance = subjectInstances[subjectInstanceId]
    let subjectRange = subjectInstance.range
    let subjectConfig = subjectConfigs[subjectInstance.defId]
    let subjectDef = subjectDefs[subjectInstance.defId]
    let { constraints, overlaps, allows } = subjectConfig

    if (splitterMeta && !splitterMeta.eventAllowsKey(subjectDef, calendar, currentSegmentKey)) { // TODO: pass in EventUi
      return false
    }

    // constraint
    for (let constraint of constraints) {

      if (!constraintPasses(constraint, subjectRange, otherEventStore, businessHoursUnexpanded, calendar)) {
        return false
      }

      if (splitterMeta && !splitterMeta.constraintAllowsKey(constraint, currentSegmentKey)) {
        return false
      }
    }

    // overlap
    for (let otherInstanceId in otherInstances) {
      let otherInstance = otherInstances[otherInstanceId]
      let otherDef = otherDefs[otherInstance.defId]

      // intersect! evaluate
      if (rangesIntersect(subjectRange, otherInstance.range)) {
        let otherOverlaps = otherConfigs[otherInstance.defId].overlaps

        // consider the other event's overlap. only do this if the subject event is a "real" event
        if (!isntEvent && !allOverlapsPass(otherOverlaps, otherDef, otherInstance, subjectDef, subjectInstance, calendar)) {
          return false
        }

        if (!allOverlapsPass(overlaps, subjectDef, subjectInstance, otherDef, otherInstance, calendar)) {
          return false
        }
      }
    }

    // allow (a function)
    for (let allow of allows) {
      let origDef = relevantEventStore.defs[subjectDef.defId]
      let origInstance = relevantEventStore.instances[subjectInstanceId]

      let subjectDateSpan: DateSpan = Object.assign(
        {},
        splitterMeta ? splitterMeta.getDateSpanPropsForKey(currentSegmentKey) : {},
        { range: subjectInstance.range, allDay: subjectDef.allDay }
      )

      if (!allow(
        buildDateSpanApi(subjectDateSpan, calendar.dateEnv),
        new EventApi(calendar, origDef, origInstance)
      )) {
        return false
      }
    }

  }

  return true
}

function isSegmentedSelectionValid(
  selection: DateSpan,
  relevantEventStore: EventStore,
  businessHoursUnexpanded: EventStore,
  calendar: Calendar,
  splitterMeta: ValidationSplitterMeta | null,
  currentSegmentKey: string
): boolean {
  let relevantInstances = relevantEventStore.instances
  let relevantDefs = relevantEventStore.defs
  let selectionRange = selection.range
  let { constraints, overlaps, allows } = calendar.selectionConfig

  // constraint
  for (let constraint of constraints) {

    if (!constraintPasses(constraint, selectionRange, relevantEventStore, businessHoursUnexpanded, calendar)) {
      return false
    }

    if (splitterMeta && !splitterMeta.constraintAllowsKey(constraint, currentSegmentKey)) {
      return false
    }
  }

  // overlap
  for (let relevantInstanceId in relevantInstances) {
    let relevantInstance = relevantInstances[relevantInstanceId]
    let relevantDef = relevantDefs[relevantInstance.defId]

    // intersect! evaluate
    if (rangesIntersect(selectionRange, relevantInstance.range)) {

      if (!allOverlapsPass(overlaps, null, null, relevantDef, relevantInstance, calendar)) {
        return false
      }
    }
  }

  // allow (a function)
  for (let allow of allows) {

    let fullDateSpan = Object.assign(
      {},
      splitterMeta ? splitterMeta.getDateSpanPropsForKey(currentSegmentKey) : {},
      selection,
    )

    if (!allow(
      buildDateSpanApi(fullDateSpan, calendar.dateEnv),
      null
    )) {
      return false
    }
  }

  return true
}


// Constraint Utils
// ------------------------------------------------------------------------------------------------------------------------

function constraintPasses(
  constraint: Constraint,
  subjectRange: DateRange,
  otherEventStore: EventStore,
  businessHoursUnexpanded: EventStore,
  calendar: Calendar
) {
  return anyRangesContainRange(
    constraintToRanges(constraint, subjectRange, otherEventStore, businessHoursUnexpanded, calendar),
    subjectRange
  )
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

    if ((constraint as EventTuple).def) { // an event definition (actually, a tuple)
      return eventStoreToRanges(
        expandRecurring(eventTupleToStore(constraint as EventTuple), subjectRange, calendar)
      )

    } else {
      return [ (constraint as OpenDateSpan).range ] // an already-parsed datespan
    }
  }

  return []
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


// Overlap Utils
// ------------------------------------------------------------------------------------------------------------------------

function allOverlapsPass(
  overlaps: Overlap[],
  subjectDef: EventDef | null,
  subjectInstance: EventInstance | null,
  otherDef: EventDef,
  otherInstance: EventInstance,
  calendar: Calendar
) {
  for (let overlap of overlaps) {
    if (!overlapPasses(overlap, subjectDef, subjectInstance, otherDef, otherInstance, calendar)) {
      return false
    }
  }

  return true
}

function overlapPasses(
  overlap: Overlap,
  subjectDef: EventDef | null,
  subjectInstance: EventInstance | null,
  otherDef: EventDef,
  otherInstance: EventInstance,
  calendar: Calendar
) {
  if (overlap === false) {
    return false
  } else if (typeof overlap === 'function') {
    return !overlap(
      new EventApi(calendar, otherDef, otherInstance),
      subjectDef ? new EventApi(calendar, subjectDef, subjectInstance) : null
    )
  }

  return true
}


// Splitting Utils
// ------------------------------------------------------------------------------------------------------------------------

interface MinimalSplittableProps {
  dateSelection?: DateSpan
  businessHours?: EventStore
  eventStore?: EventStore
  eventUiBases?: EventUiHash
}

function splitMinimalProps(
  inputProps: MinimalSplittableProps,
  splitterMeta: ValidationSplitterMeta | null
): { [key: string]: MinimalSplittableProps } {

  if (splitterMeta) {
    let splitter = new splitterMeta.splitterClass()

    return splitter.splitProps({
      businessHours: inputProps.businessHours || createEmptyEventStore(),
      dateSelection: inputProps.dateSelection || null,
      eventStore: inputProps.eventStore || createEmptyEventStore(),
      eventUiBases: inputProps.eventUiBases || {},
      eventSelection: '',
      eventDrag: null,
      eventResize: null
    })
  } else {
    return { '': inputProps }
  }
}


// Parsing
// ------------------------------------------------------------------------------------------------------------------------

export function normalizeConstraint(input: ConstraintInput, calendar: Calendar): Constraint | null {
  if (typeof input === 'object' && input) { // non-null object
    let span = parseOpenDateSpan(input, calendar.dateEnv)

    if (span === null || span.range.start || span.range.end) {
      return span
    } else { // if completely-open range, assume it's a recurring event (prolly with startTime/endTime)
      return parseEvent(input, '', calendar)
    }

  } else if (input != null) {
    return String(input)
  } else {
    return null
  }
}
