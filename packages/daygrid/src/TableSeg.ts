import { EventSegUiInteractionState, Seg } from '@fullcalendar/core'


// this is a DATA STRUCTURE, not a component

export interface TableSeg extends Seg {
  row: number
  firstCol: number
  lastCol: number
}


export function splitSegsByRow(segs: TableSeg[], rowCnt: number) {
  let byRow: TableSeg[][] = []

  for (let i = 0; i < rowCnt; i++) {
    byRow[i] = []
  }

  for (let seg of segs) {
    byRow[seg.row].push(seg)
  }

  return byRow
}


export function splitSegsByFirstCol(segs: TableSeg[], colCnt: number) {
  let byCol: TableSeg[][] = []

  for (let i = 0; i < colCnt; i++) {
    byCol[i] = []
  }

  for (let seg of segs) {
    byCol[seg.firstCol].push(seg)
  }

  return byCol
}


export function splitInteractionByRow(ui: EventSegUiInteractionState | null, rowCnt: number) {
  let byRow: EventSegUiInteractionState[] = []

  if (!ui) {
    for (let i = 0; i < rowCnt; i++) {
      byRow[i] = null
    }

  } else {
    for (let i = 0; i < rowCnt; i++) {
      byRow[i] = {
        affectedInstances: ui.affectedInstances,
        isEvent: ui.isEvent,
        segs: []
      }
    }

    for (let seg of ui.segs) {
      byRow[seg.row].segs.push(seg)
    }
  }

  return byRow
}
