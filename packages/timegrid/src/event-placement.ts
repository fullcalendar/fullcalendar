import { Seg, DateMarker, buildSegCompareObj, compareByFieldSpecs, sortEventSegs, OrderSpec, EventApi } from '@fullcalendar/common'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords'

// UNFORTUNATELY, assigns results to the top/bottom/level/forwardCoord/backwardCoord props of the actual segs.
// TODO: return hash (by instanceId) of results

export function computeSegCoords(segs: Seg[], dayDate: DateMarker, slatCoords: TimeColsSlatsCoords, eventMinHeight: number, eventOrderSpecs: OrderSpec<EventApi>[]) {
  computeSegVerticals(segs, dayDate, slatCoords, eventMinHeight)
  return computeSegHorizontals(segs, eventOrderSpecs) // requires top/bottom from computeSegVerticals
}

// For each segment in an array, computes and assigns its top and bottom properties
export function computeSegVerticals(segs: Seg[], dayDate: DateMarker, slatCoords: TimeColsSlatsCoords, eventMinHeight: number) {
  for (let seg of segs) {
    seg.top = slatCoords.computeDateTop(seg.start, dayDate)
    seg.bottom = Math.max(
      seg.top + (eventMinHeight || 0), // yuck
      slatCoords.computeDateTop(seg.end, dayDate),
    )
  }
}

// Given an array of segments that are all in the same column, sets the backwardCoord and forwardCoord on each.
// Assumed the segs are already ordered.
// NOTE: Also reorders the given array by date!
function computeSegHorizontals(segs: Seg[], eventOrderSpecs: OrderSpec<EventApi>[]) {
  // IMPORTANT TO CLEAR OLD RESULTS :(
  for (let seg of segs) {
    seg.level = null
    seg.forwardCoord = null
    seg.backwardCoord = null
    seg.forwardPressure = null
  }

  segs = sortEventSegs(segs, eventOrderSpecs)

  let level0
  let levels = buildSlotSegLevels(segs)
  computeForwardSlotSegs(levels)

  if ((level0 = levels[0])) {
    for (let seg of level0) {
      computeSlotSegPressures(seg)
    }

    for (let seg of level0) {
      computeSegForwardBack(seg, 0, 0, eventOrderSpecs)
    }
  }

  return segs
}

// Builds an array of segments "levels". The first level will be the leftmost tier of segments if the calendar is
// left-to-right, or the rightmost if the calendar is right-to-left. Assumes the segments are already ordered by date.
function buildSlotSegLevels(segs: Seg[]) {
  let levels = []
  let i
  let seg
  let j

  for (i = 0; i < segs.length; i += 1) {
    seg = segs[i]

    // go through all the levels and stop on the first level where there are no collisions
    for (j = 0; j < levels.length; j++) {
      if (!computeSlotSegCollisions(seg, levels[j]).length) {
        break
      }
    }

    seg.level = j;
    (levels[j] || (levels[j] = [])).push(seg)
  }

  return levels
}

// Find all the segments in `otherSegs` that vertically collide with `seg`.
// Append into an optionally-supplied `results` array and return.
function computeSlotSegCollisions(seg: Seg, otherSegs: Seg[], results = []) {
  for (let i = 0; i < otherSegs.length; i += 1) {
    if (isSlotSegCollision(seg, otherSegs[i])) {
      results.push(otherSegs[i])
    }
  }

  return results
}

// Do these segments occupy the same vertical space?
function isSlotSegCollision(seg1: Seg, seg2: Seg) {
  return seg1.bottom > seg2.top && seg1.top < seg2.bottom
}

// For every segment, figure out the other segments that are in subsequent
// levels that also occupy the same vertical space. Accumulate in seg.forwardSegs
function computeForwardSlotSegs(levels) {
  let i
  let level
  let j
  let seg
  let k

  for (i = 0; i < levels.length; i += 1) {
    level = levels[i]

    for (j = 0; j < level.length; j++) {
      seg = level[j]

      seg.forwardSegs = []
      for (k = i + 1; k < levels.length; k++) {
        computeSlotSegCollisions(seg, levels[k], seg.forwardSegs)
      }
    }
  }
}

// Figure out which path forward (via seg.forwardSegs) results in the longest path until
// the furthest edge is reached. The number of segments in this path will be seg.forwardPressure
function computeSlotSegPressures(seg: Seg) {
  let forwardSegs = seg.forwardSegs
  let forwardPressure = 0
  let i
  let forwardSeg

  if (seg.forwardPressure == null) { // not already computed
    for (i = 0; i < forwardSegs.length; i += 1) {
      forwardSeg = forwardSegs[i]

      // figure out the child's maximum forward path
      computeSlotSegPressures(forwardSeg)

      // either use the existing maximum, or use the child's forward pressure
      // plus one (for the forwardSeg itself)
      forwardPressure = Math.max(
        forwardPressure,
        1 + forwardSeg.forwardPressure,
      )
    }

    seg.forwardPressure = forwardPressure
  }
}

// Calculate seg.forwardCoord and seg.backwardCoord for the segment, where both values range
// from 0 to 1. If the calendar is left-to-right, the seg.backwardCoord maps to "left" and
// seg.forwardCoord maps to "right" (via percentage). Vice-versa if the calendar is right-to-left.
//
// The segment might be part of a "series", which means consecutive segments with the same pressure
// who's width is unknown until an edge has been hit. `seriesBackwardPressure` is the number of
// segments behind this one in the current series, and `seriesBackwardCoord` is the starting
// coordinate of the first segment in the series.
function computeSegForwardBack(seg: Seg, seriesBackwardPressure, seriesBackwardCoord, eventOrderSpecs) {
  let forwardSegs = seg.forwardSegs
  let i

  if (seg.forwardCoord == null) { // not already computed
    if (!forwardSegs.length) {
      // if there are no forward segments, this segment should butt up against the edge
      seg.forwardCoord = 1
    } else {
      // sort highest pressure first
      sortForwardSegs(forwardSegs, eventOrderSpecs)

      // this segment's forwardCoord will be calculated from the backwardCoord of the
      // highest-pressure forward segment.
      computeSegForwardBack(forwardSegs[0], seriesBackwardPressure + 1, seriesBackwardCoord, eventOrderSpecs)
      seg.forwardCoord = forwardSegs[0].backwardCoord
    }

    // calculate the backwardCoord from the forwardCoord. consider the series
    seg.backwardCoord = seg.forwardCoord -
      (seg.forwardCoord - seriesBackwardCoord) / // available width for series
      (seriesBackwardPressure + 1) // # of segments in the series

    // use this segment's coordinates to computed the coordinates of the less-pressurized
    // forward segments
    for (i = 0; i < forwardSegs.length; i += 1) {
      computeSegForwardBack(forwardSegs[i], 0, seg.forwardCoord, eventOrderSpecs)
    }
  }
}

function sortForwardSegs(forwardSegs: Seg[], eventOrderSpecs) {
  let objs = forwardSegs.map(buildTimeGridSegCompareObj)

  let specs = [
    // put higher-pressure first
    { field: 'forwardPressure', order: -1 },
    // put segments that are closer to initial edge first (and favor ones with no coords yet)
    { field: 'backwardCoord', order: 1 },
  ].concat(eventOrderSpecs)

  objs.sort((obj0, obj1) => compareByFieldSpecs(obj0, obj1, specs))

  return objs.map((c) => c._seg)
}

function buildTimeGridSegCompareObj(seg: Seg): any {
  let obj = buildSegCompareObj(seg) as any

  obj.forwardPressure = seg.forwardPressure
  obj.backwardCoord = seg.backwardCoord

  return obj
}
