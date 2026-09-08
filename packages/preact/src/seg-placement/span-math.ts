/**
 * Pure lateral-span geometry shared by the seg-placement engine.
 *
 * A span is a half-open interval `[start, end)` on the lateral axis. The axis
 * can be discrete (DayGrid columns) or continuous (Timeline pixels). Exactly
 * adjacent spans never intersect.
 */

export interface LateralSpan {
  start: number
  end: number
}

export function doSpansIntersect(a: LateralSpan, b: LateralSpan): boolean {
  return a.start < b.end && b.start < a.end
}

/** Returns the strict intersection; exactly adjacent spans do not intersect. */
export function intersectSpans(a: LateralSpan, b: LateralSpan): LateralSpan | null {
  const start = Math.max(a.start, b.start)
  const end = Math.min(a.end, b.end)

  return start < end ? { start, end } : null
}

export function getSpanLength(span: LateralSpan): number {
  return span.end - span.start
}

/**
 * Finds every intersection within entries sorted by `start`. When the entries
 * are also pairwise non-intersecting, only the single entry before the lower
 * bound can straddle the span's start, so the scan begins one entry early.
 */
export function findIntersections<Item extends LateralSpan>(
  entries: readonly Item[],
  span: LateralSpan,
): Item[] {
  let index = findLowerBoundByStart(entries, span.start)
  if (index > 0) {
    index--
  }
  const matches: Item[] = []

  for (; index < entries.length; index++) {
    const entry = entries[index]
    if (entry.start >= span.end) {
      break
    }
    if (doSpansIntersect(entry, span)) {
      matches.push(entry)
    }
  }
  return matches
}

/**
 * Computes the coverage set difference `span - covered`. The covered spans
 * must be sorted by `start` and pairwise non-overlapping.
 */
export function subtractCoveredSpans(
  span: LateralSpan,
  covered: readonly LateralSpan[],
): LateralSpan[] {
  const result: LateralSpan[] = []
  let cursor = span.start

  for (const item of covered) {
    if (item.end <= cursor) {
      continue
    }
    if (item.start >= span.end) {
      break
    }
    if (item.start > cursor) {
      result.push({ start: cursor, end: Math.min(item.start, span.end) })
    }
    cursor = Math.max(cursor, item.end)
    if (cursor >= span.end) {
      break
    }
  }

  if (cursor < span.end) {
    result.push({ start: cursor, end: span.end })
  }
  return result
}

/** Maintains a sorted strict-overlap union; adjacent spans remain separate. */
export function addToUnion(spans: LateralSpan[], addition: LateralSpan): void {
  const result: LateralSpan[] = []
  let pending: LateralSpan = { ...addition }
  let inserted = false

  for (const span of spans) {
    if (span.end <= pending.start) {
      result.push(span)
    } else if (pending.end <= span.start) {
      if (!inserted) {
        result.push(pending)
        inserted = true
      }
      result.push(span)
    } else {
      pending = {
        start: Math.min(pending.start, span.start),
        end: Math.max(pending.end, span.end),
      }
    }
  }

  if (!inserted) {
    result.push(pending)
  }
  spans.splice(0, spans.length, ...result)
}

/** Preserves increasing lateral-start order within a sorted entry list. */
export function insertLaterally<Item extends LateralSpan>(
  entries: Item[],
  entry: Item,
): void {
  entries.splice(findLowerBoundByStart(entries, entry.start), 0, entry)
}

export function findLowerBoundByStart<Item extends { start: number }>(
  entries: readonly Item[],
  start: number,
): number {
  let low = 0
  let high = entries.length

  while (low < high) {
    const middle = (low + high) >>> 1
    if (entries[middle].start < start) {
      low = middle + 1
    } else {
      high = middle
    }
  }
  return low
}
