import { TableSeg } from './TableSeg'
import { sortEventSegs, OrderSpec, EventApi } from '@fullcalendar/common'


interface TableSegPlacement {
  seg: TableSeg
  top: number
  bottom: number
}


export function computeFgSegPlacement( // for one row. TODO: print mode?
  segs: TableSeg[],
  dayMaxEvents: boolean | number,
  dayMaxEventRows: boolean | number,
  eventHeights: { [instanceId: string]: number },
  maxContentHeight: number | null,
  colCnt: number,
  eventOrderSpecs: OrderSpec<EventApi>[]
) {
  let colPlacements: TableSegPlacement[][] = [] // if event spans multiple cols, its present in each col
  let moreCnts: number[] = [] // by-col
  let segIsHidden: { [instanceId: string]: boolean } = {}
  let segTops: { [instanceId: string]: number } = {} // always populated for each seg
  let segMarginTops: { [instanceId: string]: number } = {} // simetimes populated for each seg
  let moreTops: { [col: string]: number } = {}
  let paddingBottoms: { [col: string]: number } = {} // for each cell's inner-wrapper div
  let segsByFirstCol: TableSeg[][]
  let finalSegsByCol: TableSeg[][] = [] // has each seg represented in each col. only if ready to do positioning

  for (let i = 0; i < colCnt; i++) {
    colPlacements.push([])
    moreCnts.push(0)
    finalSegsByCol.push([])
  }

  segs = sortEventSegs(segs, eventOrderSpecs) as TableSeg[]

  for (let seg of segs) {
    let { instanceId } = seg.eventRange.instance
    let eventHeight = eventHeights[instanceId]

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
  for (let col = 0; col < colCnt; col++) {
    let placements = colPlacements[col]
    let currentBottom = 0
    let currentExtraSpace = 0

    for (let placement of placements) {
      let seg = placement.seg

      if (!segIsHidden[seg.eventRange.instance.instanceId]) {

        segTops[seg.eventRange.instance.instanceId] = placement.top // from top of container

        if (seg.firstCol === seg.lastCol && seg.isStart && seg.isEnd) { // TODO: simpler way? NOT DRY

          segMarginTops[seg.eventRange.instance.instanceId] =
            placement.top - currentBottom // from previous seg bottom
            + currentExtraSpace

          currentExtraSpace = 0

        } else { // multi-col event, abs positioned
          currentExtraSpace += placement.bottom - placement.top // for future non-abs segs
        }

        currentBottom = placement.bottom
      }
    }

    if (currentExtraSpace) {
      if (moreCnts[col]) {
        moreTops[col] = currentExtraSpace
      } else {
        paddingBottoms[col] = currentExtraSpace
      }
    }
  }

  segsByFirstCol = colPlacements.map(extractFirstColSegs) // operates on the sorted cols
  finalSegsByCol = colPlacements.map(extractAllColSegs)

  function placeSeg(seg, segHeight) {
    if (!tryPlaceSegAt(seg, segHeight, 0)) {
      for (let col = seg.firstCol; col <= seg.lastCol; col++) {
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
      for (let col = seg.firstCol; col <= seg.lastCol; col++) {
        let placements = colPlacements[col]
        let insertionIndex = 0
        while (
          insertionIndex < placements.length &&
          top > placements[insertionIndex].top
        ) {
          insertionIndex++
        }
        placements.splice(insertionIndex, 0, { // will keep it sorted by top
          seg,
          top,
          bottom: top + segHeight
        })
      }
      return true
    } else {
      return false
    }
  }

  function canPlaceSegAt(seg, segHeight, top) {
    for (let col = seg.firstCol; col <= seg.lastCol; col++) {
      for (let placement of colPlacements[col]) {
        if (top < placement.bottom && top + segHeight > placement.top) { // collide?
          return false
        }
      }
    }
    return true
  }

  for (let instanceId in eventHeights) {
    if (!eventHeights[instanceId]) {
      segIsHidden[instanceId] = true
    }
  }

  return {
    finalSegsByCol,
    segsByFirstCol,
    segIsHidden,
    segTops,
    segMarginTops,
    moreCnts,
    moreTops,
    paddingBottoms
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


function extractAllColSegs(oneColPlacements: TableSegPlacement[], col: number) {
  let segs: TableSeg[] = []

  for (let placement of oneColPlacements) {
    segs.push(placement.seg)
  }

  return segs
}


function limitByMaxHeight(hiddenCnts, segIsHidden, colPlacements, maxContentHeight) {
  limitEvents(hiddenCnts, segIsHidden, colPlacements, true, (placement) => {
    return placement.bottom <= maxContentHeight
  })
}


function limitByMaxEvents(hiddenCnts, segIsHidden, colPlacements, dayMaxEvents) {
  limitEvents(hiddenCnts, segIsHidden, colPlacements, false, (placement, levelIndex) => {
    return levelIndex < dayMaxEvents
  })
}


function limitByMaxRows(hiddenCnts, segIsHidden, colPlacements, dayMaxEventRows) {
  limitEvents(hiddenCnts, segIsHidden, colPlacements, true, (placement, levelIndex) => {
    return levelIndex < dayMaxEventRows
  })
}


/*
populates the given hiddenCnts/segIsHidden, which are supplied empty.
TODO: return them instead
*/
function limitEvents(hiddenCnts, segIsHidden, colPlacements, moreLinkConsumesLevel, isPlacementInBounds) {
  let colCnt = hiddenCnts.length
  let segIsVisible = {} as any // TODO: instead, use segIsHidden with true/false?
  let visibleColPlacements = [] // will mirror colPlacements

  for (let col = 0; col < colCnt; col++) {
    visibleColPlacements.push([])
  }

  for (let col = 0; col < colCnt; col++) {
    let placements = colPlacements[col]
    let level = 0

    for (let placement of placements) {

      if (isPlacementInBounds(placement, level)) {
        recordVisible(placement)
      } else {
        recordHidden(placement)
      }

      // only considered a level if the seg had height
      if (placement.top !== placement.bottom) {
        level++
      }
    }
  }

  function recordVisible(placement) {
    let { seg } = placement
    let { instanceId } = seg.eventRange.instance

    if (!segIsVisible[instanceId]) {
      segIsVisible[instanceId] = true

      for (let col = seg.firstCol; col <= seg.lastCol; col++) {
        visibleColPlacements[col].push(placement)
      }
    }
  }

  function recordHidden(placement) {
    let { seg } = placement
    let { instanceId } = seg.eventRange.instance

    if (!segIsHidden[instanceId]) {
      segIsHidden[instanceId] = true

      for (let col = seg.firstCol; col <= seg.lastCol; col++) {
        let hiddenCnt = ++hiddenCnts[col]

        if (moreLinkConsumesLevel && hiddenCnt === 1) {
          let lastVisiblePlacement = visibleColPlacements[col].pop()

          if (lastVisiblePlacement) {
            recordHidden(lastVisiblePlacement)
          }
        }
      }
    }
  }
}
