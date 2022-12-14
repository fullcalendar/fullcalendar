import {
  SegSpan,
  SegEntry,
  SegEntryGroup,
  DateMarker,
} from '@fullcalendar/core/internal'
import { TimeColsSeg } from './TimeColsSeg.js'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords.js'
import { SegWebRect, buildPositioning } from './seg-web.js'

// public interface
// ------------------------------------------------------------------------------------------

export interface TimeColFgSegPlacement {
  seg: TimeColsSeg
  rect: SegWebRect | null
}

export function computeSegVCoords(
  segs: TimeColsSeg[],
  colDate: DateMarker,
  slatCoords: TimeColsSlatsCoords = null,
  eventMinHeight: number = 0, // might be null/undefined :(
): SegSpan[] {
  let vcoords: SegSpan[] = []

  if (slatCoords) {
    for (let i = 0; i < segs.length; i += 1) {
      let seg = segs[i]
      let spanStart = slatCoords.computeDateTop(seg.start, colDate)
      let spanEnd = Math.max(
        spanStart + (eventMinHeight || 0), // :(
        slatCoords.computeDateTop(seg.end, colDate),
      )
      vcoords.push({
        start: Math.round(spanStart), // for barely-overlapping collisions
        end: Math.round(spanEnd), //
      })
    }
  }

  return vcoords
}

export function computeFgSegPlacements(
  segs: TimeColsSeg[],
  segVCoords: SegSpan[], // might not have for every seg
  eventOrderStrict?: boolean,
  eventMaxStack?: number,
): { segPlacements: TimeColFgSegPlacement[], hiddenGroups: SegEntryGroup[] } {
  let segInputs: SegEntry[] = []
  let dumbSegs: TimeColsSeg[] = [] // segs without coords

  for (let i = 0; i < segs.length; i += 1) {
    let vcoords = segVCoords[i]
    if (vcoords) {
      segInputs.push({
        index: i,
        thickness: 1,
        span: vcoords,
      })
    } else {
      dumbSegs.push(segs[i])
    }
  }

  let { segRects, hiddenGroups } = buildPositioning(segInputs, eventOrderStrict, eventMaxStack)
  let segPlacements: TimeColFgSegPlacement[] = []

  for (let segRect of segRects) {
    segPlacements.push({
      seg: segs[segRect.index],
      rect: segRect,
    })
  }

  for (let dumbSeg of dumbSegs) {
    segPlacements.push({ seg: dumbSeg, rect: null })
  }

  return { segPlacements, hiddenGroups }
}
