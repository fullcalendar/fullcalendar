import {
  DateRange, OpenDateRange, DateEnv, DateMarker, Duration,
  asRoughMs, addMs, buildIsoString, rangesIntersect, rangeContainsRange,
} from '@full-ui/headless-calendar'
import { guid } from '../util/misc'

/*
A DateRange whose edges optionally remember the exact epoch instant they came from.
A DateMarker alone cannot distinguish repeated civil times during a DST fall-back
transition, so inputs that expressed an exact instant (ISO with offset, Date, epoch ms)
stamp it here. When absent, resolve via dateEnv.toDate() (deterministic first occurrence).

Invariants: `start < end` civilly, ALWAYS. A start marker always agrees with its stored
instant. An end marker does too, with ONE sanctioned exception: a real range that a
fall-back fold civilly compresses stores its exact end instant with the end marker
re-expressed in the start's UTC-offset reading (start marker + real duration), so the civil
range stays ordered (see buildValidInstanceRange). The stored end instant therefore always
takes precedence over the marker for exact time — resolve via getRangeInstantEndMs, never
by re-deriving from the marker.
*/
export interface EventInstanceRange extends DateRange {
  instantStartMs?: number
  instantEndMs?: number
}

/*
The canonical way to construct an EventInstanceRange. Pass undefined for an edge's
instant when the input didn't express one or the edge's marker was derived civilly —
the property is omitted entirely (never stored as an undefined-valued key).
*/
export function buildEventInstanceRange(
  start: Date,
  end: Date,
  instantStartMs?: number,
  instantEndMs?: number,
): EventInstanceRange {
  const range: EventInstanceRange = { start, end }

  if (instantStartMs != null) {
    range.instantStartMs = instantStartMs
  }
  if (instantEndMs != null) {
    range.instantEndMs = instantEndMs
  }

  return range
}

// one edge of an EventInstanceRange, for building/transforming ranges edge-by-edge
export interface EventRangeEdge {
  marker: Date
  instantMs?: number
}

export interface RangeEdgeOutput {
  marker: DateMarker
  date: Date // the exact epoch instant
  dateStr: string
}

// Resolves an edge to its real instant, choosing the deterministic first occurrence when
// the marker is ambiguous and the edge does not carry an exact instant.
export function resolveEdgeInstantMs(marker: DateMarker, instantMs: number | undefined, dateEnv: DateEnv): number {
  return instantMs ?? dateEnv.toDate(marker).valueOf()
}

/*
Builds every outward-facing representation of a range edge from one policy. Exact timed
edges use their true instant and its canonical wall-clock marker; civil/all-day edges keep
the supplied marker and DateEnv conversion.
*/
export function buildRangeEdgeOutput(
  marker: DateMarker,
  instantMs: number | undefined,
  dateEnv: DateEnv,
  omitTime?: boolean,
): RangeEdgeOutput {
  const canonicalMarker = instantMs != null ? dateEnv.timestampToMarker(instantMs) : marker
  const timeZoneOffset = instantMs != null
    ? Math.round((canonicalMarker.valueOf() - instantMs) / 60000)
    : dateEnv.offsetForMarker(marker)

  if (!omitTime && instantMs != null) {
    return {
      marker: canonicalMarker,
      date: new Date(instantMs),
      dateStr: buildIsoString(canonicalMarker, timeZoneOffset),
    }
  }

  return {
    marker: canonicalMarker,
    date: dateEnv.toDate(marker),
    dateStr: omitTime
      ? dateEnv.formatIso(marker, { omitTime })
      : buildIsoString(marker, timeZoneOffset),
  }
}

// the exact epoch instant of a range's start: the stored instant when present, otherwise
// deterministic first-occurrence resolution of the civil marker
export function getRangeInstantStartMs(range: EventInstanceRange, dateEnv: DateEnv): number {
  return resolveEdgeInstantMs(range.start, range.instantStartMs, dateEnv)
}

export function getRangeInstantEndMs(range: EventInstanceRange, dateEnv: DateEnv): number {
  return resolveEdgeInstantMs(range.end, range.instantEndMs, dateEnv)
}

// The canonical civil end: recomputed from the exact instant for fold-compressed ranges.
export function canonicalRangeEndMarker(range: EventInstanceRange, dateEnv: DateEnv): Date {
  return range.instantEndMs != null ? dateEnv.timestampToMarker(range.instantEndMs) : range.end
}

function rangeHasInstants(range: EventInstanceRange): boolean {
  return range.instantStartMs != null || range.instantEndMs != null
}

/*
Like rangesIntersect, but exact: when either range carries stored instants, real instants
are compared (a fold-compressed end's representational marker would otherwise falsely
collide with the other occurrence's civil times). Pure-civil pairs compare markers, as before.
*/
export function instanceRangesIntersect(
  range0: EventInstanceRange,
  range1: EventInstanceRange,
  dateEnv: DateEnv,
): boolean {
  if (rangeHasInstants(range0) || rangeHasInstants(range1)) {
    return getRangeInstantStartMs(range0, dateEnv) < getRangeInstantEndMs(range1, dateEnv) &&
      getRangeInstantEndMs(range0, dateEnv) > getRangeInstantStartMs(range1, dateEnv)
  }

  return rangesIntersect(range0, range1)
}

/*
Like rangeContainsRange, but exact in the same way as instanceRangesIntersect.
The outer range may be open-ended.
*/
export function instanceRangeContainsRange(
  outerRange: OpenDateRange & { instantStartMs?: number, instantEndMs?: number },
  innerRange: EventInstanceRange,
  dateEnv: DateEnv,
): boolean {
  if (rangeHasInstants(outerRange as EventInstanceRange) || rangeHasInstants(innerRange)) {
    const outerStartMs = outerRange.start != null ?
      resolveEdgeInstantMs(outerRange.start, outerRange.instantStartMs, dateEnv) :
      -Infinity
    const outerEndMs = outerRange.end != null ?
      resolveEdgeInstantMs(outerRange.end, outerRange.instantEndMs, dateEnv) :
      Infinity

    return outerStartMs <= getRangeInstantStartMs(innerRange, dateEnv) &&
      outerEndMs >= getRangeInstantEndMs(innerRange, dateEnv)
  }

  return rangeContainsRange(outerRange, innerRange)
}

/*
Adds a positive duration to a start edge, deriving an END edge.
When the edge carries an exact instant and the duration is pure clock-time, the addition
happens in instant space (exact real elapsed time) and the result carries an instant too.
If a fall-back fold keeps the resulting canonical marker from advancing past the edge's own
marker, the result uses the edge's UTC-offset reading instead (the sanctioned
instant/marker disagreement — see EventInstanceRange). Calendar-unit durations and
instant-less edges use civil arithmetic (no instant).
*/
export function addDurationToEdge(edge: EventRangeEdge, duration: Duration, dateEnv: DateEnv): EventRangeEdge {
  if (edge.instantMs != null && !duration.years && !duration.months && !duration.days) {
    const durMs = asRoughMs(duration)
    const instantMs = edge.instantMs + durMs
    const marker = dateEnv.timestampToMarker(instantMs)

    return marker > edge.marker
      ? { marker, instantMs }
      : { marker: addMs(edge.marker, durMs), instantMs }
  }

  return { marker: dateEnv.add(edge.marker, duration) }
}

/*
Builds a civilly-ordered EventInstanceRange from two edges, or null when the range is
invalid: pure-civil edges are invalid unless the end marker is after the start marker;
when either edge carries an exact instant, REAL-time order is the truth instead.
A real range that a DST fall-back fold civilly compresses (instants ordered, markers not)
is not discarded: its end marker is re-expressed in the start's UTC-offset reading
(start marker + real duration), keeping the exact end instant.
*/
export function buildValidInstanceRange(
  start: EventRangeEdge,
  end: EventRangeEdge,
  dateEnv: DateEnv,
): EventInstanceRange | null {
  if (start.instantMs == null && end.instantMs == null) {
    return end.marker > start.marker
      ? buildEventInstanceRange(start.marker, end.marker)
      : null
  }

  const startMs = resolveEdgeInstantMs(start.marker, start.instantMs, dateEnv)
  const endMs = resolveEdgeInstantMs(end.marker, end.instantMs, dateEnv)

  if (endMs <= startMs) {
    return null
  }

  return buildEventInstanceRange(
    start.marker,
    end.marker > start.marker
      ? end.marker
      : addMs(start.marker, endMs - startMs), // fold-compressed: start's offset reading
    start.instantMs,
    end.instantMs,
  )
}

export interface EventInstance {
  instanceId: string
  defId: string
  range: EventInstanceRange
}

export type EventInstanceHash = { [instanceId: string]: EventInstance }

export function createEventInstance(
  defId: string,
  range: EventInstanceRange,
): EventInstance {
  return {
    instanceId: guid(),
    defId,
    range,
  }
}
