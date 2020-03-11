import TableSeg, { splitSegsByFirstCol } from './TableSeg'
import { sortEventSegs } from '@fullcalendar/core'


interface TableSegPlacement {
  seg: TableSeg
  top: number
  bottom: number
}


export function computeFgSegPlacement( // for one row. TODO: print mode?
  segs: TableSeg[],
  eventLimit: boolean | number,
  eventHeights: { [instanceId: string]: number } | null,
  maxContentHeight: number | null,
  colCnt: number,
  eventOrderSpecs: any
) {
  let colPlacements: TableSegPlacement[][] = []
  let moreCnts: number[] = [] // by-col
  let segIsNoDisplay: { [instanceId: string]: boolean } = {}
  let segTops: { [instanceId: string]: number } = {} // always populated for each seg
  let segMarginTops: { [instanceId: string]: number } = {} // simetimes populated for each seg
  let moreTops: { [col: string]: number } = {}
  let paddingBottoms: { [col: string]: number } = {} // for each cell's inner-wrapper div
  let segsByCol: TableSeg[][]

  for (let i = 0; i < colCnt; i++) {
    colPlacements.push([])
    moreCnts.push(0)
  }

  segs = sortEventSegs(segs, eventOrderSpecs) as TableSeg[]

  if (eventHeights) {

    // TODO: try all seg placements and choose the topmost! dont quit after first
    // SOLUTION: when placed, insert into colPlacements
    for (let seg of segs) {
      placeSeg(seg, eventHeights[seg.eventRange.instance.instanceId])
    }

    // sort. for eventLimit and segTops computation
    for (let placements of colPlacements) {
      placements.sort(cmpPlacements)
    }

    segsByCol = colPlacements.map(extractFirstColSegs) // operates on the sorted cols

    if (eventLimit === true) { // assumes maxContentHeight

      for (let col = 0; col < colCnt; col++) {
        let placements = colPlacements[col]
        let hiddenCnt = 0
        let i

        for (i = placements.length - 1; i >= 0; i--) {
          if (placements[i].bottom > maxContentHeight) {
            segIsNoDisplay[placements[i].seg.eventRange.instance.instanceId] = true
            hiddenCnt++
          } else {
            break
          }
        }

        // remove the lowest remaining, to make space for the +more link
        // `i` is on the lowest valid seg
        if (hiddenCnt && i > 0) {
          segIsNoDisplay[placements[i].seg.eventRange.instance.instanceId] = true
          hiddenCnt++
        }

        moreCnts[col] = hiddenCnt
      }

    } else if (eventLimit) {

      for (let col = 0; col < colCnt; col++) {
        let placements = colPlacements[col]
        let hiddenCnt = 0

        for (let i = eventLimit; i < placements.length; i++) {
          segIsNoDisplay[placements[i].seg.eventRange.instance.instanceId] = true
          hiddenCnt++
        }

        moreCnts[col] = hiddenCnt
      }
    }

    // computes segTops/segMarginTops/moreTops/paddingBottoms
    for (let col = 0; col < colCnt; col++) {
      let placements = colPlacements[col]
      let currentBottom = 0
      let currentExtraSpace = 0

      for (let placement of placements) {
        let seg = placement.seg

        if (!segIsNoDisplay[seg.eventRange.instance.instanceId]) {

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

  } else {
    segsByCol = splitSegsByFirstCol(segs, colCnt)
  }

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
        colPlacements[col].push({
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

  return {
    segsByCol,
    segIsNoDisplay,
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


function cmpPlacements(placement0, placement1) {
  return placement0.top - placement1.top
}
