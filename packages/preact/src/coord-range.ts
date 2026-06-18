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

export function doCoordRangesIntersect(r0: CoordRange, r1: CoordRange): boolean {
  return r0.end > r1.start && r0.start < r1.end
}

export function intersectCoordRanges(
  r0: SlicedCoordRange,
  r1: CoordRange
): SlicedCoordRange {
  const start = Math.max(r0.start, r1.start)
  const end = Math.min(r0.end, r1.end)

  if (start < end) {
    return {
      start,
      end,
      isStart: r0.isStart && start === r0.start,
      isEnd: r0.isEnd && end === r0.end,
    }
  }
}

export function joinCoordRanges(r0: CoordRange, r1: CoordRange): CoordRange {
  return {
    start: Math.min(r0.start, r1.start),
    end: Math.max(r0.end, r1.end),
  }
}

export function getCoordRangeEnd(r: CoordRange) {
  return r.end
}

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
