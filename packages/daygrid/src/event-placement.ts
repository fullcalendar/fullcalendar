import {
  SegInput,
  SegHierarchy,
  SegRect,
  SegEntry,
  SegInsertion,
  buildEntryKey,
  EventRenderRange,
  intersectRanges,
  addDays,
} from '@fullcalendar/common'
import { TableCellModel } from './TableCell'
import { TableSeg } from './TableSeg'

export interface TableSegPlacement {
  seg: TableSeg
  isVisible: boolean
  isAbsolute: boolean
  absoluteTop: number // populated regardless of isAbsolute
  marginTop: number
}

export function computeFgSegPlacement(
  segs: TableSeg[], // assumed already sorted
  dayMaxEvents: boolean | number,
  dayMaxEventRows: boolean | number,
  eventInstanceHeights: { [instanceId: string]: number },
  maxContentHeight: number | null,
  cells: TableCellModel[],
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

  // create segInputs only for segs with known heights
  let segInputs: SegInput[] = []
  let unknownHeightSegs: TableSeg[] = []
  for (let i = 0; i < segs.length; i += 1) {
    let seg = segs[i]
    let { instanceId } = seg.eventRange.instance
    let eventHeight = eventInstanceHeights[instanceId]

    if (eventHeight != null) {
      segInputs.push({
        index: i,
        spanStart: seg.firstCol,
        spanEnd: seg.lastCol + 1,
        thickness: eventHeight,
      })
    } else {
      unknownHeightSegs.push(seg)
    }
  }

  let hiddenEntries = hierarchy.addSegs(segInputs)
  let segRects = hierarchy.toRects()
  let { singleColPlacements, multiColPlacements, leftoverMargins } = placeRects(segRects, segs, cells)

  let moreCnts: number[] = []
  let moreMarginTops: number[] = []
  let cellPaddingBottoms: number[] = []

  // add segs with unknown heights
  for (let seg of unknownHeightSegs) {
    multiColPlacements[seg.firstCol].push({
      seg,
      isVisible: false,
      isAbsolute: true,
      absoluteTop: 0,
      marginTop: 0,
    })

    for (let col = seg.firstCol; col <= seg.lastCol; col += 1) {
      singleColPlacements[col].push({
        seg: resliceSeg(seg, col, col + 1, cells),
        isVisible: false,
        isAbsolute: false,
        absoluteTop: 0,
        marginTop: 0,
      })
    }
  }

  // add the hidden entries
  for (let col = 0; col < cells.length; col += 1) {
    moreCnts.push(0)
  }
  for (let hiddenEntry of hiddenEntries) {
    let seg = segs[hiddenEntry.segInput.index]

    multiColPlacements[hiddenEntry.spanStart].push({
      seg,
      isVisible: false,
      isAbsolute: true,
      absoluteTop: 0,
      marginTop: 0,
    })

    for (let col = hiddenEntry.spanStart; col < hiddenEntry.spanEnd; col += 1) {
      moreCnts[col] += 1
      singleColPlacements[col].push({
        seg: resliceSeg(seg, col, col + 1, cells),
        isVisible: false,
        isAbsolute: false,
        absoluteTop: 0,
        marginTop: 0,
      })
    }
  }

  // deal with leftover margins
  for (let col = 0; col < cells.length; col += 1) {
    if (moreCnts[col]) {
      moreMarginTops.push(leftoverMargins[col])
      cellPaddingBottoms.push(0)
    } else {
      moreMarginTops.push(0)
      cellPaddingBottoms.push(leftoverMargins[col])
    }
  }

  return { singleColPlacements, multiColPlacements, moreMarginTops, cellPaddingBottoms }
}

// rects ordered by top coord, then left
function placeRects(allRects: SegRect[], segs: TableSeg[], cells: TableCellModel[]) {
  let rectsByEachCol = groupRectsByEachCol(allRects, cells.length)
  let singleColPlacements: TableSegPlacement[][] = []
  let multiColPlacements: TableSegPlacement[][] = []
  let leftoverMargins: number[] = []

  for (let col = 0; col < cells.length; col += 1) {
    let rects = rectsByEachCol[col]

    // compute all static segs in singlePlacements
    let singlePlacements: TableSegPlacement[] = []
    let currentHeight = 0
    let currentMarginTop = 0
    for (let rect of rects) {
      let seg = segs[rect.segInput.index]
      singlePlacements.push({
        seg: resliceSeg(seg, col, col + 1, cells),
        isVisible: true,
        isAbsolute: false,
        absoluteTop: 0,
        marginTop: rect.levelCoord - currentHeight,
      })
      currentHeight = rect.levelCoord + rect.thickness
    }

    // compute mixed static/absolute segs in multiPlacements
    let multiPlacements: TableSegPlacement[] = []
    currentHeight = 0
    currentMarginTop = 0
    for (let rect of rects) {
      let seg = segs[rect.segInput.index]
      let isAbsolute = rect.spanEnd - rect.spanStart > 1 // multi-column?
      let isFirstCol = rect.spanStart === col

      currentMarginTop += rect.levelCoord - currentHeight // amount of space since bottom of previous seg
      currentHeight = rect.levelCoord + rect.thickness // height will now be bottom of current seg

      if (isAbsolute) {
        currentMarginTop += rect.thickness
        if (isFirstCol) {
          multiPlacements.push({
            seg: resliceSeg(seg, rect.spanStart, rect.spanEnd, cells),
            isVisible: true,
            isAbsolute: true,
            absoluteTop: rect.levelCoord,
            marginTop: 0,
          })
        }
      } else if (isFirstCol) {
        multiPlacements.push({
          seg: resliceSeg(seg, rect.spanStart, rect.spanEnd, cells),
          isVisible: true,
          isAbsolute: false,
          absoluteTop: 0,
          marginTop: currentMarginTop, // claim the margin
        })
        currentMarginTop = 0
      }
    }

    singleColPlacements.push(singlePlacements)
    multiColPlacements.push(multiPlacements)
    leftoverMargins.push(currentMarginTop)
  }

  return { singleColPlacements, multiColPlacements, leftoverMargins }
}

function groupRectsByEachCol(rects: SegRect[], colCnt: number): SegRect[][] {
  let rectsByEachCol: SegRect[][] = []

  for (let col = 0; col < colCnt; col += 1) {
    rectsByEachCol.push([])
  }

  for (let rect of rects) {
    for (let col = rect.spanStart; col < rect.spanEnd; col += 1) {
      rectsByEachCol[col].push(rect)
    }
  }

  return rectsByEachCol
}

function resliceSeg(seg: TableSeg, spanStart: number, spanEnd: number, cells: TableCellModel[]): TableSeg {
  if (seg.firstCol === spanStart && seg.lastCol === spanEnd - 1) {
    return seg
  }

  let eventRange = seg.eventRange
  let origRange = eventRange.range
  let slicedRange = intersectRanges(origRange, {
    start: cells[spanStart].date,
    end: addDays(cells[spanEnd - 1].date, 1),
  })

  return {
    ...seg,
    firstCol: spanStart,
    lastCol: spanEnd - 1,
    eventRange: {
      def: eventRange.def,
      ui: { ...eventRange.ui, durationEditable: false }, // hack to disable resizing
      instance: eventRange.instance,
      range: slicedRange,
    } as EventRenderRange,
    isStart: seg.isStart && slicedRange.start.valueOf() === origRange.start.valueOf(),
    isEnd: seg.isEnd && slicedRange.end.valueOf() === origRange.end.valueOf(),
  }
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
    for (let level = 0; level < entriesByLevel.length; level += 1) {
      entriesByLevel[level] = entriesByLevel[level].filter(excludeHidden)
    }

    return hiddenSegs
  }

  handleInvalidInsertion(insertion: SegInsertion, entry: SegEntry, hiddenEntries: SegEntry[]) {
    const { entriesByLevel, forceHidden } = this
    const level = insertion.nextLevel - 1

    if (this.hiddenConsumes && level >= 0) {
      for (let lateral = insertion.lateralStart; lateral < insertion.lateralEnd; lateral += 1) {
        const leadingEntry = entriesByLevel[level][lateral]

        if (this.allowReslicing) {
          const placeholderEntry = {
            ...leadingEntry,
            spanStart: Math.max(leadingEntry.spanStart, entry.spanStart),
            spanEnd: Math.min(leadingEntry.spanEnd, entry.spanEnd),
          }
          const placeholderEntryId = buildEntryKey(placeholderEntry)

          if (!forceHidden[placeholderEntryId]) {
            forceHidden[placeholderEntryId] = true
            entriesByLevel[level][lateral] = placeholderEntry
            this.splitEntry(leadingEntry, entry, hiddenEntries) // split up the leadingEntry
          }
        } else {
          const placeholderEntryId = buildEntryKey(leadingEntry)

          if (!forceHidden[placeholderEntryId]) {
            forceHidden[placeholderEntryId] = true
            hiddenEntries.push(leadingEntry)
          }
        }
      }
    }

    return super.handleInvalidInsertion(insertion, entry, hiddenEntries)
  }
}
