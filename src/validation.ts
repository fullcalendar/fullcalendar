import { EventStore, expandRecurring, filterEventStoreDefs, createEmptyEventStore, parseEvents } from './structs/event-store'
import Calendar from './Calendar'
import { DateSpan, buildDateSpanApi, DateSpanApi } from './structs/date-span'
import { rangeContainsRange, rangesIntersect, DateRange, OpenDateRange } from './datelib/date-range'
import EventApi from './api/EventApi'
import { EventUiHash } from './component/event-ui'
import { compileEventUis } from './component/event-rendering'
import { ValidationSplitterMeta } from './plugin-system'
import { excludeInstances } from './reducers/eventStore'
import { EventInput } from './structs/event'

// TODO: rename to "criteria" ?
export type ConstraintInput = 'businessHours' | string | EventInput | EventInput[]
export type Constraint = 'businessHours' | string | EventStore
export type OverlapFunc = ((stillEvent: EventApi, movingEvent: EventApi | null) => boolean)
export type AllowFunc = (span: DateSpanApi, movingEvent: EventApi | null) => boolean


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

    if (splitterMeta && !splitterMeta.eventAllowsKey(subjectDef, calendar, currentSegmentKey)) { // TODO: pass in EventUi
      return false
    }

    // constraint
    for (let subjectConstraint of subjectConfig.constraints) {

      if (!constraintPasses(subjectConstraint, subjectRange, otherEventStore, businessHoursUnexpanded, calendar)) {
        return false
      }

      if (splitterMeta && !splitterMeta.constraintAllowsKey(subjectConstraint, currentSegmentKey)) {
        return false
      }
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
        if (otherOverlap === false && !isntEvent) {
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
    for (let subjectAllow of subjectConfig.allows) {
      let origDef = relevantEventStore.defs[subjectDef.defId]
      let origInstance = relevantEventStore.instances[subjectInstanceId]

      let subjectDateSpan: DateSpan = Object.assign(
        {},
        splitterMeta ? splitterMeta.getDateSpanPropsForKey(currentSegmentKey) : {},
        { range: subjectInstance.range, allDay: subjectDef.allDay }
      )

      if (!subjectAllow(
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
  let relevantDefs = relevantEventStore.defs
  let relevantInstances = relevantEventStore.instances
  let selectionRange = selection.range
  let { selectionConfig } = calendar

  // constraint
  for (let selectionConstraint of selectionConfig.constraints) {

    if (!constraintPasses(selectionConstraint, selectionRange, relevantEventStore, businessHoursUnexpanded, calendar)) {
      return false
    }

    if (splitterMeta && !splitterMeta.constraintAllowsKey(selectionConstraint, currentSegmentKey)) {
      return false
    }
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

    let fullDateSpan = Object.assign(
      {},
      splitterMeta ? splitterMeta.getDateSpanPropsForKey(currentSegmentKey) : {},
      selection,
    )

    if (!selectionAllow(
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
    return eventStoreToRanges(
      expandRecurring(constraint, subjectRange, calendar)
    )
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
