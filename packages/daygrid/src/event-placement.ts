import {
  SegInput,
  SegHierarchy,
  SegRect,
  SegEntry,
  SegInsertion,
  buildEntryKey,
} from '@fullcalendar/common'
import { TableSeg } from './TableSeg'

// TODO: print-mode where every placement is non-absolute?

export interface TableSegPlacement {
  seg: TableSeg
  partIndex: number
  isHidden: boolean
  isAbsolute: boolean
  absoluteTop: number // always populated regardless of isAbsolute
  marginTop: number // only populated if !isAbsolute
}

export function computeFgSegPlacement(
  segs: TableSeg[],
  dayMaxEvents: boolean | number,
  dayMaxEventRows: boolean | number,
  eventInstanceHeights: { [instanceId: string]: number },
  maxContentHeight: number | null,
  colCnt: number
) {
  let hierarchy = new DayGridSegHierarchy()
  hierarchy.allowReslicing = true

  if (dayMaxEvents === true || dayMaxEventRows === true) {
    hierarchy.maxCoord = maxContentHeight
    hierarchy.hiddenConsumes = true
  } else if (typeof dayMaxEvents === 'number') {
    hierarchy.maxStackCnt = dayMaxEvents
  } else if (typeof dayMaxEventRows === 'number') {
    hierarchy.maxStackCnt = dayMaxEventRows
    hierarchy.hiddenConsumes = true
  }

  let segInputs: SegInput[] = segs.map((seg: TableSeg, i: number) => {
    let { instanceId } = seg.eventRange.instance
    let eventHeight = eventInstanceHeights[instanceId]

    return {
      index: i,
      spanStart: seg.firstCol,
      spanEnd: seg.lastCol + 1,
      thickness: eventHeight || 0,
      forceAbsolute: seg.isStart || seg.isEnd || eventHeight == null,
    }
  })

  let hiddenEntries = hierarchy.addSegs(segInputs)
  let segRects = hierarchy.toRects()
  let { placementsByFirstCol, placementsByEachCol, leftoverMarginsByCol } = placeRects(segRects, segs, colCnt)

  let moreCnts: number[] = []
  let moreMarginTops: number[] = []
  let cellPaddingBottoms: number[] = []

  for (let col = 0; col < colCnt; col++) {
    moreCnts.push(0)
  }

  // add the hidden entries
  for (let hiddenEntry of hiddenEntries) {
    let placement: TableSegPlacement = {
      seg: segs[hiddenEntry.segInput.index],
      partIndex: 0,
      isAbsolute: true,
      isHidden: true,
      absoluteTop: 0,
      marginTop: 0
    }

    placementsByFirstCol[hiddenEntry.spanStart].push(placement)

    for (let col = hiddenEntry.spanStart; col < hiddenEntry.spanEnd; col++) {
      placementsByEachCol[col].push(placement)
      moreCnts[col]++
    }
  }

  for (let col = 0; col < colCnt; col++) {
    if (moreCnts[col]) {
      moreMarginTops.push(leftoverMarginsByCol[col])
      cellPaddingBottoms.push(0)
    } else {
      moreMarginTops.push(0)
      cellPaddingBottoms.push(leftoverMarginsByCol[col])
    }
  }

  return { placementsByFirstCol, placementsByEachCol, moreCnts, moreMarginTops, cellPaddingBottoms }
}

// rects ordered by top coord, then left
function placeRects(rects: SegRect[], segs: TableSeg[], colCnt: number) {
  let placementsByFirstCol: TableSegPlacement[][] = []
  let placementsByEachCol: TableSegPlacement[][] = []
  let leftoverMarginsByCol: number[] = []

  for (let col = 0; col < colCnt; col++) {
    placementsByFirstCol.push([])
    placementsByEachCol.push([])
  }

  for (let rect of rects) {
    let seg = segs[rect.segInput.index]

    if ( // a subdivided part? create a fake seg
      seg.firstCol !== rect.spanStart ||
      seg.lastCol !== rect.spanEnd - 1
    ) {
      seg = {
        ...seg,
        firstCol: rect.spanStart,
        lastCol: rect.spanEnd - 1,
        isStart: seg.isStart && (rect.spanStart === rect.segInput.spanStart), // keep isStart if not trimmed
        isEnd: seg.isEnd && (rect.spanEnd === rect.segInput.spanEnd) // keep isEnd if not trimmed
      }
    }

    let placement: TableSegPlacement & { height: number } = {
      seg,
      partIndex: rect.partIndex,
      isAbsolute: rect.spanEnd - rect.spanStart > 1 || rect.segInput.forceAbsolute,
      isHidden: false,
      absoluteTop: rect.levelCoord,
      marginTop: 0, // will compute later
      height: rect.thickness
    }

    placementsByFirstCol[rect.spanStart].push(placement)

    for (let col = rect.spanStart; col < rect.spanEnd; col++) {
      placementsByEachCol[col].push(placement)
    }
  }

  // compute the marginTops on the non-absolute placements
  for (let col = 0; col < colCnt; col++) {
    let currentHeight = 0
    let currentMargin = 0

    for (let placement of placementsByEachCol[col]) {
      let placementHeight = (placement as any).height as number // hack
      currentMargin += placement.absoluteTop - currentHeight // amount of space since bottom of previous seg
      currentHeight = placement.absoluteTop + placementHeight // height will now be bottom of current seg

      if (placement.isAbsolute) {
        currentMargin += placementHeight
      } else if (placement.seg.firstCol === col) { // non-absolute seg rooted in this col
        placement.marginTop = currentMargin // claim the margin
        currentMargin = 0
      }
    }

    leftoverMarginsByCol.push(currentMargin)
  }

  return { placementsByFirstCol, placementsByEachCol, leftoverMarginsByCol }
}

class DayGridSegHierarchy extends SegHierarchy {
  // config
  hiddenConsumes: boolean = false

  // allows us to keep hidden entries in the hierarchy so they take up space
  forceHidden: { [entryId: string]: true } = {}

  addSegs(segInputs: SegInput[]): SegEntry[] {
    const hiddenSegs = super.addSegs(segInputs)
    const { entriesByLevel } = this
    const excludeHidden = (entry: SegEntry) => !this.forceHidden[buildEntryKey(entry)]

    // remove the forced-hidden segs
    for (let level = 0; level < entriesByLevel.length; level++) {
      entriesByLevel[level] = entriesByLevel[level].filter(excludeHidden)
    }

    return hiddenSegs
  }

  handleInvalidInsertion(insertion: SegInsertion, entry: SegEntry, hiddenEntries: SegEntry[]) {
    const { entriesByLevel, forceHidden } = this
    const level = insertion.nextLevel - 1

    if (this.hiddenConsumes && level >= 0) {
      for (let lateral = insertion.lateralStart; lateral < insertion.lateralEnd; lateral++) {
        const leadingEntry = entriesByLevel[level][lateral]
        const leadingEntryId = buildEntryKey(leadingEntry)

        if (!forceHidden[leadingEntryId]) {
          forceHidden[leadingEntryId] = true

          if (this.allowReslicing) {
            // trim down the touchingEntry in the hierarchy. intersect with the new entry
            entriesByLevel[level][lateral] = {
              ...leadingEntry,
              spanStart: Math.max(leadingEntry.spanStart, entry.spanStart),
              spanEnd: Math.min(leadingEntry.spanEnd, entry.spanEnd)
            }

            // split up the leadingEntry
            this.splitEntry(leadingEntry, entry, hiddenEntries)
          } else {
            hiddenEntries.push(leadingEntry)
          }
        }
      }
    }

    return super.handleInvalidInsertion(insertion, entry, hiddenEntries)
  }
}
