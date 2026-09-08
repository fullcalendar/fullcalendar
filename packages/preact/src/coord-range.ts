import { EventRangeProps } from './component-util/event-rendering'
import { DateMarker } from '@full-ui/headless-calendar'

/*
TODO: try to move everything to CoordRange
*/
export interface CoordSpan {
  start: number
  size: number
}

export interface CoordRange {
  start: number
  end: number
}

export interface SlicedCoordRange extends CoordRange {
  isStart: boolean
  isEnd: boolean
}

// NOTE: numeric span algebra (intersection, subtraction, unions, sorted
// searches) lives in seg-placement/span-math.ts; CoordRange is structurally
// identical to its LateralSpan.

// { eventRange }
// -------------------------------------------------------------------------------------------------

export function computeEarliestStart(segs: EventRangeProps[]): DateMarker {
  return segs.reduce(pickEarliestStart).eventRange.range.start
}

export function computeLatestEnd(segs: EventRangeProps[]): DateMarker {
  return segs.reduce(pickLatestEnd).eventRange.range.end
}

function pickEarliestStart(
  r0: EventRangeProps,
  r1: EventRangeProps,
): EventRangeProps {
  return r0.eventRange.range.start < r1.eventRange.range.start ? r0 : r1
}

function pickLatestEnd(
  r0: EventRangeProps,
  r1: EventRangeProps,
): EventRangeProps {
  return r0.eventRange.range.end > r1.eventRange.range.end ? r0 : r1
}
