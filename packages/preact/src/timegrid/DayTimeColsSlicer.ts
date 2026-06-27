import { intersectRanges, DateRange } from '@full-ui/headless-calendar'
import { Slicer } from '../common/slicing-utils'
import { TimeGridRange } from './TimeColsSeg'

export class DayTimeColsSlicer extends Slicer<TimeGridRange, [DateRange[]]> {
  sliceRange(range: DateRange, dayRanges: DateRange[]): TimeGridRange[] {
    let segs: TimeGridRange[] = []

    for (let col = 0; col < dayRanges.length; col += 1) {
      let segRange = intersectRanges(range, dayRanges[col])

      if (segRange) {
        segs.push({
          startDate: segRange.start,
          endDate: segRange.end,
          isStart: segRange.start.valueOf() === range.start.valueOf(),
          isEnd: segRange.end.valueOf() === range.end.valueOf(),
          col,
        })
      }
    }

    return segs
  }
}
