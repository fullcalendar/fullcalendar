import { EventRenderRange } from '../component-util/event-rendering'
import { DayTableCell } from '../common/DayTableModel'
import { SegHierarchy } from '../seg-hierarchy'
import { DayRowEventRange, DayRowEventRangePart, getEventPartKey, sliceSegForCol } from './TableSeg'

export function computeFgSegVerticals(
  segs: DayRowEventRange[],
  segHeightMap: Map<string, number>,
  cells: DayTableCell[],
  maxHeight: number | undefined,
  strictOrder: boolean,
  allowSlicing: boolean = true,
  dayMaxEvents: boolean | number,
  dayMaxEventRows: boolean | number,
): [
  segsByCol: DayRowEventRangePart[][],
  hiddenSegsByCol: DayRowEventRange[][],
  renderableSegsByCol: DayRowEventRangePart[][],
  segTops: Map<string, number>,
  heightsByCol: number[],
] {
  let maxCoord: number | undefined
  let maxDepth: number | undefined
  let hiddenConsumes: boolean

  if (dayMaxEvents === true || dayMaxEventRows === true) {
    maxCoord = maxHeight
    hiddenConsumes = true
  } else if (typeof dayMaxEvents === 'number') {
    maxDepth = dayMaxEvents
    hiddenConsumes = false
  } else if (typeof dayMaxEventRows === 'number') {
    maxDepth = dayMaxEventRows
    hiddenConsumes = true
  }

  // NOTE: visibleSegsMap and hiddenSegMap map NEVER overlap for a given event
  // once a seg has a height, the combined potentially-sliced segs will comprise the entire span of the seg
  // if a seg does not have a height yet, it won't be inserted into either visibleSegsMap/hiddenSegMap
  const visibleSegMap = new Map<EventRenderRange, DayRowEventRangePart[]>()
  const hiddenSegMap = new Map<EventRenderRange, DayRowEventRange[]>()
  const segTops = new Map<string, number>()
  const isSlicedMap = new Map<EventRenderRange, boolean>()

  let hierarchy = new SegHierarchy<DayRowEventRange>(
    segs,
    (seg) => segHeightMap.get(getEventPartKey(seg)),
    strictOrder,
    maxCoord,
    maxDepth,
    hiddenConsumes,
    allowSlicing, // will use origin-seg heights, not lookup height
  )
  hierarchy.traverseSegs((seg, segTop) => {
    addToSegMap(visibleSegMap, seg)
    segTops.set(getEventPartKey(seg), segTop)

    if (seg.isSlice) {
      isSlicedMap.set(seg.eventRange, true)
    }
  })
  for (const hiddenSeg of hierarchy.hiddenSegs) {
    addToSegMap(hiddenSegMap, hiddenSeg) // hidden main segs
  }

  // recompute tops while considering slices
  // portions of these slices might be added to hiddenSegMap
  if (isSlicedMap.size) {
    segTops.clear()
    hierarchy = new SegHierarchy<DayRowEventRange>(
      compileSegMap(segs, visibleSegMap),
      (seg) => segHeightMap.get(getEventPartKey(seg)),
      strictOrder,
      maxCoord,
      maxDepth,
      hiddenConsumes,
      // allowSlicing = false
    )
    hierarchy.traverseSegs((seg, segTop) => {
      segTops.set(getEventPartKey(seg), segTop) // newly-hidden main segs and slices
    })
    for (const hiddenSeg of hierarchy.hiddenSegs) {
      addToSegMap(hiddenSegMap, hiddenSeg)
    }
  }

  const segsByCol: DayRowEventRangePart[][] = []
  const hiddenSegsByCol: DayRowEventRange[][] = []
  const renderableSegsByCol: DayRowEventRangePart[][] = []
  const heightsByCol: number[] = []

  for (let col = 0; col < cells.length; col++) {
    segsByCol.push([])
    hiddenSegsByCol.push([])
    renderableSegsByCol.push([])
    heightsByCol.push(0)
  }

  for (const seg of segs) {
    const { eventRange } = seg
    const visibleSegs = visibleSegMap.get(eventRange) || []
    const hiddenSegs = hiddenSegMap.get(eventRange) || []
    const isSliced = isSlicedMap.get(eventRange) || false

    // add orig to renderable
    renderableSegsByCol[seg.start].push(seg)

    // add slices to renderable
    if (isSliced) {
      for (const visibleSeg of visibleSegs) {
        renderableSegsByCol[visibleSeg.start].push(visibleSeg)
      }
    }

    // accumulate segsByCol/heightsByCol for visible segs
    for (const visibleSeg of visibleSegs) {
      for (let col = visibleSeg.start; col < visibleSeg.end; col++) {
        const slice = sliceSegForCol(visibleSeg, col)
        segsByCol[col].push(slice)
      }

      const segKey = getEventPartKey(visibleSeg)
      const segTop = segTops.get(segKey)

      if (segTop != null) { // positioned?
        const segHeight = segHeightMap.get(segKey)

        for (let col = visibleSeg.start; col < visibleSeg.end; col++) {
          heightsByCol[col] = Math.max(heightsByCol[col], segTop + segHeight)
        }
      }
    }

    // accumulate segsByCol/hiddenSegsByCol for hidden segs
    for (const hiddenSeg of hiddenSegs) {
      for (let col = hiddenSeg.start; col < hiddenSeg.end; col++) {
        const slice = sliceSegForCol(hiddenSeg, col)
        segsByCol[col].push(slice)
        hiddenSegsByCol[col].push(slice)
      }
    }
  }

  return [
    segsByCol, // visible and hidden
    hiddenSegsByCol,
    renderableSegsByCol,
    segTops,
    heightsByCol,
  ]
}

// Utils
// -------------------------------------------------------------------------------------------------

function addToSegMap(map: Map<EventRenderRange, DayRowEventRange[]>, seg: DayRowEventRange): void {
  let list = map.get(seg.eventRange)
  if (!list) {
    map.set(seg.eventRange, list = [])
  }
  list.push(seg)
}

/*
Ensures relative order of DayRowEventRange stays consistent with segs
*/
function compileSegMap(
  segs: DayRowEventRange[],
  segMap: Map<EventRenderRange, DayRowEventRange[]>,
): DayRowEventRange[] {
  const res: DayRowEventRange[] = []

  for (const seg of segs) {
    res.push(...(segMap.get(seg.eventRange) || []))
  }

  return res
}
