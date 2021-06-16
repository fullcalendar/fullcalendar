import {
  SegHierarchy,
  SegRect,
  SegEntry,
  SegInsertion,
  buildEntryKey,
  EventRenderRange,
  intersectRanges,
  addDays,
  DayTableCell,
  intersectSpans,
} from '@fullcalendar/common'
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
  strictOrder: boolean,
  eventInstanceHeights: { [instanceId: string]: number },
  maxContentHeight: number | null,
  cells: DayTableCell[],
) {
  let hierarchy = new DayGridSegHierarchy()
  hierarchy.allowReslicing = true
  hierarchy.strictOrder = strictOrder

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
  let segInputs: SegEntry[] = []
  let unknownHeightSegs: TableSeg[] = []
  for (let i = 0; i < segs.length; i += 1) {
    let seg = segs[i]
    let { instanceId } = seg.eventRange.instance
    let eventHeight = eventInstanceHeights[instanceId]

    if (eventHeight != null) {
      segInputs.push({
        index: i,
        thickness: eventHeight,
        span: {
          start: seg.firstCol,
          end: seg.lastCol + 1,
        },
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
    let seg = segs[hiddenEntry.index]
    let hiddenSpan = hiddenEntry.span

    multiColPlacements[hiddenSpan.start].push({
      seg: resliceSeg(seg, hiddenSpan.start, hiddenSpan.end, cells),
      isVisible: false,
      isAbsolute: true,
      absoluteTop: 0,
      marginTop: 0,
    })

    for (let col = hiddenSpan.start; col < hiddenSpan.end; col += 1) {
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
    moreMarginTops.push(leftoverMargins[col])
  }

  return { singleColPlacements, multiColPlacements, moreCnts, moreMarginTops }
}

// rects ordered by top coord, then left
function placeRects(allRects: SegRect[], segs: TableSeg[], cells: DayTableCell[]) {
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
      let seg = segs[rect.index]
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
      let seg = segs[rect.index]
      let isAbsolute = rect.span.end - rect.span.start > 1 // multi-column?
      let isFirstCol = rect.span.start === col

      currentMarginTop += rect.levelCoord - currentHeight // amount of space since bottom of previous seg
      currentHeight = rect.levelCoord + rect.thickness // height will now be bottom of current seg

      if (isAbsolute) {
        currentMarginTop += rect.thickness
        if (isFirstCol) {
          multiPlacements.push({
            seg: resliceSeg(seg, rect.span.start, rect.span.end, cells),
            isVisible: true,
            isAbsolute: true,
            absoluteTop: rect.levelCoord,
            marginTop: 0,
          })
        }
      } else if (isFirstCol) {
        multiPlacements.push({
          seg: resliceSeg(seg, rect.span.start, rect.span.end, cells),
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
    for (let col = rect.span.start; col < rect.span.end; col += 1) {
      rectsByEachCol[col].push(rect)
    }
  }

  return rectsByEachCol
}

function resliceSeg(seg: TableSeg, spanStart: number, spanEnd: number, cells: DayTableCell[]): TableSeg {
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

  addSegs(segInputs: SegEntry[]): SegEntry[] {
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
    const { touchingLevel } = insertion

    if (this.hiddenConsumes && touchingLevel >= 0) {
      for (let lateral = insertion.lateralStart; lateral < insertion.lateralEnd; lateral += 1) {
        const leadingEntry = entriesByLevel[touchingLevel][lateral]

        if (this.allowReslicing) {
          const placeholderEntry: SegEntry = { // placeholder of the "more" link
            ...leadingEntry,
            span: intersectSpans(leadingEntry.span, entry.span),
          }
          const placeholderEntryId = buildEntryKey(placeholderEntry)

          if (!forceHidden[placeholderEntryId]) { // if not already hidden
            forceHidden[placeholderEntryId] = true
            entriesByLevel[touchingLevel][lateral] = placeholderEntry // replace leadingEntry with our placeholder
            this.splitEntry(leadingEntry, entry, hiddenEntries) // split up the leadingEntry, reinsert it
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
