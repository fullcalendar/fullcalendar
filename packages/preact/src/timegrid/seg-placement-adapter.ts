import { DateMarker } from '@full-ui/headless-calendar'
import { type EventRangeProps } from '../component-util/event-rendering'
import { DateProfile } from '../DateProfileGenerator'
import {
  type HiddenSliceGroup,
  type SourceSeg,
  buildSegLevels,
  convertSegsToWholeSlices,
  groupLaterallyIntersecting,
  sortByAxisOrder,
} from '../seg-placement/kernel'
import { findIntersections } from '../seg-placement/span-math'
import { flatArray } from '../util/array'
import { computeDateTopFrac } from './components/util'
import { type TimeGridRange } from './TimeColsSeg'

export type TimeGridEventSeg = TimeGridRange & EventRangeProps

/**
 * A projected copy of a production seg satisfying the kernel's seg
 * requirements: the seg's own fields plus identity and its vertical pixel span
 * (the production seg carries only dates).
 */
type TimeGridSourceSeg = TimeGridEventSeg & {
  key: string
  start: number
  end: number
  orderIndex: number
}

/** One seg's final pixel geometry down the time axis. */
export interface TimeGridSegVertical {
  start: number // pixels
  end: number // pixels
  size: number // pixels
  isShort: boolean
}

/**
 * Projects production's date range onto the slat canvas.
 *
 * This is TimeGrid's production-specific coordinate conversion: it owns hidden
 * days, DST, and `eventMinHeight`. The shared engine consumes only the numbers
 * it produces.
 *
 * The canvas height may be assumed rather than measured — callers substitute
 * `ESTIMATED_SLAT_HEIGHT` so the first paint contains events — in which case
 * they also pass no `eventMinHeight`. A null height still yields no verticals,
 * but no production caller passes one.
 */
export function computeFgSegVerticals(
  segs: TimeGridRange[],
  dateProfile: DateProfile,
  colDate: DateMarker,
  slatCnt: number,
  slatHeight: number | undefined, // in pixels
  eventMinHeight: number | undefined, // in pixels
  eventShortHeight: number, // in pixels
): TimeGridSegVertical[] {
  const res: TimeGridSegVertical[] = []

  if (slatHeight != null) {
    const totalHeight = slatHeight * slatCnt

    for (const seg of segs) {
      const startFrac = computeDateTopFrac(seg.startDate, dateProfile, colDate)
      const endFrac = computeDateTopFrac(seg.endDate, dateProfile, colDate)
      const startCoord = startFrac * totalHeight
      let endCoord = endFrac * totalHeight
      let height = endCoord - startCoord

      if (eventMinHeight != null && height < eventMinHeight) {
        height = eventMinHeight
        endCoord = startCoord + height
      }

      res.push({
        start: startCoord,
        end: endCoord,
        size: height,
        isShort: height <= eventShortHeight,
      })
    }
  }

  return res
}

/** One admitted production seg with its normalized horizontal geometry. */
export interface TimeGridSegPlacement {
  seg: TimeGridEventSeg
  segVertical: TimeGridSegVertical
  levelCoord: number
  thickness: number
  stackDepth: number
  stackForward: number
}

/** One maximal intersecting pixel span of rejected production segs. */
export interface TimeGridSegHiddenGroup {
  key: string
  start: number
  end: number
  segs: TimeGridEventSeg[]
}

/** Production-facing output for one TimeGrid day or resource column. */
export interface TimeGridSegPlacementResult {
  /** Admitted segs in temporal-start then resolved-event-order DOM order. */
  placements: TimeGridSegPlacement[]
  /** Overlay more-link data in vertical pixel coordinates. */
  hiddenGroups: TimeGridSegHiddenGroup[]
}

/**
 * Adapts production TimeGrid segs to and from the shared placement engine.
 *
 * The caller owns vertical geometry: `segVerticals` already incorporates
 * clipping, and `eventMinHeight` too once the slat height is measured — the
 * caller withholds that floor while the height is only assumed. Any missing
 * entry is excluded. The engine owns only admission and normalized horizontal
 * placement. `slotEventOverlap` remains a final CSS concern, and mirrors
 * deliberately stay outside this normal-event admission path.
 */
export function buildTimeGridSegPlacements(
  segs: TimeGridEventSeg[],
  segVerticals: TimeGridSegVertical[],
  eventOrderStrict?: boolean,
  eventMaxStack?: number,
): TimeGridSegPlacementResult {
  const sourceSegs: TimeGridSourceSeg[] = []
  const segVerticalBySeg = new Map<TimeGridEventSeg, TimeGridSegVertical>()

  for (let orderIndex = 0; orderIndex < segs.length; orderIndex += 1) {
    const seg = segs[orderIndex]
    const segVertical = segVerticals[orderIndex]

    if (segVertical) {
      const sourceSeg: TimeGridSourceSeg = {
        ...seg,
        key: seg.eventRange.instance.instanceId,
        start: segVertical.start,
        end: segVertical.end,
        orderIndex,
      }
      sourceSegs.push(sourceSeg)
      segVerticalBySeg.set(sourceSeg, segVertical)
    }
  }

  const layout = layoutTimeGridColumnByMaxLevel(
    sourceSegs,
    eventMaxStack ?? Infinity,
    { orderStrict: eventOrderStrict ?? false },
  )

  return {
    placements: layout.domOrderedPlacements.map((placement) => {
      const seg = placement.sourceSeg
      return {
        seg,
        segVertical: segVerticalBySeg.get(seg)!,
        levelCoord: placement.levelCoord,
        thickness: placement.thickness,
        stackDepth: placement.backwardDepth,
        stackForward: placement.forwardDepth,
      }
    }),
    hiddenGroups: layout.moreLinkGroups.map((group) => {
      const groupSegs = group.hiddenSlices.map((slice) => slice.sourceSeg)
      return {
        key: group.key,
        start: group.start,
        end: group.end,
        segs: groupSegs,
      }
    }),
  }
}

/** TimeGrid policies that affect dimensionless level construction. */
interface TimeGridLayoutOptions {
  /** Preserves the caller's resolved event priority through all collisions. */
  orderStrict: boolean
}

/** One visible source with its normalized collision-web geometry. */
interface TimeGridPlacement<S extends SourceSeg = SourceSeg> {
  sourceSeg: S
  start: number
  end: number
  isStart: boolean
  isEnd: boolean
  /** Dimensionless kernel level, also the placement's collision-web depth. */
  levelIndex: number
  /** Normalized final geometry, replacing the deleted unit-height currency. */
  levelCoord: number
  thickness: number
  levelEndCoord: number
  /** Longest visible collision chain extending backward from this placement. */
  backwardDepth: number
  /** Longest visible collision chain extending forward from this placement. */
  forwardDepth: number
}

/** Complete reusable output needed to render one TimeGrid column. */
interface TimeGridColumnLayout<S extends SourceSeg = SourceSeg> {
  /** Final visible placements in temporal-start/event-order. */
  domOrderedPlacements: TimeGridPlacement<S>[]
  /** Tax-free overlay links formed only after level admission has completed. */
  moreLinkGroups: HiddenSliceGroup<S>[]
}

/**
 * Builds, limits, and expands one TimeGrid day/resource column.
 *
 * TimeGrid rotates the visual meaning of the shared kernel's level structure.
 * A seg's lateral span runs down the time axis, while logical levels proceed
 * across the column. The retained levels become a normalized collision web:
 * connected components get equal base columns, and events widen through empty
 * deeper columns until their first collider.
 */
function layoutTimeGridColumnByMaxLevel<S extends SourceSeg>(
  eventOrderedSegs: readonly S[],
  maxLevels: number,
  options: TimeGridLayoutOptions,
): TimeGridColumnLayout<S> {
  const { segLevels, excludedSegs } = buildSegLevels(
    eventOrderedSegs,
    options.orderStrict,
    maxLevels,
  )
  const placements = positionTimeGridPlacements(segLevels)
  const moreLinkGroups = groupLaterallyIntersecting(
    convertSegsToWholeSlices(excludedSegs),
  )

  return {
    domOrderedPlacements: sortByAxisOrder(placements),
    moreLinkGroups,
  }
}

/**
 * Turns retained dimensionless levels into normalized placement rectangles.
 *
 * Each connected collision component shares equal-width base columns. An
 * event then expands through consecutive deeper columns until the first one
 * containing a collider. A single intersection sweep supplies component
 * membership, expansion stops, and backward/forward longest-chain depths.
 */
function positionTimeGridPlacements<S extends SourceSeg>(
  levels: readonly (readonly S[])[],
): TimeGridPlacement<S>[] {
  const placementLevels = levels.map((level, levelIndex) =>
    level.map((sourceSeg) => ({
      sourceSeg,
      start: sourceSeg.start,
      end: sourceSeg.end,
      isStart: sourceSeg.isStart,
      isEnd: sourceSeg.isEnd,
      levelIndex,
    })),
  )
  // Level order matters below: every placement precedes its deeper colliders.
  const placements = flatArray(placementLevels)
  const collidersByKey = new Map<string, typeof placements>()
  const parentByKey = new Map(placements.map((placement) => [
    placement.sourceSeg.key,
    placement.sourceSeg.key,
  ]))

  for (const placement of placements) {
    const colliders: typeof placements = []
    for (
      let levelIndex = placement.levelIndex + 1;
      levelIndex < levels.length;
      levelIndex += 1
    ) {
      colliders.push(...findIntersections(
        placementLevels[levelIndex],
        placement,
      ))
    }
    collidersByKey.set(placement.sourceSeg.key, colliders)
    for (const collider of colliders) {
      unionPlacementKeys(
        parentByKey,
        placement.sourceSeg.key,
        collider.sourceSeg.key,
      )
    }
  }

  const maxLevelByRoot = new Map<string, number>()
  for (const placement of placements) {
    const root = findPlacementRoot(parentByKey, placement.sourceSeg.key)
    maxLevelByRoot.set(root, Math.max(
      maxLevelByRoot.get(root) ?? 0,
      placement.levelIndex,
    ))
  }

  // Longest chains through the collision graph, as dynamic programming over
  // the adjacency. The passes run in opposite level orders so each dependency
  // is final before it contributes to the next placement.
  const backwardDepthByKey = new Map(placements.map((placement) => [
    placement.sourceSeg.key,
    0,
  ]))
  const forwardDepthByKey = new Map(placements.map((placement) => [
    placement.sourceSeg.key,
    0,
  ]))

  for (const placement of placements) {
    const depth = backwardDepthByKey.get(placement.sourceSeg.key)! + 1
    for (const collider of collidersByKey.get(placement.sourceSeg.key)!) {
      backwardDepthByKey.set(collider.sourceSeg.key, Math.max(
        backwardDepthByKey.get(collider.sourceSeg.key)!,
        depth,
      ))
    }
  }

  for (let index = placements.length - 1; index >= 0; index -= 1) {
    const placement = placements[index]
    let depth = 0
    for (const collider of collidersByKey.get(placement.sourceSeg.key)!) {
      depth = Math.max(
        depth,
        forwardDepthByKey.get(collider.sourceSeg.key)! + 1,
      )
    }
    forwardDepthByKey.set(placement.sourceSeg.key, depth)
  }

  return placements.map((placement) => {
    const key = placement.sourceSeg.key
    const levelCount = maxLevelByRoot.get(findPlacementRoot(parentByKey, key))! + 1

    // Expand until the shallowest deeper collider. Colliders always share the
    // component, so their levels stay within its column count.
    let farLevel = levelCount
    for (const collider of collidersByKey.get(key)!) {
      farLevel = Math.min(farLevel, collider.levelIndex)
    }

    const levelCoord = placement.levelIndex / levelCount
    const thickness = (farLevel - placement.levelIndex) / levelCount
    return {
      ...placement,
      levelCoord,
      thickness,
      levelEndCoord: levelCoord + thickness,
      backwardDepth: backwardDepthByKey.get(key)!,
      forwardDepth: forwardDepthByKey.get(key)!,
    }
  })
}

function findPlacementRoot(
  parentByKey: Map<string, string>,
  key: string,
): string {
  const parent = parentByKey.get(key)!
  if (parent === key) return key
  const root = findPlacementRoot(parentByKey, parent)
  parentByKey.set(key, root)
  return root
}

function unionPlacementKeys(
  parentByKey: Map<string, string>,
  first: string,
  second: string,
): void {
  const firstRoot = findPlacementRoot(parentByKey, first)
  const secondRoot = findPlacementRoot(parentByKey, second)
  if (firstRoot !== secondRoot) parentByKey.set(secondRoot, firstRoot)
}
