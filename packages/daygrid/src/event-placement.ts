import {
  sortEventSegs,
  OrderSpec,
  EventApi,
  EventRenderRange,
  addDays,
  intersectRanges,
  DateMarker,
} from '@fullcalendar/common'
import { TableSeg } from './TableSeg'
import { TableCellModel } from './TableCell'

interface TableSegPlacement {
  seg: TableSeg
  top: number
  bottom: number
}

export function computeFgSegPlacement( // for one row. TODO: print mode?
  cellModels: TableCellModel[],
  segs: TableSeg[],
  dayMaxEvents: boolean | number,
  dayMaxEventRows: boolean | number,
  eventHeights: { [instanceIdAndFirstCol: string]: number },
  maxContentHeight: number | null,
  colCnt: number,
  eventOrderSpecs: OrderSpec<EventApi>[],
) {
  let colPlacements: TableSegPlacement[][] = [] // if event spans multiple cols, its present in each col
  let moreCnts: number[] = [] // by-col
  let segIsHidden: { [instanceId: string]: boolean } = {}
  let segTops: { [instanceId: string]: number } = {} // always populated for each seg
  let segMarginTops: { [instanceId: string]: number } = {} // simetimes populated for each seg
  let moreTops: { [col: string]: number } = {}
  let paddingBottoms: { [col: string]: number } = {} // for each cell's inner-wrapper div

  for (let i = 0; i < colCnt; i += 1) {
    colPlacements.push([])
    moreCnts.push(0)
  }

  segs = sortEventSegs(segs, eventOrderSpecs) as TableSeg[]

  for (let seg of segs) {
    let { instanceId } = seg.eventRange.instance
    let eventHeight = eventHeights[instanceId + ':' + seg.firstCol]

    placeSeg(seg, eventHeight || 0) // will keep colPlacements sorted by top
  }

  if (dayMaxEvents === true || dayMaxEventRows === true) {
    limitByMaxHeight(moreCnts, segIsHidden, colPlacements, maxContentHeight) // populates moreCnts/segIsHidden
  } else if (typeof dayMaxEvents === 'number') {
    limitByMaxEvents(moreCnts, segIsHidden, colPlacements, dayMaxEvents) // populates moreCnts/segIsHidden
  } else if (typeof dayMaxEventRows === 'number') {
    limitByMaxRows(moreCnts, segIsHidden, colPlacements, dayMaxEventRows) // populates moreCnts/segIsHidden
  }

  // computes segTops/segMarginTops/moreTops/paddingBottoms
  for (let col = 0; col < colCnt; col += 1) {
    let placements = colPlacements[col]
    let currentNonAbsBottom = 0
    let currentAbsHeight = 0

    for (let placement of placements) {
      let seg = placement.seg

      if (!segIsHidden[seg.eventRange.instance.instanceId]) {
        segTops[seg.eventRange.instance.instanceId] = placement.top // from top of container

        if (seg.firstCol === seg.lastCol && seg.isStart && seg.isEnd) { // TODO: simpler way? NOT DRY
          segMarginTops[seg.eventRange.instance.instanceId] =
            placement.top - currentNonAbsBottom // from previous seg bottom

          currentAbsHeight = 0
          currentNonAbsBottom = placement.bottom
        } else { // multi-col event, abs positioned
          currentAbsHeight = placement.bottom - currentNonAbsBottom
        }
      }
    }

    if (currentAbsHeight) {
      if (moreCnts[col]) {
        moreTops[col] = currentAbsHeight
      } else {
        paddingBottoms[col] = currentAbsHeight
      }
    }
  }

  function placeSeg(seg, segHeight) {
    if (!tryPlaceSegAt(seg, segHeight, 0)) {
      for (let col = seg.firstCol; col <= seg.lastCol; col += 1) {
        for (let placement of colPlacements[col]) { // will repeat multi-day segs!!!!!!! bad!!!!!!
          if (tryPlaceSegAt(seg, segHeight, placement.bottom)) {
            return
          }
        }
      }
    }
  }

  function tryPlaceSegAt(seg, segHeight, top) {
    if (canPlaceSegAt(seg, segHeight, top)) {
      for (let col = seg.firstCol; col <= seg.lastCol; col += 1) {
        let placements = colPlacements[col]
        let insertionIndex = 0

        while (
          insertionIndex < placements.length &&
          top >= placements[insertionIndex].top
        ) {
          insertionIndex += 1
        }

        placements.splice(insertionIndex, 0, { // will keep it sorted by top
          seg,
          top,
          bottom: top + segHeight,
        })
      }

      return true
    }

    return false
  }

  function canPlaceSegAt(seg, segHeight, top) {
    for (let col = seg.firstCol; col <= seg.lastCol; col += 1) {
      for (let placement of colPlacements[col]) {
        if (top < placement.bottom && top + segHeight > placement.top) { // collide?
          return false
        }
      }
    }

    return true
  }

  // what does this do!?
  for (let instanceIdAndFirstCol in eventHeights) {
    if (!eventHeights[instanceIdAndFirstCol]) {
      segIsHidden[instanceIdAndFirstCol.split(':')[0]] = true
    }
  }

  let segsByFirstCol = colPlacements.map(extractFirstColSegs) // operates on the sorted cols
  let segsByEachCol = colPlacements.map((placements, col) => {
    let segsForCols = extractAllColSegs(placements)
    segsForCols = resliceDaySegs(segsForCols, cellModels[col].date, col)
    return segsForCols
  })

  return {
    segsByFirstCol,
    segsByEachCol,
    segIsHidden,
    segTops,
    segMarginTops,
    moreCnts,
    moreTops,
    paddingBottoms,
  }
}

function extractFirstColSegs(oneColPlacements: TableSegPlacement[], col: number) {
  let segs: TableSeg[] = []

  for (let placement of oneColPlacements) {
    if (placement.seg.firstCol === col) {
      segs.push(placement.seg)
    }
  }

  return segs
}

function extractAllColSegs(oneColPlacements: TableSegPlacement[]) {
  let segs: TableSeg[] = []

  for (let placement of oneColPlacements) {
    segs.push(placement.seg)
  }

  return segs
}

function limitByMaxHeight(hiddenCnts, segIsHidden, colPlacements, maxContentHeight) {
  limitEvents(
    hiddenCnts,
    segIsHidden,
    colPlacements,
    true,
    (placement) => placement.bottom <= maxContentHeight,
  )
}

function limitByMaxEvents(hiddenCnts, segIsHidden, colPlacements, dayMaxEvents) {
  limitEvents(
    hiddenCnts,
    segIsHidden,
    colPlacements,
    false,
    (placement, levelIndex) => levelIndex < dayMaxEvents,
  )
}

function limitByMaxRows(hiddenCnts, segIsHidden, colPlacements, dayMaxEventRows) {
  limitEvents(
    hiddenCnts,
    segIsHidden,
    colPlacements,
    true,
    (placement, levelIndex) => levelIndex < dayMaxEventRows,
  )
}

/*
populates the given hiddenCnts/segIsHidden, which are supplied empty.
TODO: return them instead
*/
function limitEvents(hiddenCnts, segIsHidden, colPlacements, _moreLinkConsumesLevel, isPlacementInBounds) {
  let colCnt = hiddenCnts.length
  let segIsVisible = {} as any // TODO: instead, use segIsHidden with true/false?
  let visibleColPlacements = [] // will mirror colPlacements

  for (let col = 0; col < colCnt; col += 1) {
    visibleColPlacements.push([])
  }

  for (let col = 0; col < colCnt; col += 1) {
    let placements = colPlacements[col]
    let level = 0

    for (let placement of placements) {
      if (isPlacementInBounds(placement, level)) {
        recordVisible(placement)
      } else {
        recordHidden(placement, level, _moreLinkConsumesLevel)
      }

      // only considered a level if the seg had height
      if (placement.top !== placement.bottom) {
        level += 1
      }
    }
  }

  function recordVisible(placement) {
    let { seg } = placement
    let { instanceId } = seg.eventRange.instance

    if (!segIsVisible[instanceId]) {
      segIsVisible[instanceId] = true

      for (let col = seg.firstCol; col <= seg.lastCol; col += 1) {
        visibleColPlacements[col].push(placement)
      }
    }
  }

  function recordHidden(placement, currentLevel, moreLinkConsumesLevel) {
    let { seg } = placement
    let { instanceId } = seg.eventRange.instance

    if (!segIsHidden[instanceId]) {
      segIsHidden[instanceId] = true

      for (let col = seg.firstCol; col <= seg.lastCol; col += 1) {
        hiddenCnts[col] += 1
        let hiddenCnt = hiddenCnts[col]

        if (moreLinkConsumesLevel && hiddenCnt === 1 && currentLevel > 0) {
          let doomedLevel = currentLevel - 1

          while (visibleColPlacements[col].length > doomedLevel) {
            recordHidden(
              visibleColPlacements[col].pop(), // removes
              visibleColPlacements[col].length, // will execute after the pop. will be the index of the removed placement
              false,
            )
          }
        }
      }
    }
  }
}

// Given the events within an array of segment objects, reslice them to be in a single day
function resliceDaySegs(segs: TableSeg[], dayDate: DateMarker, colIndex: number) {
  let dayStart = dayDate
  let dayEnd = addDays(dayStart, 1)
  let dayRange = { start: dayStart, end: dayEnd }
  let newSegs = []

  for (let seg of segs) {
    let eventRange = seg.eventRange
    let origRange = eventRange.range
    let slicedRange = intersectRanges(origRange, dayRange)

    if (slicedRange) {
      newSegs.push({
        ...seg,
        firstCol: colIndex,
        lastCol: colIndex,
        eventRange: {
          def: eventRange.def,
          ui: { ...eventRange.ui, durationEditable: false }, // hack to disable resizing
          instance: eventRange.instance,
          range: slicedRange,
        } as EventRenderRange,
        isStart: seg.isStart && slicedRange.start.valueOf() === origRange.start.valueOf(),
        isEnd: seg.isEnd && slicedRange.end.valueOf() === origRange.end.valueOf(),
      })
    }
  }

  return newSegs
}
