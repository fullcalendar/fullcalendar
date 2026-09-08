import { DayGridRange } from './DayTableModel'
import { EventRangeProps } from '../component-util/event-rendering'
import { SlicedCoordRange } from '../coord-range'
import { EventSegUiInteractionState } from '../component/DateComponent'

// TODO: use these types elsewhere

export type DayRowRange = SlicedCoordRange

export type DayRowEventRange = DayRowRange & EventRangeProps

export type DayRowEventRangePart = DayRowEventRange

/** Identifies a DayGrid seg by event instance and start, remaining stable if its end changes. */
export function getDayGridSegKey(seg: DayRowEventRangePart): string {
  return `${seg.eventRange.instance.instanceId}:${seg.start}`
}

// DayGridRange utils (TODO: move)
// -------------------------------------------------------------------------------------------------

export function splitSegsByRow<S extends DayGridRange>(segs: S[], rowCount: number): S[][] {
  const byRow: S[][] = []

  for (let row = 0; row < rowCount; row++) {
    byRow[row] = []
  }

  for (const seg of segs) {
    byRow[seg.row].push(seg)
  }

  return byRow
}

export function splitInteractionByRow(
  ui: EventSegUiInteractionState<DayGridRange> | null,
  rowCount: number,
): EventSegUiInteractionState<DayGridRange>[] {
  const byRow: EventSegUiInteractionState<DayGridRange>[] = []

  if (!ui) {
    for (let row = 0; row < rowCount; row++) {
      byRow[row] = null
    }
  } else {
    for (let row = 0; row < rowCount; row++) {
      byRow[row] = {
        affectedInstances: ui.affectedInstances,
        isEvent: ui.isEvent,
        segs: [],
      }
    }

    for (const seg of ui.segs) {
      byRow[seg.row].segs.push(seg)
    }
  }

  return byRow
}
