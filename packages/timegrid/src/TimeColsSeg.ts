import { DateMarker, Seg, EventSegUiInteractionState } from '@fullcalendar/core/internal'

// JUST A DATA STRUCTURE, not a component

export interface TimeColsSeg extends Seg {
  col: number
  start: DateMarker
  end: DateMarker
}

export function splitSegsByCol(segs: TimeColsSeg[] | null, colCnt: number) { // can be given null/undefined!
  let segsByCol: TimeColsSeg[][] = []
  let i

  for (i = 0; i < colCnt; i += 1) {
    segsByCol.push([])
  }

  if (segs) {
    for (i = 0; i < segs.length; i += 1) {
      segsByCol[segs[i].col].push(segs[i])
    }
  }

  return segsByCol
}

export function splitInteractionByCol(ui: EventSegUiInteractionState | null, colCnt: number) {
  let byRow: EventSegUiInteractionState[] = []

  if (!ui) {
    for (let i = 0; i < colCnt; i += 1) {
      byRow[i] = null
    }
  } else {
    for (let i = 0; i < colCnt; i += 1) {
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
