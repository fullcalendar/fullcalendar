import { DateRange, rangesEqual, OpenDateRange, DateInput, DateEnv, Duration } from '@full-ui/headless-calendar'
import {
  addDurationToEdge, buildRangeEdgeOutput, buildValidInstanceRange, createEventInstance,
  EventInstanceRange, resolveEdgeInstantMs,
} from './event-instance'
import { parseEventDef, refineEventDef } from './event-parse'
import { EventRenderRange, compileEventUi } from '../component-util/event-rendering'
import { EventUiHash } from '../component-util/event-ui'
import { CalendarContext } from '../CalendarContext'
import { refineProps, identity, Identity } from '../options'

/*
A data-structure for a date-range that will be visually displayed.
Contains other metadata like allDay, and anything else Components might like to store.

TODO: in future, put otherProps in own object.
*/

export interface OpenDateSpanInput {
  start?: DateInput
  end?: DateInput
  allDay?: boolean
  [otherProp: string]: any
}

export interface DateSpanInput extends OpenDateSpanInput {
  start: DateInput
  end: DateInput
}

export interface OpenDateSpan {
  range: OpenDateRange
  allDay: boolean
  // Exact epoch instants, stamped by instant-aware views (e.g. timed timeline axes) when
  // producing hits/selections. Transient interaction data (event data persists its own
  // instants on EventInstanceRange, fed from parse/mutation; external drops copy the span's
  // start instant over). Needed because a DateMarker alone cannot distinguish repeated civil
  // times during a fall-back DST transition. When absent, derive via dateEnv.toDate()
  // (resolves ambiguity deterministically). See getDateSpanInstantStartMs/getDateSpanInstantEndMs.
  instantStartMs?: number
  instantEndMs?: number
  [otherProp: string]: any
}

export interface DateSpan extends OpenDateSpan {
  range: DateRange
}

export interface RangeApi {
  start: Date
  end: Date
  startStr: string
  endStr: string
}

export interface DateSpanApi extends RangeApi {
  allDay: boolean
}

export interface RangeApiWithTimeZone extends RangeApi {
  timeZone: string
}

export interface DatePointApi {
  date: Date
  dateStr: string
  allDay: boolean
}

const STANDARD_PROPS = {
  start: identity as Identity<DateInput>,
  end: identity as Identity<DateInput>,
  allDay: Boolean,
}

export function parseDateSpan(raw: DateSpanInput, dateEnv: DateEnv, defaultDuration?: Duration): DateSpan | null {
  let span = parseOpenDateSpan(raw, dateEnv)

  if (!span) {
    return null
  }

  let { range } = span

  if (!range.start) {
    return null
  }

  if (!range.end) {
    if (defaultDuration == null) {
      return null
    }

    const endEdge = addDurationToEdge(
      { marker: range.start, instantMs: span.instantStartMs },
      defaultDuration,
      dateEnv,
    )

    range.end = endEdge.marker

    if (endEdge.instantMs != null) {
      span.instantEndMs = endEdge.instantMs
    }
  }

  return span as DateSpan
}

/*
TODO: somehow combine with parseRange?
Will return null if the start/end props were present but parsed invalidly.
*/
export function parseOpenDateSpan(raw: OpenDateSpanInput, dateEnv: DateEnv): OpenDateSpan | null {
  let { refined: standardProps, extra } = refineProps(raw, STANDARD_PROPS)
  let startMeta = standardProps.start ? dateEnv.createMarkerMeta(standardProps.start) : null
  let endMeta = standardProps.end ? dateEnv.createMarkerMeta(standardProps.end) : null
  let { allDay } = standardProps

  if (allDay == null) {
    allDay = (startMeta && startMeta.isTimeUnspecified) &&
      (!endMeta || endMeta.isTimeUnspecified)
  }

  let range: OpenDateRange = {
    start: startMeta ? startMeta.marker : null,
    end: endMeta ? endMeta.marker : null,
  }

  if (!allDay && startMeta && endMeta && (startMeta.instantMs != null || endMeta.instantMs != null)) {
    const validRange = buildValidInstanceRange(
      { marker: startMeta.marker, instantMs: startMeta.instantMs },
      { marker: endMeta.marker, instantMs: endMeta.instantMs },
      dateEnv,
    )

    if (!validRange && startMeta.instantMs != null && endMeta.instantMs != null) {
      return null
    }

    if (validRange) {
      range = { start: validRange.start, end: validRange.end }
    }
  }

  const span: OpenDateSpan = {
    range,
    allDay,
    ...extra,
  }

  if (allDay) {
    delete span.instantStartMs
    delete span.instantEndMs
  } else {
    if (startMeta?.instantMs != null) {
      span.instantStartMs = startMeta.instantMs
    }
    if (endMeta?.instantMs != null) {
      span.instantEndMs = endMeta.instantMs
    }
  }

  return span
}

export function isDateSpansEqual(span0: DateSpan, span1: DateSpan): boolean {
  return rangesEqual(span0.range, span1.range) &&
    span0.allDay === span1.allDay &&
    isSpanPropsEqual(span0, span1)
}

// the NON-DATE-RELATED props
function isSpanPropsEqual(span0: DateSpan, span1: DateSpan): boolean {
  for (let propName in span1) {
    if (propName !== 'range' && propName !== 'allDay') {
      if (span0[propName] !== span1[propName]) {
        return false
      }
    }
  }

  // are there any props that span0 has that span1 DOESN'T have?
  // both have range/allDay, so no need to special-case.
  for (let propName in span0) {
    if (!(propName in span1)) {
      return false
    }
  }

  return true
}

export function buildDateSpanApi(span: DateSpan, dateEnv: DateEnv): DateSpanApi {
  return {
    ...buildRangeApi(span.range, dateEnv, span.allDay, span),
    allDay: span.allDay,
  }
}

export function buildRangeApiWithTimeZone(range: DateRange, dateEnv: DateEnv, omitTime?: boolean): RangeApiWithTimeZone {
  return {
    ...buildRangeApi(range, dateEnv, omitTime),
    timeZone: dateEnv.timeZone,
  }
}

export function buildRangeApi(range: DateRange, dateEnv: DateEnv, omitTime?: boolean, rangeMeta?: { instantStartMs?: number, instantEndMs?: number }): RangeApi {
  // exact instants may ride on a span (rangeMeta) or on the range itself
  const instantStartMs = rangeMeta?.instantStartMs ?? (range as EventInstanceRange).instantStartMs
  const instantEndMs = rangeMeta?.instantEndMs ?? (range as EventInstanceRange).instantEndMs
  const start = buildRangeEdgeOutput(range.start, instantStartMs, dateEnv, omitTime)
  const end = buildRangeEdgeOutput(range.end, instantEndMs, dateEnv, omitTime)

  return {
    start: start.date,
    end: end.date,
    startStr: start.dateStr,
    endStr: end.dateStr,
  }
}

export function getDateSpanInstantStartMs(dateSpan: DateSpan, dateEnv: DateEnv): number {
  return resolveEdgeInstantMs(dateSpan.range.start, dateSpan.instantStartMs, dateEnv)
}

export function getDateSpanInstantEndMs(dateSpan: DateSpan, dateEnv: DateEnv): number {
  return resolveEdgeInstantMs(dateSpan.range.end, dateSpan.instantEndMs, dateEnv)
}

export function fabricateEventRange(dateSpan: DateSpan, eventUiBases: EventUiHash, context: CalendarContext): EventRenderRange {
  let res = refineEventDef({ editable: false }, context)
  let def = parseEventDef(
    res.refined,
    res.extra,
    '', // sourceId
    dateSpan.allDay,
    true, // hasEnd
    context,
  )

  return {
    def,
    ui: compileEventUi(def, eventUiBases),
    instance: createEventInstance(def.defId, dateSpan.range),
    range: dateSpan.range,
    isStart: true,
    isEnd: true,
  }
}
