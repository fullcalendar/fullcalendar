import {
  DEFAULT_UNMEASURED_EVENT_THICKNESS,
  DEFAULT_UNMEASURED_MORE_LINK_THICKNESS,
  type HiddenSliceGroup,
  type Slice,
  type SourceSeg,
  buildSegLevels,
  convertSegLevelsToWholeSlices,
  convertSegsToWholeSlices,
  placeExtraSlicesInLevels,
} from './kernel'

/** High but finite safety cap for event levels in either print view. */
export const DEFAULT_PRINT_MAX_LEVELS = 200

/**
 * Selects print DOM candidates from the complete source list.
 *
 * Print must never inherit the screen candidate frontier: it plans directly
 * from every event-ordered source with unit thickness. The default 200-level
 * cap is an internal safety constant, not a public option.
 */
export interface PrintCandidatePlan<S extends SourceSeg = SourceSeg> {
  sliceLevels: Slice<S>[][]
  /** Exact hidden membership, with no ordering guarantee. */
  hiddenSlices: Slice<S>[]
}

export function planPrintDomCandidates<S extends SourceSeg>(
  eventOrderedSegs: readonly S[],
  eventOrderStrict: boolean,
  eventSlicing: boolean,
): PrintCandidatePlan<S> {
  const { segLevels, excludedSegs } = buildSegLevels(
    eventOrderedSegs,
    eventOrderStrict,
    DEFAULT_PRINT_MAX_LEVELS,
  )
  const placement = placeExtraSlicesInLevels(
    convertSegLevelsToWholeSlices(segLevels),
    convertSegsToWholeSlices(excludedSegs),
    eventOrderStrict,
    eventSlicing,
    0,
  )

  return {
    sliceLevels: placement.sliceLevels,
    hiddenSlices: placement.hiddenSlices,
  }
}

/**
 * One normal-flow print band backed by a single dimensionless event level.
 *
 * The band is a relatively positioned canvas. Its slices begin at level
 * coordinate zero because they never overlap laterally, while its explicit
 * thickness gives the renderer a page-breakable normal-flow box.
 */
export interface PrintEventBand<S extends SourceSeg = SourceSeg> {
  levelIndex: number
  slices: Slice<S>[]
  /** Tallest current or fallback occupied source thickness in this band. */
  thickness: number
}

/**
 * Timeline's single final print band for every hidden-slice more link.
 *
 * It renders after all event bands and never counts against the 200 event-level
 * safety cap. Each link starts at `top: 0` within this band canvas: print gives
 * up screen skyline compaction so links paginate together. DayGrid does not
 * use this structure because it prints links outside the event bands.
 */
export interface PrintMoreLinkBand<S extends SourceSeg = SourceSeg> {
  moreLinkGroups: readonly HiddenSliceGroup<S>[]
  /** Tallest current or fallback occupied link thickness in this band. */
  thickness: number
}

/**
 * Projects dimensionless levels into independently page-breakable bands.
 *
 * The level entries may carry unit-thickness planning coordinates, but those
 * coordinates have no print meaning. Every print slice begins at level
 * coordinate zero in its own band, whose thickness is the largest current
 * slice-wrapper measurement. Missing measurements use the supplied fallback.
 * Empty or sparse levels do not create empty DOM bands. The key resolver lets
 * adapters retain their wrapper-level measurement identity.
 */
export function buildPrintEventBands<S extends SourceSeg>(
  levels: readonly (readonly Slice<S>[])[],
  printEventThicknesses: ReadonlyMap<string, number>,
  getPrintEventKey: (slice: Slice<S>) => string = (slice) => slice.sourceSeg.key,
  defaultPrintEventThickness = DEFAULT_UNMEASURED_EVENT_THICKNESS,
): PrintEventBand<S>[] {
  const bands: PrintEventBand<S>[] = []

  for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
    const entries = levels[levelIndex]
    if (!entries?.length) continue

    let thickness = 0
    const slices = entries.map((slice) => {
      thickness = Math.max(
        thickness,
        printEventThicknesses.get(getPrintEventKey(slice)) ??
          defaultPrintEventThickness,
      )
      return slice
    })

    bands.push({
      levelIndex,
      slices,
      thickness,
    })
  }

  return bands
}

/** Builds Timeline's one final print more-link band when hidden groups exist. */
export function buildPrintMoreLinkBand<S extends SourceSeg>(
  hiddenGroups: readonly HiddenSliceGroup<S>[],
  printMoreLinkHeights: ReadonlyMap<string, number>,
): PrintMoreLinkBand<S> | null {
  if (!hiddenGroups.length) {
    return null
  }

  // Group members arrive event-ordered, with the first member defining the key.
  return {
    moreLinkGroups: hiddenGroups,
    thickness: Math.max(...hiddenGroups.map((group) =>
      printMoreLinkHeights.get(group.key) ??
        DEFAULT_UNMEASURED_MORE_LINK_THICKNESS,
    )),
  }
}
