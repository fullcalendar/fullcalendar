import { type Slice, sortByEventOrder } from '../seg-placement/kernel'
import {
  buildPrintEventBands,
  planPrintDomCandidates,
} from '../seg-placement/print'
import {
  type DayGridEventSeg,
  type DayGridSourceSeg,
  buildDayGridSegSources,
} from './seg-placement-adapter'

export interface DayGridPrintPlan {
  sourceSegs: DayGridSourceSeg[]
  sliceLevels: Slice<DayGridSourceSeg>[][]
  hiddenSlices: Slice<DayGridSourceSeg>[]
  columnCount: number
}

export interface DayGridPrintBandSlot {
  levelIndex: number
  thickness: number
  slice: Slice<DayGridSourceSeg> | null
}

/** Plans one print row from its complete, resolved-order source list. */
export function buildDayGridPrintPlan(
  eventOrderedSegs: DayGridEventSeg[],
  orderStrict: boolean,
  eventSlicing: boolean,
  columnCount: number,
): DayGridPrintPlan {
  const sourceSegs = buildDayGridSegSources(eventOrderedSegs)
  const candidatePlan = planPrintDomCandidates(
    sourceSegs,
    orderStrict,
    eventSlicing,
  )

  return {
    ...candidatePlan,
    hiddenSlices: sortByEventOrder(candidatePlan.hiddenSlices),
    sourceSegs,
    columnCount,
  }
}

/** Transposes row-wide print bands into one aligned slot sequence per cell. */
export function buildDayGridPrintColumns(
  plan: DayGridPrintPlan,
  printSegHeights: ReadonlyMap<string, number>,
): DayGridPrintBandSlot[][] {
  const columns = Array.from(
    { length: plan.columnCount },
    () => [] as DayGridPrintBandSlot[],
  )

  for (const band of buildPrintEventBands(
    plan.sliceLevels,
    printSegHeights,
    getDayGridPrintSliceKey,
  )) {
    const slicesByColumn = Array<Slice<DayGridSourceSeg> | null>(plan.columnCount).fill(null)

    for (const slice of band.slices) {
      slicesByColumn[slice.start] = slice
    }

    for (let column = 0; column < plan.columnCount; column++) {
      columns[column].push({
        levelIndex: band.levelIndex,
        thickness: band.thickness,
        slice: slicesByColumn[column],
      })
    }
  }

  return columns
}

/** Stable identity for one print wrapper when a source is split laterally. */
export function getDayGridPrintSliceKey(slice: Slice<DayGridSourceSeg>): string {
  return `${slice.sourceSeg.key}:${slice.start}:${slice.end}`
}
