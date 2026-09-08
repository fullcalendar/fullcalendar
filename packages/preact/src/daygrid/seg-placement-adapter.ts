import {
  DEFAULT_UNMEASURED_EVENT_THICKNESS,
  type Slice,
  type SliceLayout,
  buildLevelLimitedLayout,
  buildPixelLimitedLayout,
  compareByEventOrder,
  getSliceKey,
  sortByEventOrder,
} from '../seg-placement/kernel'
import { flatMapArray } from '../util/array'
import {
  type DayRowEventRange,
  type DayRowEventRangePart,
  getDayGridSegKey,
} from './TableSeg'

export type DayGridEventSeg = DayRowEventRange

/**
 * A production seg satisfying the kernel's seg requirements directly: its
 * column-unit lateral geometry already matches, so only identity is added.
 */
export type DayGridSourceSeg = DayGridEventSeg & {
  key: string
  orderIndex: number
}

export interface DayGridPlacementColumn {
  /** Exact kernel slices whose DOM wrappers start in this column. */
  renderSlices: Slice<DayGridSourceSeg>[]
  /** Deepest visible slice bottom crossing this column. */
  contentHeight: number
  /** Every source crossing this column, cut for more-link APIs. */
  segs: DayRowEventRangePart[]
  /** Hidden source membership projected from the kernel's hidden slices. */
  hiddenSegs: DayRowEventRangePart[]
}

interface DayGridPlacementLayout {
  columns: DayGridPlacementColumn[]
  /** Positioned slice tops keyed by DayGrid's event-part convention. */
  sliceCoords: ReadonlyMap<string, number>
}

/**
 * Which measured route a row takes, resolved from the two max options.
 *
 * `auto` reproduces production's precedence exactly: a boolean `true` on
 * either option wins over a number on the other one.
 */
type DayGridPlacementMode =
  | 'unlimited'
  | 'maxEvents'
  | 'maxEventRows'
  | 'auto'

const DEFAULT_UNMEASURED_EVENT_AREA_HEIGHT = 150

/** Initial DOM candidate frontier, before any measurement can widen it. */
export const DEFAULT_LEVEL_CAPACITY = estimateLevelCapacity(
  DEFAULT_UNMEASURED_EVENT_AREA_HEIGHT,
  DEFAULT_UNMEASURED_EVENT_THICKNESS,
)

/** Converts sorted production ranges into the shared source vocabulary. */
export function buildDayGridSegSources(
  eventOrderedSegs: readonly DayGridEventSeg[],
): DayGridSourceSeg[] {
  return eventOrderedSegs.map((seg, orderIndex) => ({
    ...seg,
    key: getDayGridSegKey(seg),
    orderIndex,
  }))
}

/**
 * Builds an immediately renderable kernel layout for unlimited and numeric
 * DayGrid modes. Boolean-auto uses the pixel-limited adapter below.
 */
export function buildDayGridLevelPlacements(
  eventOrderedSegs: readonly DayGridEventSeg[],
  maxLevels: number,
  moreLinkLevelTax: number,
  orderStrict: boolean,
  eventSlicing: boolean,
  columnCount: number,
  sliceHeights: ReadonlyMap<string, number>,
): DayGridPlacementLayout {
  const sourceSegs = buildDayGridSegSources(eventOrderedSegs)
  const layout = buildLevelLimitedLayout(
    sourceSegs,
    orderStrict,
    eventSlicing,
    maxLevels,
    moreLinkLevelTax,
    sliceHeights,
  )
  return buildDayGridPlacementLayout(
    sourceSegs,
    layout,
    sliceHeights,
    columnCount,
  )
}

/** Builds the boolean-auto DayGrid route with a real pixel ceiling. */
export function buildDayGridPixelPlacements(
  eventOrderedSegs: readonly DayGridEventSeg[],
  orderStrict: boolean,
  eventSlicing: boolean,
  columnCount: number,
  canvasHeight: number | undefined,
  moreLinkHeight: number | undefined,
  levelCapacity: number,
  sliceHeights: ReadonlyMap<string, number>,
): DayGridPlacementLayout {
  const sourceSegs = buildDayGridSegSources(eventOrderedSegs)
  const layout = buildPixelLimitedLayout(
    sourceSegs,
    orderStrict,
    eventSlicing,
    sliceHeights,
    canvasHeight,
    levelCapacity,
    moreLinkHeight,
  )
  return buildDayGridPlacementLayout(
    sourceSegs,
    layout,
    sliceHeights,
    columnCount,
  )
}

/** Projects ordered sources and event-ordered hidden slices into one cell. */
export function buildDayGridPopoverSegs(
  eventOrderedSegs: readonly DayGridSourceSeg[],
  hiddenSlices: readonly Slice<DayGridSourceSeg>[],
  column: number,
): {
  segs: DayRowEventRangePart[]
  hiddenSegs: DayRowEventRangePart[]
} {
  return {
    segs: flatMapArray(eventOrderedSegs, (source) =>
      cutSegToColumn(source, column) ?? [],
    ),
    hiddenSegs: flatMapArray(hiddenSlices, (slice) =>
      cutSegToColumn(slice.sourceSeg, column, slice) ?? [],
    ),
  }
}

/**
 * Projects one complete source onto a column when its relevant span intersects.
 *
 * The optional span lets a hidden slice control membership while real event
 * boundaries still control whether the projected entry reports "continues."
 */
function cutSegToColumn(
  source: DayGridSourceSeg,
  column: number,
  intersectionSpan: { start: number, end: number } = source,
): DayRowEventRangePart | null {
  if (
    intersectionSpan.start >= column + 1 ||
    column >= intersectionSpan.end
  ) return null

  const { key, orderIndex, ...seg } = source
  return {
    ...seg,
    start: column,
    end: column + 1,
    isStart: seg.isStart && source.start === column,
    isEnd: seg.isEnd && source.end - 1 === column,
  }
}

/**
 * Resolves which measured route a row takes from the two max options.
 *
 * This is the single definition of production's option precedence: a boolean
 * `true` on either option means auto, and only then does a number on either
 * one apply, `dayMaxEvents` first.
 */
export function resolveDayGridPlacementMode(
  dayMaxEvents: boolean | number | undefined,
  dayMaxEventRows: boolean | number | undefined,
): DayGridPlacementMode {
  if (dayMaxEvents === true || dayMaxEventRows === true) {
    return 'auto'
  }
  if (typeof dayMaxEvents === 'number') {
    return 'maxEvents'
  }
  if (typeof dayMaxEventRows === 'number') {
    return 'maxEventRows'
  }
  return 'unlimited'
}

/**
 * Computes the dimensionless DOM frontier from an already-resolved mode,
 * without applying more-link tax. Numeric limits own their explicit cap;
 * unlimited rows mount all sources; boolean-auto rows consume their row-local
 * observed frontier.
 */
export function computeDayGridDomCandidateMaxLevels(
  mode: DayGridPlacementMode,
  dayMaxEvents: boolean | number | undefined,
  dayMaxEventRows: boolean | number | undefined,
  maxDomLevels: number,
): number {
  switch (mode) {
    case 'auto': return maxDomLevels
    case 'maxEvents': return dayMaxEvents as number
    case 'maxEventRows': return dayMaxEventRows as number
    default: return Infinity
  }
}

/**
 * Logical levels an active more link charges its column. Only `dayMaxEventRows`
 * counts the link as one of its rows.
 */
export function computeDayGridMoreLinkLevelTax(mode: DayGridPlacementMode): number {
  return mode === 'maxEventRows' ? 1 : 0
}

function buildDayGridPlacementLayout(
  sourceSegs: readonly DayGridSourceSeg[],
  layout: SliceLayout<DayGridSourceSeg>,
  sliceHeights: ReadonlyMap<string, number>,
  columnCount: number,
): DayGridPlacementLayout {
  const {
    hiddenSlices,
    renderSlices,
    sliceCoords,
  } = layout
  const eventOrderedHiddenSlices = sortByEventOrder(hiddenSlices)
  const slicesByStart = federateSlicesByStart(renderSlices, columnCount)
  const columns = Array.from(
    { length: columnCount },
    (_, column): DayGridPlacementColumn => ({
      // Freshly built per column by federateSlicesByStart; owned outright.
      renderSlices: slicesByStart[column],
      contentHeight: 0,
      ...buildDayGridPopoverSegs(
        sourceSegs,
        eventOrderedHiddenSlices,
        column,
      ),
    }),
  )

  // A mounted slice is visible exactly when it has a coordinate; a coordinate
  // in turn guarantees a measurement.
  for (const slice of renderSlices) {
    const key = getSliceKey(slice)
    const sliceTop = sliceCoords.get(key)

    if (sliceTop === undefined) {
      continue
    }
    const sliceBottom = sliceTop + sliceHeights.get(key)!

    for (let column = slice.start; column < slice.end; column += 1) {
      columns[column].contentHeight = Math.max(
        columns[column].contentHeight,
        sliceBottom,
      )
    }
  }

  return {
    columns,
    sliceCoords,
  }
}

function federateSlicesByStart(
  renderSlices: readonly Slice<DayGridSourceSeg>[],
  columnCount: number,
): Slice<DayGridSourceSeg>[][] {
  const slicesByStart = Array.from(
    { length: columnCount },
    () => [] as Slice<DayGridSourceSeg>[],
  )

  for (const slice of renderSlices) {
    slicesByStart[slice.start].push(slice)
  }

  for (const slices of slicesByStart) {
    slices.sort(compareByEventOrder)
  }

  return slicesByStart
}

export function estimateLevelCapacity(eventAreaHeight: number, eventHeight: number): number {
  return Math.max(1, Math.ceil(eventAreaHeight / eventHeight))
}
