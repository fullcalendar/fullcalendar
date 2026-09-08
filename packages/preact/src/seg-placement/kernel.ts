/**
 * Pure event-positioning kernel implementing measured logical repacking.
 *
 * Source segs own identity and event order. Slices own only lateral geometry,
 * while their outer array index is their dimensionless level. Limiting stays
 * primarily in logical slice-level space; the pixel path admits speculative
 * slices only through occupied logical territory, then monotonically prunes
 * the measured result against exact pixel and more-link boundaries.
 */

import { flatArray } from '../util/array'
import {
  type LateralSpan,
  addToUnion,
  findIntersections,
  getSpanLength,
  insertLaterally,
  intersectSpans,
  subtractCoveredSpans,
} from './span-math'

/** Permissive epsilon for geometric coordinate and budget comparisons. */
export const GEOMETRY_TOLERANCE = 0.000_001

/** Shared estimate for an event wrapper that has not reported a thickness. */
export const DEFAULT_UNMEASURED_EVENT_THICKNESS = 20

/** Shared estimate for a more-link wrapper that has not reported a thickness. */
export const DEFAULT_UNMEASURED_MORE_LINK_THICKNESS = 20

/**
 * What the kernel requires of a seg. Adapters satisfy it with the production
 * seg itself (DayGrid) or a projected copy of it carrying pixel geometry
 * (Timeline, TimeGrid) — never a wrapper around one.
 */
export interface SourceSeg extends LateralSpan {
  /** Stable whole-source key. Partial-slice keys derive from it (getSliceKey). */
  key: string
  isStart: boolean
  isEnd: boolean
  orderIndex: number
}

export interface Slice<S extends SourceSeg = SourceSeg> extends LateralSpan {
  sourceSeg: S
  isStart: boolean
  isEnd: boolean
}

/**
 * One independently rendered more link and the hidden slices it represents.
 * Members are in event order, one entry per hidden source, each spanning the
 * lateral hull of that source's hidden fragments so components can derive
 * start/end continuity from its coordinates.
 */
export interface HiddenSliceGroup<S extends SourceSeg = SourceSeg> extends LateralSpan {
  /** `getSliceKey(hiddenSlices[0])`; changes if the group's first slice changes. */
  key: string
  hiddenSlices: Slice<S>[]
}

/* ========================================================================
 * Top-level layout entry points
 * ===================================================================== */

/** What every layout entry point returns, level-limited or pixel-limited. */
export interface SliceLayout<S extends SourceSeg = SourceSeg> {
  /** Every slice to mount, including invisible donors; order has no meaning. */
  renderSlices: Slice<S>[]
  /** Exact hidden membership; order has no meaning. */
  hiddenSlices: Slice<S>[]
  /** Laterally sorted logical levels used as the coordinate spatial index. */
  sliceLevels: Slice<S>[][]
  /** A mounted slice is visible exactly when its key has a coordinate here. */
  sliceCoords: Map<string, number>
  /**
   * Whether every render slice has a measurement, making this layout a fixed
   * point of the current heights: rerunning with the same inputs reproduces
   * it. Measurements themselves may still be re-reported later.
   */
  isSettled: boolean
}

/**
 * Streams at most `maxLevels` into the initial structure and fires every
 * rejected slice back at those levels in event order.
 *
 * With slicing disabled, a failed slice hides whole. With slicing enabled,
 * every level independently offers its maximal free runs and the winning plan
 * balances exposed length against fragmentation. Every hidden slice grows a
 * coverage accumulator; with a level tax, only newly covered runs reserve the
 * bottom event level for a more link, evicting any slice already there.
 */
export function buildLevelLimitedLayout<S extends SourceSeg>(
  segs: readonly S[],
  eventOrderStrict: boolean,
  eventSlicing: boolean,
  maxLevels: number,
  moreLinkLevelTax: number,
  sliceHeights: ReadonlyMap<string, number>,
): SliceLayout<S> {
  const { segLevels, excludedSegs } = buildSegLevels(
    segs,
    eventOrderStrict,
    maxLevels,
  )
  const placement = placeExtraSlicesInLevels(
    convertSegLevelsToWholeSlices(segLevels),
    convertSegsToWholeSlices(excludedSegs),
    eventOrderStrict,
    eventSlicing,
    moreLinkLevelTax,
  )
  const resolution = resolveLevelCoords(
    placement.sliceLevels,
    sliceHeights,
  )
  return {
    renderSlices: flatArray(placement.sliceLevels),
    hiddenSlices: placement.hiddenSlices,
    sliceLevels: placement.sliceLevels,
    sliceCoords: resolution.sliceCoords,
    isSettled: resolution.isSettled,
  }
}

/**
 * Resolves the bounded whole-slice frontier, then offers excluded slices back
 * to its occupied logical territory through slicing. Exact pixel pruning hides
 * any measured result that crosses the canvas or an existing more-link band.
 * Placement-only slices remain mounted as invisible measurement donors until
 * measured, preventing mount-measure cycles.
 *
 * `levelCapacity` bounds the initial DOM whole-slice candidates; later
 * slices begin hidden and unmeasured.
 */
export function buildPixelLimitedLayout<S extends SourceSeg>(
  segs: readonly S[],
  eventOrderStrict: boolean,
  eventSlicing: boolean,
  sliceHeights: ReadonlyMap<string, number>,
  canvasHeight: number | undefined,
  levelCapacity: number,
  moreLinkHeight: number | undefined,
): SliceLayout<S> {
  const { segLevels, excludedSegs } = buildSegLevels(
    segs,
    eventOrderStrict,
    levelCapacity,
  )
  const domWholeSliceLevels = convertSegLevelsToWholeSlices(segLevels)
  const domExcludedWholeSlices = convertSegsToWholeSlices(excludedSegs)
  const wholeResolution = resolveLevelCoords(
    domWholeSliceLevels,
    sliceHeights,
    canvasHeight,
  )

  // Until the canvas and the link probe report a size, mount only the bounded
  // whole-slice frontier so its measurements can arrive.
  if (canvasHeight == null || moreLinkHeight == null) {
    return {
      renderSlices: flatArray(domWholeSliceLevels),
      hiddenSlices: domExcludedWholeSlices,
      sliceLevels: domWholeSliceLevels,
      sliceCoords: wholeResolution.sliceCoords,
      isSettled: wholeResolution.isSettled,
    }
  }

  // Pending frontier wholes stay out of links until measured; beyond-frontier
  // wholes are definite logical exclusions and hide without measurement.
  const excludedWholeSlices = wholeResolution.excludedSlices.concat(domExcludedWholeSlices)
  excludedWholeSlices.sort(compareByEventOrder)

  // With slicing, the level tax punches link holes while preserving event
  // remainders; otherwise measured pruning makes the smarter pixel choice.
  const placement = placeExtraSlicesInLevels(
    wholeResolution.placementSliceLevels,
    excludedWholeSlices,
    eventOrderStrict,
    eventSlicing,
    /* moreLinkLevelTax = */ eventSlicing ? 1 : 0,
    /* requiresSlicing = */ true,
    /* taxDeepestOccupiedLevel = */ true,
  )
  const sliceResolution = resolveLevelCoords(
    placement.sliceLevels,
    sliceHeights,
  )

  // More links always render. When one consumes the full budget or more, zero
  // is the deepest coordinate an intersecting event may reach.
  const moreLinkEventMax = Math.max(0, canvasHeight - moreLinkHeight)

  // Remove exact canvas and more-link overflows from the coordinated layout.
  const pixelPrunedSlices = prunePixelLimitedSliceLevels(
    placement.sliceLevels,
    placement.hiddenSlices,
    sliceResolution.sliceCoords,
    sliceHeights,
    canvasHeight,
    moreLinkEventMax,
  )

  // Keep all frontier wholes and placement-added slices mounted as measurement
  // donors; missing coordinates make rejected or pending slices invisible.
  // Disjoint: requiresSlicing bars whole re-insertion, so every added slice is
  // a freshly cut object, never a frontier whole.
  const renderSlices = flatArray(domWholeSliceLevels).concat(placement.addedSlices)

  // Frontier wholes resolve in the whole pass and every placement-added slice
  // resolves in the placement pass, so together the two cover the render set.
  const isSettled = wholeResolution.isSettled && sliceResolution.isSettled

  return {
    renderSlices,
    hiddenSlices: pixelPrunedSlices.concat(placement.hiddenSlices),
    sliceLevels: placement.sliceLevels,
    sliceCoords: sliceResolution.sliceCoords,
    isSettled,
  }
}

/* ========================================================================
 * Whole-source level construction
 * ===================================================================== */

/** Builds whole-source logical levels without consulting any dimensions. */
export function buildSegLevels<S extends SourceSeg>(
  segs: readonly S[],
  eventOrderStrict: boolean,
  maxLevels: number = Infinity,
): {
  segLevels: S[][]
  excludedSegs: S[]
} {
  const segLevels: S[][] = []
  const excludedSegs: S[] = []

  for (const seg of segs) {
    const levelIndex = findPackedLevelIndex(segLevels, seg, eventOrderStrict)

    if (levelIndex >= maxLevels) {
      excludedSegs.push(seg)
    } else {
      while (segLevels.length <= levelIndex) {
        segLevels.push([])
      }
      insertLaterally(segLevels[levelIndex], seg)
    }
  }

  return { segLevels, excludedSegs }
}

/**
 * The packed level a span belongs to: the shallowest vacant level, or with
 * gap reuse forbidden, directly below the deepest intersecting occupant.
 * `levels.length` means a new level must open.
 */
function findPackedLevelIndex(
  levels: readonly (readonly LateralSpan[])[],
  span: LateralSpan,
  orderStrict: boolean,
): number {
  let levelIndex = 0

  if (orderStrict) {
    for (let i = 0; i < levels.length; i++) {
      if (findIntersections(levels[i], span).length) {
        levelIndex = i + 1
      }
    }
  } else {
    while (
      levelIndex < levels.length &&
      findIntersections(levels[levelIndex], span).length
    ) {
      levelIndex++
    }
  }

  return levelIndex
}

export function convertSegLevelsToWholeSlices<S extends SourceSeg>(
  segLevels: readonly (readonly S[])[],
): Slice<S>[][] {
  return segLevels.map((level) => convertSegsToWholeSlices(level))
}

export function convertSegsToWholeSlices<S extends SourceSeg>(
  segs: readonly S[],
): Slice<S>[] {
  return segs.map(createWholeSlice)
}

/* ========================================================================
 * Slice-level coordinate resolution
 * ===================================================================== */

/**
 * Resolves fixed logical levels without changing the input or its slices.
 * An unmeasured slice leaves the resolution unsettled; a measured bounded
 * rejection is final. Neither blocks later traversal entries, so excluding a
 * lower slice can let a later slice move upward. The returned placement
 * structure re-levels the admitted slices from scratch, compacted around
 * pending and excluded slices exactly like the coordinates. Each admitted
 * slice files below every admitted slice it intersects — never into a
 * shallower gap — so level order mirrors pixel stacking and strict input
 * order survives without consulting it.
 */
export function resolveLevelCoords<S extends SourceSeg>(
  sliceLevels: readonly (readonly Slice<S>[])[],
  sliceHeights: ReadonlyMap<string, number>,
  maxPixels: number = Infinity,
): {
  placementSliceLevels: Slice<S>[][]
  sliceCoords: Map<string, number>
  isSettled: boolean
  excludedSlices: Slice<S>[]
} {
  const placementSliceLevels: Slice<S>[][] = []
  const sliceCoords = new Map<string, number>()
  let isSettled = true
  const excludedSlices: Slice<S>[] = []

  for (let levelIndex = 0; levelIndex < sliceLevels.length; levelIndex++) {
    for (const slice of sliceLevels[levelIndex]) {
      const sliceHeight = sliceHeights.get(getSliceKey(slice))
      if (sliceHeight === undefined) {
        isSettled = false
        continue
      }

      const {
        bottom: levelCoord,
        levelIndex: packedLevelIndex,
      } = computeLateralSpanPlacement(
        placementSliceLevels,
        slice,
        sliceCoords,
        sliceHeights,
      )

      if (
        levelCoord + sliceHeight <=
          maxPixels + GEOMETRY_TOLERANCE
      ) {
        // Repacking admitted slices merges levels, so keep lateral sort.
        while (placementSliceLevels.length <= packedLevelIndex) {
          placementSliceLevels.push([])
        }
        insertLaterally(placementSliceLevels[packedLevelIndex], slice)
        sliceCoords.set(getSliceKey(slice), levelCoord)
      } else {
        excludedSlices.push(slice)
      }
    }
  }

  return { placementSliceLevels, sliceCoords, isSettled, excludedSlices }
}

/** Deepest measured, coordinated bottom and level among slices touching the span. */
export function computeLateralSpanPlacement<S extends SourceSeg>(
  sliceLevels: readonly (readonly Slice<S>[])[],
  span: LateralSpan,
  sliceCoords: ReadonlyMap<string, number>,
  sliceHeights: ReadonlyMap<string, number>,
): { bottom: number; levelIndex: number } {
  let bottom = 0
  let levelIndex = 0

  for (let i = 0; i < sliceLevels.length; i++) {
    const level = sliceLevels[i]
    for (const slice of findIntersections(level, span)) {
      const key = getSliceKey(slice)
      const sliceTop = sliceCoords.get(key)
      const sliceHeight = sliceHeights.get(key)
      if (sliceTop !== undefined && sliceHeight !== undefined) {
        bottom = Math.max(bottom, sliceTop + sliceHeight)
        levelIndex = i + 1
      }
    }
  }

  return { bottom, levelIndex }
}

/** Deepest measured, coordinated bottom among slices touching the span. */
export function computeLateralSpanBottom<S extends SourceSeg>(
  sliceLevels: readonly (readonly Slice<S>[])[],
  span: LateralSpan,
  sliceCoords: ReadonlyMap<string, number>,
  sliceHeights: ReadonlyMap<string, number>,
): number {
  return computeLateralSpanPlacement(
    sliceLevels,
    span,
    sliceCoords,
    sliceHeights,
  ).bottom
}

/** Recomputes every coordinated slice against the compacted visible set. */
function recomputeVisibleCoords<S extends SourceSeg>(
  sliceLevels: readonly (readonly Slice<S>[])[],
  sliceHeights: ReadonlyMap<string, number>,
  sliceCoords: Map<string, number>,
): void {
  const visibleLevels = sliceLevels.map((level) =>
    level.filter((slice) => sliceCoords.has(getSliceKey(slice))),
  )
  const freshCoords = resolveLevelCoords(visibleLevels, sliceHeights).sliceCoords

  for (const [key, coord] of freshCoords) {
    sliceCoords.set(key, coord)
  }
}

/** Returns a measured slice's bottom, or `undefined` while it is pending. */
function getSliceBottom<S extends SourceSeg>(
  slice: Slice<S>,
  sliceCoords: ReadonlyMap<string, number>,
  sliceHeights: ReadonlyMap<string, number>,
): number | undefined {
  const key = getSliceKey(slice)
  const coord = sliceCoords.get(key)
  const height = sliceHeights.get(key)

  return coord === undefined || height === undefined
    ? undefined
    : coord + height
}

/**
 * Monotonically removes measured slices that cross either the canvas boundary
 * or an active more-link boundary. Hiding a slice grows the more-link coverage;
 * only newly covered spans are fired through the remaining slices, so every
 * removal can expose more link-band intruders without reconsidering old spans.
 *
 * SIDE EFFECT: mutates `sliceCoords`. A removed coordinate is the renderer's
 * signal that the still-mounted slice is invisible. After every removal,
 * surviving coordinates are resolved again so later queue entries are tested
 * against the compacted pixel structure. Slices without a proposed coordinate
 * are ignored. Existing hidden slices seed the more-link coverage before the
 * first removal is considered.
 *
 * Returns the slices whose coordinates this pass removed, with no ordering
 * guarantee.
 */
export function prunePixelLimitedSliceLevels<S extends SourceSeg>(
  sliceLevels: readonly (readonly Slice<S>[])[],
  initialHiddenSlices: readonly Slice<S>[],
  sliceCoords: Map<string, number>,
  sliceHeights: ReadonlyMap<string, number>,
  maxPixelHeight: number,
  moreLinkMaxPixelHeight: number,
): Slice<S>[] {
  const moreLinkGroups: RawHiddenGroup<S>[] = []
  const pixelPrunedSlices: Slice<S>[] = []
  const sliceHideQueue: Slice<S>[] = []
  let sliceHideIndex = 0

  // Build the more-link coverage already established by logical placement.
  for (const hiddenSlice of initialHiddenSlices) {
    addHiddenSliceToGroups(moreLinkGroups, hiddenSlice)
  }

  // Seed the queue with canvas overflows and existing more-link intruders.
  enqueueViolators()

  // A head index preserves FIFO without shift()'s O(n) reindexing; pop() is LIFO.
  while (sliceHideIndex < sliceHideQueue.length) {
    const slice = sliceHideQueue[sliceHideIndex++]
    const sliceBottom = getSliceBottom(slice, sliceCoords, sliceHeights)

    // A missing coordinate means a prior queue entry already processed it, and
    // compaction from earlier removals can make a queued slice compliant again.
    if (
      sliceBottom === undefined ||
      !violatesPixelBoundary(slice, sliceBottom)
    ) {
      continue
    }

    // Removing the coordinate hides the still-mounted slice. The shared
    // coordinate primitive then compacts later visible slices around it.
    sliceCoords.delete(getSliceKey(slice))

    pixelPrunedSlices.push(slice)
    const newMoreLinkSpans = addHiddenSliceToGroups(moreLinkGroups, slice)
    recomputeVisibleCoords(sliceLevels, sliceHeights, sliceCoords)

    for (const newMoreLinkSpan of newMoreLinkSpans) {
      enqueueViolators(newMoreLinkSpan)
    }
  }

  return pixelPrunedSlices

  /** Whether a measured bottom crosses the canvas or an intersecting link band. */
  function violatesPixelBoundary(slice: Slice<S>, sliceBottom: number): boolean {
    return sliceBottom > maxPixelHeight + GEOMETRY_TOLERANCE ||
      (
        sliceBottom > moreLinkMaxPixelHeight + GEOMETRY_TOLERANCE &&
        findIntersections(moreLinkGroups, slice).length > 0
      )
  }

  /** Queues every measured violator, or only those touching one span. */
  function enqueueViolators(withinSpan?: LateralSpan): void {
    for (const level of sliceLevels) {
      const candidates = withinSpan
        ? findIntersections(level, withinSpan)
        : level

      for (const slice of candidates) {
        const sliceBottom = getSliceBottom(slice, sliceCoords, sliceHeights)
        if (
          sliceBottom !== undefined &&
          violatesPixelBoundary(slice, sliceBottom)
        ) {
          sliceHideQueue.push(slice)
        }
      }
    }
  }
}

/* ========================================================================
 * Logical slice placement
 * ===================================================================== */

/** Live logical state consulted when placing a whole slice or slice plan. */
interface SlicePlacementState<S extends SourceSeg> {
  levels: readonly (readonly Slice<S>[])[]
  moreLinkReservations: readonly LevelSpan[]
  eventOrderStrict: boolean
}

/** More-link coverage and the shallowest level it makes unavailable. */
interface LevelSpan extends LateralSpan {
  levelIndex: number
}

export interface ExtraSlicePlacement<S extends SourceSeg> {
  /** Final logical topology, hidden slices excluded. */
  sliceLevels: Slice<S>[][]
  /** Flat hidden membership, with no ordering guarantee. */
  hiddenSlices: Slice<S>[]
  /** Slices in the final topology that were not in the received levels. */
  addedSlices: Slice<S>[]
}

/** Work alternates between attempting slices and reserving bottom link space. */
type PlacementWork<S extends SourceSeg> =
  | { type: 'fire', slice: Slice<S>, requiresSlicing: boolean }
  | { type: 'moreLink', span: LateralSpan }

/**
 * Fires event-ordered extras into a fixed set of logical levels. Repacking may
 * reuse gaps in the received levels but never creates additional levels.
 * By default, a more-link tax reserves the globally final level. Pixel flows
 * can instead reserve the deepest occupied level local to each link span and
 * require initial extras to expose some hidden coverage before admission.
 *
 * PRECONDITION: `extraSlices` is sorted by event order.
 *
 * SIDE EFFECT: mutates `sliceLevels`; callers transfer ownership of its outer
 * array and level arrays to this placement operation.
 */
export function placeExtraSlicesInLevels<S extends SourceSeg>(
  sliceLevels: Slice<S>[][],
  extraSlices: readonly Slice<S>[],
  eventOrderStrict: boolean,
  eventSlicing: boolean,
  moreLinkLevelTax: number,
  /** Whether initial extras must leave hidden coverage before admission. */
  requiresSlicing: boolean = false,
  /** Whether each link taxes its deepest locally occupied level. */
  taxDeepestOccupiedLevel: boolean = false,
): ExtraSlicePlacement<S> {
  const addedSliceSet = new Set<Slice<S>>()

  // Hidden membership remains flat for whole-layout operations. More-link
  // groups duplicate that membership locally while also recording which
  // lateral territory has already fired its link tax.
  const hiddenSlices: Slice<S>[] = []
  const moreLinkGroups: RawHiddenGroup<S>[] = []
  const moreLinkReservations: LevelSpan[] = []
  const placementState: SlicePlacementState<S> = {
    levels: sliceLevels,
    moreLinkReservations,
    eventOrderStrict,
  }

  const work: PlacementWork<S>[] = []

  pushFire(extraSlices, requiresSlicing)

  // LIFO runs newly created link reservations before older unrelated extras,
  // so an extra cannot insert into space that a fresh reservation will claim.
  while (work.length) {
    const item = work.pop()!
    if (item.type === 'fire') {
      fire(item.slice, item.requiresSlicing)
    } else {
      fireMoreLink(item.span)
    }
  }

  return {
    sliceLevels,
    hiddenSlices,
    addedSlices: [...addedSliceSet],
  }

  /** Tries an allowed whole insertion before scored same-level slice plans. */
  function fire(slice: Slice<S>, requiresSlicing: boolean): void {
    if (!requiresSlicing) {
      const levelIndex = findInsertionLevel(slice, placementState)

      if (levelIndex !== null) {
        insertLaterally(sliceLevels[levelIndex], slice)
        addedSliceSet.add(slice)
        return
      }
    }
    if (!eventSlicing) {
      hide(slice)
      return
    }

    const plan = findBestSlicePlan(slice, placementState, requiresSlicing)
    if (!plan) {
      hide(slice)
      return
    }

    for (const visibleSlice of plan.slices) {
      insertLaterally(sliceLevels[plan.levelIndex], visibleSlice)
      addedSliceSet.add(visibleSlice)
    }
    for (const hiddenSlice of subtractSpansFromSlice(slice, plan.slices)) {
      hide(hiddenSlice)
    }
  }

  /** Adds hidden membership and fires links only over new accumulator coverage. */
  function hide(slice: Slice<S>): void {
    hiddenSlices.push(slice)

    // Only the set difference is fresh more-link territory; it can consist of
    // several disjoint runs.
    const newMoreLinkSpans = addHiddenSliceToGroups(moreLinkGroups, slice)

    if (moreLinkLevelTax) {
      for (let i = newMoreLinkSpans.length - 1; i >= 0; i--) {
        work.push({ type: 'moreLink', span: newMoreLinkSpans[i] })
      }
    }
  }

  /**
   * Reserves one logical level over fresh accumulator coverage. The ordinary
   * flow taxes the final level; span-local mode taxes the deepest level with
   * an intersecting occupant, ignoring unrelated deeper territory.
   */
  function fireMoreLink(span: LateralSpan): void {
    if (!sliceLevels.length) {
      return
    }

    let taxedLevelIndex = sliceLevels.length - 1
    let victims = findIntersections(sliceLevels[taxedLevelIndex], span)

    if (taxDeepestOccupiedLevel) {
      while (!victims.length && taxedLevelIndex > 0) {
        taxedLevelIndex--
        victims = findIntersections(sliceLevels[taxedLevelIndex], span)
      }
    }

    insertLaterally(moreLinkReservations, {
      ...span,
      levelIndex: taxedLevelIndex,
    })
    const taxedLevel = sliceLevels[taxedLevelIndex]

    for (const victim of victims) {
      taxedLevel.splice(taxedLevel.indexOf(victim), 1)
      addedSliceSet.delete(victim)

      if (eventSlicing) {
        hide(intersectSlice(victim, span)!)
        // The remainder has already satisfied the slicing requirement.
        pushFire(subtractSpansFromSlice(victim, [span]), false)
      } else {
        hide(victim)
      }
    }
  }

  /** Reversing preserves received order on the LIFO work stack. */
  function pushFire(
    slices: readonly Slice<S>[],
    requiresSlicing: boolean,
  ): void {
    for (let i = slices.length - 1; i >= 0; i--) {
      work.push({ type: 'fire', slice: slices[i], requiresSlicing })
    }
  }
}

/** Returns the shallowest vacant level within the slice's fence, if any. */
function findInsertionLevel<S extends SourceSeg>(
  slice: Slice<S>,
  state: SlicePlacementState<S>,
): number | null {
  const fence = computeLevelFence(slice, state)

  for (
    let levelIndex = fence.min;
    levelIndex < fence.maxExclusive;
    levelIndex++
  ) {
    if (!findIntersections(state.levels[levelIndex], slice).length) {
      return levelIndex
    }
  }
  return null
}

/**
 * The level range where a slice may legally sit. The bottom reservation
 * closes its taxed level and everything deeper over link coverage; strict
 * event order additionally fences against intersecting neighbors' order.
 *
 * The pre-kernel SegHierarchy needed no upper fence: it inserted everything
 * in event order, so "stay below anything you touch" sufficed. Repacking
 * fires rejected extras after later-ordered slices are already committed,
 * which is what makes strict order two-sided here.
 */
function computeLevelFence<S extends SourceSeg>(
  slice: Slice<S>,
  state: SlicePlacementState<S>,
): { min: number, maxExclusive: number } {
  const { levels } = state
  let min = 0
  let maxExclusive = levels.length

  for (const reservation of findIntersections(
    state.moreLinkReservations,
    slice,
  )) {
    maxExclusive = Math.min(maxExclusive, reservation.levelIndex)
  }

  if (state.eventOrderStrict) {
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      for (const other of findIntersections(levels[levelIndex], slice)) {
        if (other.sourceSeg.orderIndex < slice.sourceSeg.orderIndex) {
          min = Math.max(min, levelIndex + 1)
        } else if (other.sourceSeg.orderIndex > slice.sourceSeg.orderIndex) {
          maxExclusive = Math.min(maxExclusive, levelIndex)
        }
      }
    }
  }

  return { min, maxExclusive }
}

/* ========================================================================
 * Slice plans
 * ===================================================================== */

const MAX_SLICES_PER_PLAN = 3
const EXTRA_SLICE_PENALTY = 0.15

/** One hypothetical sliced insertion, confined to a single logical level. */
interface SlicePlan<S extends SourceSeg> {
  levelIndex: number
  slices: Slice<S>[]
  score: number
}

/**
 * Scores the best one-, two-, or three-run insertion offered by each level.
 * Runs from different levels are deliberately never mixed into one plan.
 */
function findBestSlicePlan<S extends SourceSeg>(
  slice: Slice<S>,
  state: SlicePlacementState<S>,
  requiresSlicing: boolean,
): SlicePlan<S> | null {
  let selected: SlicePlan<S> | null = null
  const sourceLength = getSpanLength(slice)

  for (let levelIndex = 0; levelIndex < state.levels.length; levelIndex++) {
    // findIntersections returns a fresh, start-sorted array, and addToUnion
    // replaces array contents without ever mutating a member, so link
    // reservations can be folded in without touching the actual level.
    const blockers: LateralSpan[] = findIntersections(
      state.levels[levelIndex],
      slice,
    )
    for (const reservation of state.moreLinkReservations) {
      if (levelIndex >= reservation.levelIndex) {
        addToUnion(blockers, reservation)
      }
    }

    const runs = subtractSpansFromSlice(slice, blockers)
      .filter((run) => isWithinLevelFence(run, levelIndex, state))
      .sort((a, b) => getSpanLength(b) - getSpanLength(a) || a.start - b.start)
    let visibleLength = 0

    for (
      let sliceCount = 1;
      sliceCount <= Math.min(MAX_SLICES_PER_PLAN, runs.length);
      sliceCount++
    ) {
      visibleLength += getSpanLength(runs[sliceCount - 1])

      // Full exposure leaves no hidden coverage, and visible length only
      // grows with more runs, so no longer plan can satisfy slicing either.
      if (
        requiresSlicing &&
        visibleLength >= sourceLength - GEOMETRY_TOLERANCE
      ) {
        break
      }

      const candidate: SlicePlan<S> = {
        levelIndex,
        slices: runs.slice(0, sliceCount),
        score: visibleLength / sourceLength -
          EXTRA_SLICE_PENALTY * (sliceCount - 1),
      }
      if (isBetterSlicePlan(candidate, selected)) {
        selected = candidate
      }
    }
  }

  if (selected) {
    selected.slices.sort(compareByEventOrder)
  }

  return selected
}

/** Whether a slice may legally sit at this level, per its own fence. */
function isWithinLevelFence<S extends SourceSeg>(
  slice: Slice<S>,
  levelIndex: number,
  state: SlicePlacementState<S>,
): boolean {
  const fence = computeLevelFence(slice, state)

  return levelIndex >= fence.min && levelIndex < fence.maxExclusive
}

/** Comparison: score, then less fragmentation, then the shallower level. */
function isBetterSlicePlan<S extends SourceSeg>(
  candidate: SlicePlan<S>,
  current: SlicePlan<S> | null,
): boolean {
  if (!current || candidate.score > current.score) {
    return true
  }
  if (candidate.score < current.score) {
    return false
  }
  if (candidate.slices.length !== current.slices.length) {
    return candidate.slices.length < current.slices.length
  }
  return candidate.levelIndex < current.levelIndex
}

/* ========================================================================
 * More-link groups
 * ===================================================================== */

/**
 * Internal accumulator group: a maximal strict-intersection component of
 * hidden slices, which can hold several fragments of one source. Sorted
 * group lists double as coverage sets for span geometry.
 */
interface RawHiddenGroup<S extends SourceSeg> extends LateralSpan {
  /** Event-ordered so same-source fragments form runs for final merging. */
  hiddenSlices: Slice<S>[]
}

/**
 * Merges strict lateral intersections into groups sorted by lateral start.
 * Each group's hidden slices are event-ordered.
 */
export function groupLaterallyIntersecting<S extends SourceSeg>(
  hiddenSlices: readonly Slice<S>[],
): HiddenSliceGroup<S>[] {
  const groups: RawHiddenGroup<S>[] = []

  for (const slice of hiddenSlices) {
    addHiddenSliceToGroups(groups, slice)
  }

  return finalizeHiddenGroups(groups)
}

/**
 * Adds one hidden slice to its strict-intersection component and returns only
 * the newly covered spans. Exactly adjacent groups deliberately stay separate
 * because each group corresponds to one independently rendered more link.
 * The group list remains sorted by lateral start.
 */
function addHiddenSliceToGroups<S extends SourceSeg>(
  groups: RawHiddenGroup<S>[],
  slice: Slice<S>,
): LateralSpan[] {
  const newSpans = subtractCoveredSpans(slice, groups)
  const untouchedGroups: RawHiddenGroup<S>[] = []
  const mergedSlices: Slice<S>[] = [slice]
  let start = slice.start
  let end = slice.end

  for (const group of groups) {
    if (intersectSpans(group, slice)) {
      mergedSlices.push(...group.hiddenSlices)
      start = Math.min(start, group.start)
      end = Math.max(end, group.end)
    } else {
      untouchedGroups.push(group)
    }
  }

  mergedSlices.sort(compareByEventOrder)
  insertLaterally(untouchedGroups, {
    start,
    end,
    hiddenSlices: mergedSlices,
  })
  groups.splice(0, groups.length, ...untouchedGroups)

  return newSpans
}

/**
 * Compiles internal accumulator groups for components: one entry per hidden
 * source event, in event order, spanning that source's fragment hull.
 */
function finalizeHiddenGroups<S extends SourceSeg>(
  groups: readonly RawHiddenGroup<S>[],
): HiddenSliceGroup<S>[] {
  return groups.map((group) => {
    const hiddenSlices = mergeAdjacentSlices(group.hiddenSlices)

    return {
      key: getSliceKey(hiddenSlices[0]),
      start: group.start,
      end: group.end,
      hiddenSlices,
    }
  })
}

/* ========================================================================
 * Slice utilities
 * ===================================================================== */

/**
 * Identifies a whole or partial slice derived from a source seg. Partial keys
 * deliberately omit the lateral end so a fragment re-cut at the same start
 * keeps its DOM wrapper. The re-cut fragment transiently reuses the previous
 * cut's measurement, which can mis-prune one pass; the structure still settles
 * because every fragment cut depends only on logical geometry — the same
 * wrapper just re-reports at its new width and the next pass corrects the
 * decision.
 */
export function getSliceKey<S extends SourceSeg>(slice: Slice<S>): string {
  if (!isPartialSlice(slice)) {
    return slice.sourceSeg.key
  }
  return `${slice.sourceSeg.key}:${slice.start}:slice`
}

export function isPartialSlice<S extends SourceSeg>(slice: Slice<S>): boolean {
  return slice.start !== slice.sourceSeg.start ||
    slice.end !== slice.sourceSeg.end
}

export function compareByEventOrder<S extends SourceSeg>(
  a: Slice<S>,
  b: Slice<S>,
): number {
  return a.sourceSeg.orderIndex - b.sourceSeg.orderIndex ||
    a.start - b.start ||
    b.end - a.end // longer events first
}

export function sortByEventOrder<S extends SourceSeg>(
  slices: readonly Slice<S>[],
): Slice<S>[] {
  return [...slices].sort(compareByEventOrder)
}

/** Orders by axis start, then resolved event order. */
export function compareByAxisOrder<T extends {
  start: number
  sourceSeg: { orderIndex: number }
}>(a: T, b: T): number {
  return a.start - b.start ||
    a.sourceSeg.orderIndex - b.sourceSeg.orderIndex
}

export function sortByAxisOrder<T extends {
  start: number
  sourceSeg: { orderIndex: number }
}>(items: readonly T[]): T[] {
  return [...items].sort(compareByAxisOrder)
}

/**
 * Collapses same-source runs of an event-ordered slice list into one slice
 * per run spanning the run's lateral hull. The hull can bridge territory
 * where the source is actually visible; consumers derive start/end
 * continuity from the outermost hidden edges, not exact hidden coverage.
 */
function mergeAdjacentSlices<S extends SourceSeg>(
  slices: readonly Slice<S>[],
): Slice<S>[] {
  const merged: Slice<S>[] = []

  for (const slice of slices) {
    const previous = merged[merged.length - 1]

    if (previous && previous.sourceSeg === slice.sourceSeg) {
      merged[merged.length - 1] = createNarrowerSlice(
        createWholeSlice(previous.sourceSeg),
        previous.start,
        Math.max(previous.end, slice.end),
      )
    } else {
      merged.push(slice)
    }
  }
  return merged
}

/**
 * Removes covered spans from a slice, returning identity-preserving
 * remainders. Like `subtractCoveredSpans`, the covered spans must be sorted
 * by start and pairwise non-overlapping — every caller already holds them
 * that way (plan slices, union blockers, a single span).
 */
function subtractSpansFromSlice<S extends SourceSeg>(
  slice: Slice<S>,
  covered: readonly LateralSpan[],
): Slice<S>[] {
  return subtractCoveredSpans(slice, covered).map((span) =>
    createNarrowerSlice(slice, span.start, span.end),
  )
}

/** Finds the strict intersection while retaining source identity. */
function intersectSlice<S extends SourceSeg>(
  slice: Slice<S>,
  barrier: LateralSpan,
): Slice<S> | null {
  const intersection = intersectSpans(slice, barrier)

  return intersection
    ? createNarrowerSlice(slice, intersection.start, intersection.end)
    : null
}

function createWholeSlice<S extends SourceSeg>(
  sourceSeg: S,
): Slice<S> {
  return {
    sourceSeg,
    start: sourceSeg.start,
    end: sourceSeg.end,
    isStart: sourceSeg.isStart,
    isEnd: sourceSeg.isEnd,
  }
}

function createNarrowerSlice<S extends SourceSeg>(
  parent: Slice<S>,
  start: number,
  end: number,
): Slice<S> {
  return {
    sourceSeg: parent.sourceSeg,
    start,
    end,
    isStart: parent.isStart && start === parent.start,
    isEnd: parent.isEnd && end === parent.end,
  }
}
