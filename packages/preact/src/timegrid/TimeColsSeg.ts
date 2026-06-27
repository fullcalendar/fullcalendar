import { CoordRange } from '../coord-range'
import { DateMarker } from '@full-ui/headless-calendar'
import { EventSegUiInteractionState } from '../component/DateComponent'

// JUST A DATA STRUCTURE, not a component

export interface TimeGridRange {
  col: number
  startDate: DateMarker
  endDate: DateMarker
  isStart: boolean
  isEnd: boolean
  showDot?: boolean
}

export type TimeGridCoordRange = TimeGridRange & CoordRange

/*
TODO: more DRY with daygrid?
can be given null/undefined!
*/
export function organizeSegsByCol<S extends TimeGridRange>(segs: S[] | null, colCount: number) {
  let segsByCol: S[][] = []
  let i

  for (i = 0; i < colCount; i += 1) {
    segsByCol.push([])
  }

  if (segs) {
    for (i = 0; i < segs.length; i += 1) {
      segsByCol[segs[i].col].push(segs[i])
    }
  }

  return segsByCol
}

/*
TODO: more DRY with daygrid?
can be given null/undefined!
*/
export function splitInteractionByCol(
  ui: EventSegUiInteractionState<TimeGridRange> | null,
  colCount: number,
): EventSegUiInteractionState<TimeGridRange>[] {
  let byRow: EventSegUiInteractionState<TimeGridRange>[] = []

  if (!ui) {
    for (let i = 0; i < colCount; i += 1) {
      byRow[i] = null
    }
  } else {
    for (let i = 0; i < colCount; i += 1) {
      byRow[i] = {
        affectedInstances: ui.affectedInstances,
        isEvent: ui.isEvent,
        segs: [],
      }
    }

    for (let seg of ui.segs) {
      byRow[seg.col].segs.push(seg)
    }
  }

  return byRow
}
